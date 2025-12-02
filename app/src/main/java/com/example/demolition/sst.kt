package com.example.demolition

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.demolition.databinding.ActivitySstBinding

class sst : AppCompatActivity() {

    private lateinit var binding: ActivitySstBinding
    private lateinit var adapter: ChapterAdapter

    private val chapterList = listOf(
        "India – Size and Location",
        "Physical Features of India",
        "Drainage",
        "Climate",
        "Natural Vegetation and Wildlife",
        "Population"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        binding = ActivitySstBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // System Insets
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        adapter = ChapterAdapter(chapterList) { chapterTitle ->
            openChapterViewer(chapterTitle)
        }
        binding.rvChapters.layoutManager = LinearLayoutManager(this)
        binding.rvChapters.adapter = adapter
    }

    private fun openChapterViewer(title: String) {
        val intent = Intent(this, ChapterViewer::class.java)
        intent.putExtra("chapter_title", title)
        startActivity(intent)
    }
}
