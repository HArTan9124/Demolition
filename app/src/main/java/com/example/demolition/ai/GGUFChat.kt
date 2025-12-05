package com.example.demolition.ai

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object GGUFChat {

    private const val TAG = "GGUFChat"

    suspend fun ask(modelPath: String, prompt: String): String =
        withContext(Dispatchers.IO) {
            
            // Check if native libraries are loaded
            if (!LlamaNative.isLibraryLoaded()) {
                val error = LlamaNative.getLoadError() ?: "Native libraries not loaded"
                Log.e(TAG, "Cannot generate response: $error")
                return@withContext "Error: $error"
            }

            try {
                // Validate model path
                if (modelPath.isBlank()) {
                    throw IllegalArgumentException("Model path is empty")
                }

                Log.d(TAG, "Loading model from: $modelPath")
                val modelPtr = LlamaNative.loadModel(modelPath)
                if (modelPtr == 0L) {
                    throw IllegalStateException("Failed to load model: invalid model pointer")
                }
                Log.d(TAG, "Model loaded successfully, pointer: $modelPtr")

                Log.d(TAG, "Creating context...")
                val ctxPtr = LlamaNative.createContext(modelPtr)
                if (ctxPtr == 0L) {
                    LlamaNative.freeModel(modelPtr)
                    throw IllegalStateException("Failed to create context: invalid context pointer")
                }
                Log.d(TAG, "Context created successfully, pointer: $ctxPtr")

                Log.d(TAG, "Generating response for prompt: \"${prompt.take(50)}...\"")
                val output = LlamaNative.generateText(ctxPtr, prompt)
                Log.d(TAG, "Response generated (${output.length} chars): \"${output.take(100)}...\"")

                // Clean up
                LlamaNative.freeContext(ctxPtr)
                LlamaNative.freeModel(modelPtr)
                Log.d(TAG, "Resources freed successfully")

                return@withContext output

            } catch (e: IllegalStateException) {
                Log.e(TAG, "GGUF operation failed", e)
                return@withContext "Error: ${e.message}"
            } catch (e: IllegalArgumentException) {
                Log.e(TAG, "Invalid argument", e)
                return@withContext "Error: ${e.message}"
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error in GGUF chat", e)
                return@withContext "Error: ${e.message ?: "Unknown error occurred"}"
            }
        }
}
