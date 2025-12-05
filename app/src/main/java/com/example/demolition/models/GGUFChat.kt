package com.example.demolition.models

import com.example.demolition.ai.LlamaNative      // ✅ FIXED IMPORT

object GGUFChat {

    fun ask(modelPath: String, prompt: String): String {
        // Calls your JNI wrapper that loads model & generates text
        return LlamaNative.generate(modelPath, prompt)
    }
}
