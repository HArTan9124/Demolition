package com.example.demolition.ai

import android.content.Context
import java.io.File
import java.io.IOException

object GGUFModelLoader {

    // Suspended function that returns the file path of the copied model
    @Throws(IOException::class)
    suspend fun loadModel(context: Context): String {
        // path in app files
        val outFile = File(context.filesDir, "gemma.gguf")

        // If already exists, return path immediately
        if (outFile.exists()) return outFile.absolutePath

        // Ensure parent exists
        outFile.parentFile?.mkdirs()

        // Assets path: assets/models/gemma.gguf
        context.assets.open("models/gemma.gguf").use { input ->
            outFile.outputStream().use { out ->
                input.copyTo(out)
                out.flush()
            }
        }

        return outFile.absolutePath
    }
}
