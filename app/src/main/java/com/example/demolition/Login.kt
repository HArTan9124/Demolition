package com.example.demolition


import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.auth.FirebaseAuth

class Login : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var emailEditText: TextInputEditText
    private lateinit var passwordEditText: TextInputEditText
    private lateinit var loginButton: Button
    private lateinit var signupText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        auth = FirebaseAuth.getInstance()

        emailEditText = findViewById(R.id.editTextEmail)
        passwordEditText = findViewById(R.id.editTextPassword)
        loginButton = findViewById(R.id.btnLogin)
        signupText = findViewById(R.id.loginText)

        loginButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                showErrorToast("Please fill in all fields")
                return@setOnClickListener
            }

            auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        showCorrectToast("Login Successful")
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
                    } else {
                        showErrorToast("Login Failed: ${task.exception?.message}")
                    }
                }
        }

        signupText.setOnClickListener {
            startActivity(Intent(this, Signup::class.java))
        }
    }

    // ✅ Move these functions outside onCreate()

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
