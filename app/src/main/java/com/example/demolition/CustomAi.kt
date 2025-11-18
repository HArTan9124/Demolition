package com.example.demolition

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.view.LayoutInflater
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.*

class CustomAi : AppCompatActivity() {

    private val viewModel: CustomAiViewModel by viewModels()

    private lateinit var firestore: FirebaseFirestore
    private lateinit var auth: FirebaseAuth
    private lateinit var textToSpeech: TextToSpeech

    private var loadingDialog: Dialog? = null

    private var currentStep = 1
    private var previouslySelected: ImageView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        firestore = FirebaseFirestore.getInstance()
        auth = FirebaseAuth.getInstance()

        if (auth.currentUser == null) {
            showToast("Please login!", "error")
            finish()
            return
        }

        // Initialize TTS
        textToSpeech = TextToSpeech(this) {
            if (it == TextToSpeech.SUCCESS) textToSpeech.language = Locale.US
        }

        showAvatarSelectionStep()
    }

    // ---------------------- STEP 1 ------------------------

    private fun showAvatarSelectionStep() {
        currentStep = 1
        setContentView(R.layout.activity_custom_ai)

        val avatarIds = listOf(
            R.id.avatar1, R.id.avatar2, R.id.avatar3,
            R.id.avatar4, R.id.avatar5, R.id.avatar6
        )

        avatarIds.forEach { id ->
            val avatarView = findViewById<ImageView>(id)

            avatarView.setOnClickListener {
                val avatarName = resources.getResourceEntryName(id)
                viewModel.selectedAvatarId.value = avatarName

                previouslySelected?.foreground = null
                avatarView.foreground = getDrawable(R.drawable.avatar_blur_overlay)
                previouslySelected = avatarView

                showToast("Selected $avatarName", "info")
            }
        }

        findViewById<Button>(R.id.btnContinue).setOnClickListener {
            if (viewModel.selectedAvatarId.value.isNullOrEmpty()) {
                showToast("Select an avatar!", "error")
            } else showVoiceStep()
        }
    }

    // ---------------------- STEP 2 ------------------------

    private fun showVoiceStep() {
        currentStep = 2
        setContentView(R.layout.custom_ai_voice)

        val avatarImage = findViewById<ImageView>(R.id.aiAvatar)
        val voiceSpinner = findViewById<Spinner>(R.id.languageSpinner)
        val testBtn = findViewById<Button>(R.id.dummy_button)
        val inputText = findViewById<EditText>(R.id.editTextSpeechInput)

        val avatarId = viewModel.selectedAvatarId.value!!
        avatarImage.setImageResource(resources.getIdentifier(avatarId, "drawable", packageName))

        val voices = listOf("Male - Hard", "Male - Soft", "Female - Hard", "Female - Soft")
        voiceSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, voices)

        testBtn.setOnClickListener {
            val text = inputText.text.toString().trim()
            speakText(if (text.isEmpty()) "Hello! Nice to meet you!" else text)
        }

        findViewById<Button>(R.id.btnNext).setOnClickListener {
            viewModel.selectedVoice.value = voiceSpinner.selectedItem.toString()
            showNameStep()
        }
    }

    // ---------------------- STEP 3 ------------------------

    private fun showNameStep() {
        currentStep = 3
        setContentView(R.layout.custom_name)

        val avatarImg = findViewById<ImageView>(R.id.selectedAvatar)
        val nameField = findViewById<TextInputEditText>(R.id.editTextAiName)
        val saveBtn = findViewById<Button>(R.id.btnSaveAiName)

        val avatarId = viewModel.selectedAvatarId.value!!
        avatarImg.setImageResource(resources.getIdentifier(avatarId, "drawable", packageName))

        saveBtn.setOnClickListener {
            val aiName = nameField.text.toString().trim()
            if (aiName.isEmpty()) {
                nameField.error = "Name required"
                return@setOnClickListener
            }

            viewModel.aiName.value = aiName
            saveProfile()
        }
    }

    // ---------------------- SPEAK FUNCTION ------------------------

    private fun speakText(text: String) {
        val pitch: Float
        val speed: Float

        when (viewModel.selectedVoice.value) {
            "Male - Hard" -> { pitch = 0.45f; speed = 0.9f }
            "Male - Soft" -> { pitch = 0.55f; speed = 0.95f }
            "Female - Hard" -> { pitch = 1.2f; speed = 1.0f }
            "Female - Soft" -> { pitch = 1.4f; speed = 0.95f }
            else -> { pitch = 1f; speed = 1f }
        }

        textToSpeech.setPitch(pitch)
        textToSpeech.setSpeechRate(speed)
        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }

    // ---------------------- SAVE PROFILE ------------------------

    private fun saveProfile() {
        showLoading()
        val userId = auth.currentUser!!.uid

        val profile = AiProfile(
            avatarId = viewModel.selectedAvatarId.value!!,
            aiName = viewModel.aiName.value!!,
            language = viewModel.selectedVoice.value!!
        )

        firestore.collection("ai_profiles")
            .document(userId)
            .set(profile)
            .addOnSuccessListener {
                hideLoading()
                showToast("AI profile saved!", "success")

                val intent = Intent(this, MainActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
            .addOnFailureListener {
                hideLoading()
                showToast("Error: ${it.message}", "error")
            }
    }

    // ---------------------- LOADING DIALOG ------------------------

    private fun showLoading() {
        loadingDialog = Dialog(this)
        loadingDialog!!.setContentView(R.layout.loading_dialog)
        loadingDialog!!.setCancelable(false)
        loadingDialog!!.show()
    }

    private fun hideLoading() {
        loadingDialog?.dismiss()
    }

    // ---------------------- TOAST UI ------------------------

    private fun showToast(msg: String, type: String = "info") {
        val view = when (type) {
            "success" -> LayoutInflater.from(this).inflate(R.layout.correct_toast, null)
            "error" -> LayoutInflater.from(this).inflate(R.layout.error_toast, null)
            else -> LayoutInflater.from(this).inflate(R.layout.toast_info, null)
        }
        view.findViewById<TextView>(R.id.toast_text).text = msg

        Toast(this).apply {
            duration = Toast.LENGTH_SHORT
            this.view = view
            show()
        }
    }

    // ---------------------- BACK LOGIC ------------------------

    @SuppressLint("MissingSuperCall", "GestureBackNavigation")
    override fun onBackPressed() {
        when (currentStep) {
            2 -> showAvatarSelectionStep()
            3 -> showVoiceStep()
            else -> super.onBackPressed()
        }
    }

    override fun onDestroy() {
        textToSpeech.stop()
        textToSpeech.shutdown()
        super.onDestroy()
    }
}
