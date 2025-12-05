package com.example.demolition.models

import koboldcpp.android.KoboldModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AiModel(private val model: KoboldModel) {

    suspend fun ask(question: String): String {
        return withContext(Dispatchers.IO) {
            model.generate(
                prompt = question,
                maxTokens = 200,
                temperature = 0.6f,
                topK = 40
            )
        }
    }
}
