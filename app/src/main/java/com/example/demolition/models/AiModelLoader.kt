package com.example.demolition.models

import android.content.Context
import koboldcpp.android.Kobold
import koboldcpp.android.KoboldModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

object AiModelLoader {

    private var model: KoboldModel? = null

    suspend fun loadModel(context: Context): KoboldModel = withContext(Dispatchers.IO) {

        // Already loaded?
        model?.let { return@withContext it }

        // Copy from assets to internal storage
        val modelFile = File(context.filesDir, "gemma.gguf")
        if (!modelFile.exists()) {
            context.assets.open("models/gemma.gguf").use { input ->
                modelFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
        }

        // Load GGUF using Kobold
        val loaded = Kobold.load(
            context = context,
            modelPath = modelFile.absolutePath,
            threads = 4,          // Adjust based on device
            gpuLayers = 0         // CPU only (safe)
        )

        model = loaded
        return@withContext loaded
    }
}
