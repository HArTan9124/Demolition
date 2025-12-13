package com.example.demolition

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.text.TextWatcher
import android.text.Editable
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

    private var recyclerView: RecyclerView? = null
    private var inputEditText: EditText? = null
    private var sendButton: ImageButton? = null
    private var progressBar: ProgressBar? = null
    private var instructionsContainer: LinearLayout? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_ai_chatter, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.chatRecycler)
        inputEditText = view.findViewById(R.id.inputMessage)
        sendButton = view.findViewById(R.id.sendBtn)
        progressBar = view.findViewById(R.id.loadingProgress)
        instructionsContainer = view.findViewById(R.id.instructionsContainer)
        
        val keyboardToggle = view.findViewById<ImageButton>(R.id.keyboardToggle)
        val customKeyboardView = view.findViewById<View>(R.id.customKeyboard)

        recyclerView?.layoutManager = LinearLayoutManager(requireContext())
        adapter = AiChatAdapter(messages)
        recyclerView?.adapter = adapter

        // Show instructions initially, hide chat
        instructionsContainer?.visibility = View.VISIBLE
        recyclerView?.visibility = View.GONE

        // Show loading indicator
        progressBar?.visibility = View.VISIBLE
        sendButton?.isEnabled = false

        // Load GGUF model in background (lifecycle-aware)
        loadModelAsync()

        // Setup Custom Keyboard
        setupCustomKeyboard(view)

        // Keyboard Toggle Logic
        keyboardToggle.setOnClickListener {
            val inputMethodManager = requireContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
            
            if (customKeyboardView.visibility == View.VISIBLE) {
                // Switch to System Keyboard
                customKeyboardView.visibility = View.GONE
                inputEditText?.requestFocus()
                inputMethodManager.showSoftInput(inputEditText, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT)
                recyclerView?.scrollToPosition(messages.size - 1)
            } else {
                // Switch to Custom Keyboard
                inputMethodManager.hideSoftInputFromWindow(inputEditText?.windowToken, 0)
                customKeyboardView.visibility = View.VISIBLE
                // Scroll to bottom to ensure input isn't covered
                recyclerView?.postDelayed({
                    recyclerView?.scrollToPosition(messages.size - 1)
                }, 100)
            }
        }

        // Hide custom keyboard when user taps input (system keyboard will open)
        inputEditText?.setOnClickListener {
            if (customKeyboardView.visibility == View.VISIBLE) {
                customKeyboardView.visibility = View.GONE
            }
        }
        
        // Also hide on focus
        inputEditText?.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus && customKeyboardView.visibility == View.VISIBLE) {
                customKeyboardView.visibility = View.GONE
            }
        }

        // Add text watcher to hide instructions when user starts typing
        inputEditText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (!s.isNullOrEmpty()) {
                    // User started typing, hide instructions and show chat
                    if (instructionsContainer?.visibility == View.VISIBLE) {
                        instructionsContainer?.visibility = View.GONE
                        recyclerView?.visibility = View.VISIBLE
                    }
                }
            }
        })

        // Handle send message
        sendButton?.setOnClickListener {
            handleSendMessage()
        }
    }

    private fun setupCustomKeyboard(rootView: View) {
        val customKeyboard = rootView.findViewById<ViewGroup>(R.id.customKeyboard) ?: return
        val input = inputEditText ?: return

        // Recursive function to find all buttons
        fun setListeners(view: View) {
            if (view is ViewGroup) {
                for (i in 0 until view.childCount) {
                    setListeners(view.getChildAt(i))
                }
            } else if (view is android.widget.Button) { // Handles Button and ImageButton (if castable)
                view.setOnClickListener { v ->
                    val tag = v.tag?.toString() ?: return@setOnClickListener
                    
                    if (tag == "DEL") {
                        val cursor = input.selectionStart
                        if (cursor > 0) {
                            input.text.delete(cursor - 1, cursor)
                        }
                    } else if (tag == "ENTER") { // If we add enter later
                         input.append("\n")
                    } else {
                        val start = input.selectionStart.coerceAtLeast(0)
                        val end = input.selectionEnd.coerceAtLeast(0)
                        input.text.replace(start.coerceAtMost(end), start.coerceAtLeast(end), tag)
                    }
                }
            }
        }
        setListeners(customKeyboard)
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

        // Hide instructions and show chat when sending first message
        if (instructionsContainer?.visibility == View.VISIBLE) {
            instructionsContainer?.visibility = View.GONE
            recyclerView?.visibility = View.VISIBLE
        }

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
            // Add typing indicator
            val typingIndex = messages.size
            messages.add(ChatMessage("Typing...", false))
            adapter.notifyItemInserted(typingIndex)
            recyclerView?.scrollToPosition(typingIndex)

            lifecycleScope.launch {
                val greeting = handleGreeting(question)
                // Replace typing with actual response
                messages[typingIndex] = ChatMessage(greeting, false)
                adapter.notifyItemChanged(typingIndex)
                recyclerView?.scrollToPosition(typingIndex)
            }
            return
        }

        // Add typing indicator before starting AI generation
        val typingIndex = messages.size
        messages.add(ChatMessage("Typing...", false))
        adapter.notifyItemInserted(typingIndex)
        recyclerView?.scrollToPosition(typingIndex)

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
                    // Replace typing indicator with actual response
                    if (typingIndex < messages.size) {
                        messages[typingIndex] = ChatMessage(reply, false)
                        adapter.notifyItemChanged(typingIndex)
                    } else {
                        messages.add(ChatMessage(reply, false))
                        adapter.notifyItemInserted(messages.size - 1)
                    }
                    recyclerView?.scrollToPosition(messages.size - 1)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error generating AI response", e)
                
                withContext(Dispatchers.Main) {
                    val errorMsg = "⚠ Error: ${e.message ?: "Failed to generate response"}"
                    // Replace typing indicator with error message
                    if (typingIndex < messages.size) {
                        messages[typingIndex] = ChatMessage(errorMsg, false)
                        adapter.notifyItemChanged(typingIndex)
                    } else {
                        messages.add(ChatMessage(errorMsg, false))
                        adapter.notifyItemInserted(messages.size - 1)
                    }
                    recyclerView?.scrollToPosition(messages.size - 1)
                }
            }
        }
    }
    
    /**
     * Clean AI output to remove markdown symbols and special tokens.
     * IMPORTANT: Preserve LaTeX markers ($$, \(, \[, etc.) for math rendering.
     */
    private fun cleanAIOutput(text: String): String {
        // First, temporarily replace LaTeX markers to protect them
        val latexProtected = text
            .replace("$$", "§§LATEX_BLOCK§§")
            .replace("\\(", "§§LATEX_INLINE_START§§")
            .replace("\\)", "§§LATEX_INLINE_END§§")
            .replace("\\[", "§§LATEX_DISPLAY_START§§")
            .replace("\\]", "§§LATEX_DISPLAY_END§§")
        
        // Clean markdown formatting and special tokens
        val cleaned = latexProtected
            // Remove special Gemma tokens that shouldn't be visible
            .replace("<end_of_turn>", "")
            .replace("<start_of_turn>", "")
            .replace("<eos>", "")
            .replace("<bos>", "")
            // Convert bullet asterisks to proper bullets FIRST
            .replace(Regex("""^\s*\*+\s+""", RegexOption.MULTILINE), "• ")
            .replace(Regex("""\n\s*\*+\s+"""), "\n• ")
            // Remove ALL remaining asterisks (but LaTeX is already protected)
            .replace("**", "")
            .replace("*", "")
            // Clean up any underscores used for formatting
            .replace("__", "")
            .trim()
        
        // Restore LaTeX markers
        return cleaned
            .replace("§§LATEX_BLOCK§§", "$$")
            .replace("§§LATEX_INLINE_START§§", "\\(")
            .replace("§§LATEX_INLINE_END§§", "\\)")
            .replace("§§LATEX_DISPLAY_START§§", "\\[")
            .replace("§§LATEX_DISPLAY_END§§", "\\]")
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
