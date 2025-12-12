package com.example.demolition.models

import com.example.demolition.ai.LlamaNative

object GGUFChat {

    fun ask(modelPath: String, prompt: String, context: String? = null): String {
        val finalPrompt = if (context != null && context.isNotBlank()) {
            // Context-aware prompt - friendly but focused
            """You are a helpful, friendly educational assistant for students!

IMPORTANT RULES:
1. ONLY use information from the context below
2. Do NOT add facts that are not provided
3. Do NOT mix information from different topics
4. Be warm, conversational, and encouraging
5. You can use emojis to be friendly! 😊
6. But DO NOT use **, *, or any markdown formatting symbols

CONTEXT:
$context

QUESTION: $prompt

Give a clear, friendly answer using ONLY the context. Be warm and helpful, use emojis if appropriate, but no **, *, or markdown symbols!"""
        } else {
            // General prompt - friendly and helpful
            """You are a friendly educational assistant for students! 📚

Student asks: $prompt

Give a brief, helpful answer. Be warm and encouraging, use emojis if appropriate, but no ** or * or markdown symbols!"""
        }
        
        return LlamaNative.generate(modelPath, finalPrompt)
    }
}
