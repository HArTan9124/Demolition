package com.example.demolition.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object GGUFChat {

    suspend fun ask(modelPath: String, prompt: String): String =
        withContext(Dispatchers.IO) {

            val modelPtr = LlamaNative.loadModel(modelPath)
            val ctxPtr = LlamaNative.createContext(modelPtr)

            val output = LlamaNative.generateText(ctxPtr, prompt)

            LlamaNative.freeContext(ctxPtr)
            LlamaNative.freeModel(modelPtr)

            return@withContext output
        }
}
