package com.example.demolition


import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
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
                Toast.makeText(this, "All fields are required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        showCorrectToast("Login Successful")
                        startActivity(Intent(this, UserData::class.java))
                        finish()
                    } else {
                        showErrorToast("Login Failed: ${task.exception?.message}")
                    }
                }
        }

        loginText.setOnClickListener {
            startActivity(Intent(this, Login::class.java))
        }
    }

    private fun showCorrectToast(message: String) {
        val layout = layoutInflater.inflate(R.layout.correct_toast, findViewById(R.id.toast_container))
        layout.findViewById<TextView>(R.id.toast_text).text = message

        val toast = Toast(applicationContext)
        toast.view = layout
        toast.duration = Toast.LENGTH_SHORT
        toast.show()
    }

    private fun showErrorToast(message: String) {
        val layout = layoutInflater.inflate(R.layout.error_toast, findViewById(R.id.toast_container))
        layout.findViewById<TextView>(R.id.toast_text).text = message

        val toast = Toast(applicationContext)
        toast.view = layout
        toast.duration = Toast.LENGTH_SHORT
        toast.show()
    }
}
