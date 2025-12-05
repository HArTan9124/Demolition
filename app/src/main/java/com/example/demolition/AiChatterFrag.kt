package com.example.demolition

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.demolition.ai.GGUFModelLoader
import com.example.demolition.models.AiChatAdapter
import com.example.demolition.models.ChatMessage
import com.example.demolition.ai.GGUFChat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AiChatterFrag : Fragment() {

    private lateinit var adapter: AiChatAdapter
    private val messages = ArrayList<ChatMessage>()

    private lateinit var modelPath: String

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_ai_chatter, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recycler = view.findViewById<RecyclerView>(R.id.chatRecycler)
        recycler.layoutManager = LinearLayoutManager(requireContext())
        adapter = AiChatAdapter(messages)
        recycler.adapter = adapter

        val input = view.findViewById<EditText>(R.id.inputMessage)
        val send = view.findViewById<ImageButton>(R.id.sendBtn)

        // ------------------------------------
        // LOAD GGUF MODEL (background thread)
        // ------------------------------------
        GlobalScope.launch(Dispatchers.IO) {
            modelPath = GGUFModelLoader.loadModel(requireContext())
        }

        // ------------------------------------
        // HANDLE SEND MESSAGE
        // ------------------------------------
        send.setOnClickListener {
            val question = input.text.toString()
            if (question.isEmpty()) return@setOnClickListener

            input.text.clear()

            messages.add(ChatMessage(question, true))
            adapter.notifyItemInserted(messages.size - 1)
            recycler.scrollToPosition(messages.size - 1)

            GlobalScope.launch(Dispatchers.IO) {

                // Prevent crash if model not loaded yet
                if (!::modelPath.isInitialized) {
                    val reply = "⚠ Model is still loading. Please wait..."
                    withContext(Dispatchers.Main) {
                        messages.add(ChatMessage(reply, false))
                        adapter.notifyItemInserted(messages.size - 1)
                    }
                    return@launch
                }

                val reply = GGUFChat.ask(modelPath, question)

                withContext(Dispatchers.Main) {
                    messages.add(ChatMessage(reply, false))
                    adapter.notifyItemInserted(messages.size - 1)
                    recycler.scrollToPosition(messages.size - 1)
                }
            }
        }
    }
}
