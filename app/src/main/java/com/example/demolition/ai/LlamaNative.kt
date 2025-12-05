package com.example.demolition.ai

object LlamaNative {

    init {
        System.loadLibrary("ggml")
        System.loadLibrary("ggml-cpu")
        System.loadLibrary("llama")
        System.loadLibrary("native-lib")
    }

    external fun loadModel(path: String): Long
    external fun createContext(modelPtr: Long): Long
    external fun generateText(ctxPtr: Long, prompt: String): String
    external fun freeContext(ctxPtr: Long)
    external fun freeModel(modelPtr: Long)
    external fun generate(modelPath: String, prompt: String): String
}
