package com.example.demolition

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class MainActivity : AppCompatActivity() {

    private lateinit var tvUserName: TextView
    private lateinit var ivUserProfile: ImageView
    private lateinit var firestore: FirebaseFirestore
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        // Edge Padding Fix
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.ll_main_root)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        firestore = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()

        tvUserName = findViewById(R.id.tv_username)
        ivUserProfile = findViewById(R.id.iv_user_profile)

        loadAiProfile()
    }

    private fun loadAiProfile() {
        val userId = auth.currentUser?.uid ?: return

        firestore.collection("ai_profiles")
            .document(userId)
            .addSnapshotListener { snapshot, error ->

                if (error != null) return@addSnapshotListener
                if (snapshot != null && snapshot.exists()) {

                    val profile = snapshot.toObject(AiProfile::class.java)

                    profile?.let {
                        // 🔥 Set AI Name instead of "Username!"
                        tvUserName.text = it.aiName.ifEmpty { "My AI" }

                        // 🔥 Load avatar (if needed)
                        if (it.avatarId.isNotEmpty()) {
                            val avatarRes = resources.getIdentifier(it.avatarId, "drawable", packageName)
                            if (avatarRes != 0) {
                                ivUserProfile.setImageResource(avatarRes)
                            }
                        }
                    }
                }
            }
    }
}
