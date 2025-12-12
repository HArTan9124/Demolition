package com.example.demolition

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
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

    // RAG Pipeline
    private val ragPipeline = com.example.demolition.rag.RAGPipeline()
    private var isRagReady = false

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
                    showCorrectToast("AI Model Ready ✓")
                }
                
                // Initialize RAG pipeline
                try {
                    Log.d(TAG, "Initializing RAG pipeline...")
                    ragPipeline.initialize(requireContext())
                    isRagReady = true
                    Log.d(TAG, "RAG pipeline ready with ${ragPipeline.getIndexSize()} chunks")
                    
                    withContext(Dispatchers.Main) {
                        showInfoToast("📚 Knowledge base loaded")
                        addGreeting()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to initialize RAG pipeline", e)
                    isRagReady = false
                    withContext(Dispatchers.Main) {
                        showInfoToast("⚠ RAG initialization failed, using basic AI")
                        addGreeting()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to load model", e)
                isModelLoading = false
                modelLoadError = e.message ?: "Unknown error loading model"
                
                withContext(Dispatchers.Main) {
                    progressBar?.visibility = View.GONE
                    sendButton?.isEnabled = false
                    showErrorToast("⚠ Failed to load AI model: ${e.message}")
                }
            }
        }
    }
    private fun addGreeting() {
        // Add a simple greeting from the AI
        val greeting = if (isRagReady) {
            "👋 Hello! I'm ready to help with your studies. Ask me anything about your curriculum!"
        } else {
            "👋 Hello! I'm ready to help. Ask me anything!"
        }
        messages.add(ChatMessage(greeting, false))
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

        // Check if it's a greeting - respond warmly without RAG
        if (isGreeting(question)) {
            lifecycleScope.launch {
                val greeting = handleGreeting(question)
                messages.add(ChatMessage(greeting, false))
                adapter.notifyItemInserted(messages.size - 1)
                recyclerView?.scrollToPosition(messages.size - 1)
            }
            return
        }

        // Generate AI response with RAG context
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                // Retrieve context using RAG (if available)
                val context = if (isRagReady) {
                    try {
                        val ragResult = ragPipeline.query(question, topK = 3)
                        if (ragResult.hasContext()) {
                            Log.d(TAG, "RAG retrieved ${ragResult.getChunkCount()} relevant chunks")
                            ragResult.context
                        } else {
                            Log.d(TAG, "No relevant context found, using direct question")
                            null
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "RAG query failed, falling back to direct question", e)
                        null
                    }
                } else {
                    null
                }
                
                // Generate response with or without context
                var reply = GGUFChat.ask(modelPath!!, question, context)
                
                // Post-process to remove any asterisks the AI still generated
                reply = cleanAIOutput(reply)

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
    
    /**
     * Clean AI output to remove markdown symbols the model might still generate.
     */
    private fun cleanAIOutput(text: String): String {
        return text
            // Convert bullet asterisks to proper bullets FIRST
            .replace(Regex("^\\s*\\*+\\s+", RegexOption.MULTILINE), "• ")
            .replace(Regex("\\n\\s*\\*+\\s+"), "\n• ")
            // Remove ALL remaining asterisks
            .replace("**", "")
            .replace("*", "")
            // Clean up any underscores used for formatting
            .replace("__", "")
            .trim()
    }

    private fun isGreeting(text: String): Boolean {
        val greetings = listOf(
            "hi", "hello", "hey", "good morning", "good afternoon", 
            "good evening", "good night", "what's up", "whats up",
            "how are you", "namaste", "sup", "yo", "hola", "hii", "heya"
        )
        val normalized = text.trim().lowercase()
        return greetings.any { normalized.startsWith(it) || normalized == it }
    }

    private fun handleGreeting(question: String): String {
        return """Hi there! 👋 I'm your study assistant, ready to help you learn.

I can help you with:
• Math, Science, English, and Social Science concepts
• Chapter summaries and explanations  
• Practice questions and quiz preparation
• Clarifying any doubts you have

What would you like to know about today?"""
    }

    override fun onDestroyView() {
        super.onDestroyView()
        // Clear view references to prevent memory leaks
        recyclerView = null
        inputEditText = null
        sendButton = null
        progressBar = null
    }

    private fun showCorrectToast(message: String) {
        val layout = LayoutInflater.from(requireContext()).inflate(R.layout.correct_toast, null)
        layout.findViewById<TextView>(R.id.toast_text).text = message
        val toast = Toast(requireContext())
        toast.duration = Toast.LENGTH_SHORT
        @Suppress("DEPRECATION")
        toast.view = layout
        toast.show()
    }

    private fun showErrorToast(message: String) {
        val layout = LayoutInflater.from(requireContext()).inflate(R.layout.error_toast, null)
        layout.findViewById<TextView>(R.id.toast_text).text = message
        val toast = Toast(requireContext())
        toast.duration = Toast.LENGTH_SHORT
        @Suppress("DEPRECATION")
        toast.view = layout
        toast.show()
    }

    private fun showInfoToast(message: String) {
        val layout = LayoutInflater.from(requireContext()).inflate(R.layout.toast_info, null)
        layout.findViewById<TextView>(R.id.toast_text).text = message
        val toast = Toast(requireContext())
        toast.duration = Toast.LENGTH_SHORT
        @Suppress("DEPRECATION")
        toast.view = layout
        toast.show()
    }
}
