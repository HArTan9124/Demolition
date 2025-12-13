package com.example.demolition


import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.demolition.utils.ToastUtils
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.auth.FirebaseAuth

class Signup : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var emailEditText: TextInputEditText
    private lateinit var passwordEditText: TextInputEditText
    private lateinit var confirmPasswordEditText: TextInputEditText
    private lateinit var signupButton: Button
    private lateinit var loginText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        auth = FirebaseAuth.getInstance()

        emailEditText = findViewById(R.id.editTextEmail)
        passwordEditText = findViewById(R.id.editTextPassword)
        confirmPasswordEditText = findViewById(R.id.editTextConfirmPassword)
        signupButton = findViewById(R.id.btnSignUp)
        loginText = findViewById(R.id.loginText)

        signupButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            val confirmPassword = confirmPasswordEditText.text.toString().trim()

            if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                ToastUtils.showErrorToast(this, "All fields are required")
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                ToastUtils.showErrorToast(this, "Passwords do not match")
                return@setOnClickListener
            }

            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        ToastUtils.showCorrectToast(this, "Signup Successful")
                        startActivity(Intent(this, UserData::class.java))
                        finish()
                    } else {
                        ToastUtils.showErrorToast(this, "Signup Failed: ${task.exception?.message}")
                    }
                }
        }

        loginText.setOnClickListener {
            startActivity(Intent(this, Login::class.java))
        }
    }
}
