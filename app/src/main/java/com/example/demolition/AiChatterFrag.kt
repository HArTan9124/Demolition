package com.example.demolition

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.demolition.ai.GGUFModelLoader
import com.example.demolition.models.AiChatAdapter
import com.example.demolition.models.ChatMessage
import com.example.demolition.ai.GGUFChat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AiChatterFrag : Fragment() {

    private val TAG = "AiChatterFrag"
    
    private lateinit var adapter: AiChatAdapter
    private val messages = ArrayList<ChatMessage>()

    private var modelPath: String? = null
    private var isModelLoading = true
    private var modelLoadError: String? = null

    // View references
    private var recyclerView: RecyclerView? = null
    private var inputEditText: EditText? = null
    private var sendButton: ImageButton? = null
    private var progressBar: ProgressBar? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_ai_chatter, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize views
        recyclerView = view.findViewById(R.id.chatRecycler)
        inputEditText = view.findViewById(R.id.inputMessage)
        sendButton = view.findViewById(R.id.sendBtn)
        progressBar = view.findViewById(R.id.loadingProgress)

        recyclerView?.layoutManager = LinearLayoutManager(requireContext())
        adapter = AiChatAdapter(messages)
        recyclerView?.adapter = adapter

        // Show loading indicator
        progressBar?.visibility = View.VISIBLE
        sendButton?.isEnabled = false

        // Load GGUF model in background (lifecycle-aware)
        loadModelAsync()

        // Handle send message
        sendButton?.setOnClickListener {
            handleSendMessage()
        }
    }

    private fun loadModelAsync() {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                Log.d(TAG, "Loading GGUF model...")
                modelPath = GGUFModelLoader.loadModel(requireContext())
                isModelLoading = false
                
                withContext(Dispatchers.Main) {
                    progressBar?.visibility = View.GONE
                    sendButton?.isEnabled = true
                    Log.d(TAG, "Model loaded successfully: $modelPath")
                    Toast.makeText(context, "AI Model Ready ✓", Toast.LENGTH_SHORT).show()
                    
                    // Add a greeting message from the AI to show it's ready
                    addGreeting()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to load model", e)
                isModelLoading = false
                modelLoadError = e.message ?: "Unknown error loading model"
                
                withContext(Dispatchers.Main) {
                    progressBar?.visibility = View.GONE
                    sendButton?.isEnabled = false
                    Toast.makeText(
                        context,
                        "⚠ Failed to load AI model: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun addGreeting() {
        // Add a simple greeting from the AI
        messages.add(ChatMessage("👋 Hello! I'm ready to help. Ask me anything!", false))
        adapter.notifyItemInserted(messages.size - 1)
        recyclerView?.scrollToPosition(messages.size - 1)
    }

    private fun handleSendMessage() {
        val question = inputEditText?.text?.toString() ?: ""
        if (question.isEmpty()) return

        inputEditText?.text?.clear()

        // Add user message
        messages.add(ChatMessage(question, true))
        adapter.notifyItemInserted(messages.size - 1)
        recyclerView?.scrollToPosition(messages.size - 1)

        // Check model status before generating response
        if (modelLoadError != null) {
            messages.add(ChatMessage("⚠ AI model failed to load: $modelLoadError", false))
            adapter.notifyItemInserted(messages.size - 1)
            recyclerView?.scrollToPosition(messages.size - 1)
            return
        }

        if (isModelLoading || modelPath == null) {
            messages.add(ChatMessage("⏳ Model is still loading. Please wait...", false))
            adapter.notifyItemInserted(messages.size - 1)
            recyclerView?.scrollToPosition(messages.size - 1)
            return
        }

        // Generate AI response
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val reply = GGUFChat.ask(modelPath!!, question)

                withContext(Dispatchers.Main) {
                    messages.add(ChatMessage(reply, false))
                    adapter.notifyItemInserted(messages.size - 1)
                    recyclerView?.scrollToPosition(messages.size - 1)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error generating AI response", e)
                
                withContext(Dispatchers.Main) {
                    val errorMsg = "⚠ Error: ${e.message ?: "Failed to generate response"}"
                    messages.add(ChatMessage(errorMsg, false))
                    adapter.notifyItemInserted(messages.size - 1)
                    recyclerView?.scrollToPosition(messages.size - 1)
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        // Clear view references to prevent memory leaks
        recyclerView = null
        inputEditText = null
        sendButton = null
        progressBar = null
    }
}
