package com.example.demolition

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase

class UserData : AppCompatActivity() {

    private lateinit var firstNameEditText: TextInputEditText
    private lateinit var lastNameEditText: TextInputEditText
    private lateinit var phoneEditText: TextInputEditText
    private lateinit var ageEditText: TextInputEditText
    private lateinit var locationEditText: TextInputEditText
    private lateinit var genderSpinner: Spinner
    private lateinit var classSpinner: Spinner
    private lateinit var sectionSpinner: Spinner
    private lateinit var continueButton: Button

    private lateinit var firebaseAuth: FirebaseAuth
    private val databaseRef = FirebaseDatabase.getInstance().getReference("Users")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_data)

        firebaseAuth = FirebaseAuth.getInstance()

        firstNameEditText = findViewById(R.id.editTextF_Name)
        lastNameEditText = findViewById(R.id.editTextL_Name)
        phoneEditText = findViewById(R.id.editTextPhone)
        ageEditText = findViewById(R.id.editTextCompany)
        locationEditText = findViewById(R.id.editTextLocation)
        genderSpinner = findViewById(R.id.spinnerGender)
        classSpinner = findViewById(R.id.spinnerClass)
        sectionSpinner = findViewById(R.id.spinnerSection)
        continueButton = findViewById(R.id.btnContinue)

        val genderOptions = arrayOf("Select Gender", "Male", "Female", "Other")
        genderSpinner.adapter =
            ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, genderOptions)

        val classOptions = (1..12).map { it.toString() }
        classSpinner.adapter =
            ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, classOptions)

        val sectionOptions = listOf("A", "B", "C", "D")
        sectionSpinner.adapter =
            ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, sectionOptions)

        continueButton.setOnClickListener {
            saveUserData()
        }
    }

    private fun saveUserData() {
        val firstName = firstNameEditText.text.toString().trim()
        val lastName = lastNameEditText.text.toString().trim()
        val phone = phoneEditText.text.toString().trim()
        val age = ageEditText.text.toString().trim()
        val location = locationEditText.text.toString().trim()
        val gender = genderSpinner.selectedItem.toString()
        val studentClass = classSpinner.selectedItem.toString()
        val section = sectionSpinner.selectedItem.toString()

        if (firstName.isEmpty() || lastName.isEmpty() || phone.isEmpty() ||
            age.isEmpty() || location.isEmpty() || gender == "Select Gender"
        ) {
            showErrorToast("Please fill in all fields")
            return
        }

        val userId = firebaseAuth.currentUser?.uid ?: return
        val user = User(firstName, lastName, phone, age, location, gender, studentClass, section)

        databaseRef.child(userId).setValue(user).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                showCorrectToast("Data saved successfully!")
                startActivity(Intent(this, CustomAi::class.java))
                finish()
            } else {
                showErrorToast("Failed to save data: ${task.exception?.message}")
            }
        }
    }

    private fun showCorrectToast(message: String) {
        val layout = layoutInflater.inflate(R.layout.correct_toast, findViewById(R.id.toast_container))
        layout.findViewById<TextView>(R.id.toast_text).text = message
        Toast(applicationContext).apply {
            view = layout
            duration = Toast.LENGTH_SHORT
        }.show()
    }

    private fun showErrorToast(message: String) {
        val layout = layoutInflater.inflate(R.layout.error_toast, findViewById(R.id.toast_container))
        layout.findViewById<TextView>(R.id.toast_text).text = message
        Toast(applicationContext).apply {
            view = layout
            duration = Toast.LENGTH_SHORT
        }.show()
    }
}
