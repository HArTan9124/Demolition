package com.example.demolition

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.demolition.databinding.ActivityEditProfileBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class EditProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditProfileBinding
    private val db = FirebaseFirestore.getInstance()
    private val userId = FirebaseAuth.getInstance().currentUser?.uid

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {

        // ⭐ OPEN CustomAi WHEN CLICKING PROFILE IMAGE
        binding.ivProfile.setOnClickListener {
            val intent = Intent(this, CustomAi::class.java)
            startActivity(intent)
        }

        // ⭐ Save to Firestore
        binding.btnSave.setOnClickListener {
            if (userId == null) {
                Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val name = binding.etName.text.toString()
            val email = binding.etEmail.text.toString()
            val phone = binding.etPhone.text.toString()

            val data = mapOf(
                "name" to name,
                "email" to email,
                "phone" to phone
            )

            db.collection("users")
                .document(userId)
                .update(data)
                .addOnSuccessListener {
                    Toast.makeText(this, "Profile Updated Successfully", Toast.LENGTH_SHORT).show()
                }
                .addOnFailureListener {
                    Toast.makeText(this, "Failed to update: ${it.message}", Toast.LENGTH_LONG).show()
                }
        }
    }
}
