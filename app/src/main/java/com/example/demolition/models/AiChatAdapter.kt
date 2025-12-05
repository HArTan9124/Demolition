package com.example.demolition.models

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.demolition.R

class AiChatAdapter(private val messages: ArrayList<com.example.demolition.models.ChatMessage>) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        const val USER = 0
        const val AI = 1
    }

    override fun getItemViewType(position: Int): Int {
        return if (messages[position].isUser) USER else AI
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == USER) {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_user_message, parent, false)
            UserHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_ai_message, parent, false)
            AiHolder(view)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val msg = messages[position]
        if (holder is UserHolder) holder.msg.text = msg.text
        else if (holder is AiHolder) holder.msg.text = msg.text
    }

    override fun getItemCount() = messages.size

    class UserHolder(view: View) : RecyclerView.ViewHolder(view) {
        val msg: TextView = view.findViewById(R.id.userMsg)
    }

    class AiHolder(view: View) : RecyclerView.ViewHolder(view) {
        val msg: TextView = view.findViewById(R.id.aiMsg)
    }
}
