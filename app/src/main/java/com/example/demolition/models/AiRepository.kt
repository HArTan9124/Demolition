package com.example.demolition.models

class AiRepository {

    private val history = StringBuilder()

    fun addMessage(userMsg: String, aiMsg: String) {
        history.append("Student: $userMsg\n")
        history.append("AI: $aiMsg\n")
    }

    fun getHistory(): String {
        return history.toString()
    }
}
