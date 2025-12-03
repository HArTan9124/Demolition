package com.example.demolition

import android.graphics.Color
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.demolition.databinding.ActivityQuizQuestionsBinding
import com.example.demolition.models.Question
import com.example.demolition.models.QuizData
import com.google.gson.Gson

class QuizQuestionsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityQuizQuestionsBinding
    private lateinit var questionList: List<Question>

    private var currentIndex = 0
    private var score = 0
    private var selectedOption: String = ""
    private var subject: String = "math"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQuizQuestionsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val chapterTitle = intent.getStringExtra("chapter_title") ?: ""
        subject = intent.getStringExtra("subject") ?: "math"

        loadQuestions(chapterTitle)
        loadQuestion()

        setOptionClickListeners()
        setNextClickListener()
    }

    private fun loadQuestions(chapterTitle: String) {
        val fileName = "${subject}_quiz.json"

        val json = assets.open(fileName).bufferedReader().use { it.readText() }
        val quizData = Gson().fromJson(json, QuizData::class.java)

        val allQuestions = quizData.quiz.firstOrNull {
            it.chapter_title == chapterTitle
        }?.questions ?: emptyList()

        questionList = allQuestions.shuffled().take(5)
    }

    private fun loadQuestion() {
        if (currentIndex >= questionList.size) {
            showFinalScore()
            return
        }

        val q = questionList[currentIndex]
        resetOptionStyles()

        binding.tvQuizQuestion.text = "Q${currentIndex + 1}. ${q.q}"
        binding.option1.text = q.options[0]
        binding.option2.text = q.options[1]
        binding.option3.text = q.options[2]
        binding.option4.text = q.options[3]
    }

    private fun setOptionClickListeners() {
        binding.option1.setOnClickListener { selectOption(binding.option1.text.toString()) }
        binding.option2.setOnClickListener { selectOption(binding.option2.text.toString()) }
        binding.option3.setOnClickListener { selectOption(binding.option3.text.toString()) }
        binding.option4.setOnClickListener { selectOption(binding.option4.text.toString()) }
    }

    private fun selectOption(option: String) {
        selectedOption = option
        resetOptionStyles()

        when (option) {
            binding.option1.text -> binding.option1.setBackgroundColor(Color.parseColor("#D0E6FF"))
            binding.option2.text -> binding.option2.setBackgroundColor(Color.parseColor("#D0E6FF"))
            binding.option3.text -> binding.option3.setBackgroundColor(Color.parseColor("#D0E6FF"))
            binding.option4.text -> binding.option4.setBackgroundColor(Color.parseColor("#D0E6FF"))
        }
    }

    private fun resetOptionStyles() {
        val white = Color.WHITE
        binding.option1.setBackgroundColor(white)
        binding.option2.setBackgroundColor(white)
        binding.option3.setBackgroundColor(white)
        binding.option4.setBackgroundColor(white)
    }

    private fun setNextClickListener() {
        binding.btnNext.setOnClickListener {
            if (selectedOption.isEmpty()) {
                Toast.makeText(this, "Please select an option!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val correctAnswer = questionList[currentIndex].answer
            if (selectedOption == correctAnswer) score++

            selectedOption = ""
            currentIndex++
            loadQuestion()
        }
    }

    private fun showFinalScore() {
        val dialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Quiz Completed")
            .setMessage("Your Score: $score / ${questionList.size}")
            .setPositiveButton("OK") { _, _ -> finish() }
            .setCancelable(false)
            .create()

        dialog.show()
    }
}
