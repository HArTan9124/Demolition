package com.example.demolition.rag

import android.content.Context
import android.util.Log
import com.example.demolition.models.Chapter
import com.example.demolition.models.Definition
import com.google.gson.Gson
import com.google.gson.JsonObject
import java.util.UUID

/**
 * Chunks educational data from Data.json into searchable DocumentChunk objects.
 * Each chunk represents a meaningful piece of information with metadata.
 */
object DataChunker {

    private const val TAG = "DataChunker"
    private const val DATA_FILE = "Data.json"

    /**
     * Loads and chunks the educational data from Data.json.
     * 
     * @param context Android context for asset access
     * @return List of DocumentChunk objects
     */
    fun chunkData(context: Context): List<DocumentChunk> {
        val chunks = mutableListOf<DocumentChunk>()
        
        try {
            // Read and parse JSON
            val json = context.assets.open(DATA_FILE)
                .bufferedReader()
                .use { it.readText() }
            
            val gson = Gson()
            val rootObject = gson.fromJson(json, JsonObject::class.java)
            
            // Extract metadata
            val classX = rootObject.get("classX")?.asString ?: "Unknown"
            val board = rootObject.get("board")?.asString ?: "Unknown"
            
            // Process subjects
            val subjectsArray = rootObject.getAsJsonArray("subject")
            for (subjectElement in subjectsArray) {
                val subjectObject = subjectElement.asJsonObject
                val subjectName = subjectObject.get("subject_name")?.asString ?: "Unknown"
                
                // Process chapters
                val chaptersArray = subjectObject.getAsJsonArray("chapters")
                for (chapterElement in chaptersArray) {
                    val chapter = gson.fromJson(chapterElement, Chapter::class.java)
                    chunks.addAll(chunkChapter(chapter, subjectName))
                }
            }
            
            Log.d(TAG, "Created ${chunks.size} chunks from $DATA_FILE")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to chunk data", e)
            throw e
        }
        
        return chunks
    }

    /**
     * Creates chunks from a single chapter.
     */
    private fun chunkChapter(chapter: Chapter, subject: String): List<DocumentChunk> {
        val chunks = mutableListOf<DocumentChunk>()
        
        val chapterTitle = chapter.chapter_title
        val chapterNumber = chapter.chapter_number
        
        // Chunk 1: Chapter summary
        chapter.summary?.let { summary ->
            if (summary.isNotBlank()) {
                chunks.add(
                    DocumentChunk(
                        id = generateId(),
                        text = summary,
                        subject = subject,
                        chapterTitle = chapterTitle,
                        chapterNumber = chapterNumber,
                        contentType = "summary"
                    )
                )
            }
        }
        
        // Chunk 2: Student explanations (combined)
        chapter.student_explanation?.let { explanations ->
            val combinedExplanations = explanations.joinToString(" ")
            if (combinedExplanations.isNotBlank()) {
                chunks.add(
                    DocumentChunk(
                        id = generateId(),
                        text = combinedExplanations,
                        subject = subject,
                        chapterTitle = chapterTitle,
                        chapterNumber = chapterNumber,
                        contentType = "explanation"
                    )
                )
            }
        }
        
        // Chunk 3+: Key definitions (one chunk per definition)
        chapter.key_definitions?.let { definitions ->
            for (definition in definitions) {
                if (definition is Definition) {
                    val text = "${definition.term}: ${definition.definition}"
                    chunks.add(
                        DocumentChunk(
                            id = generateId(),
                            text = text,
                            subject = subject,
                            chapterTitle = chapterTitle,
                            chapterNumber = chapterNumber,
                            contentType = "definition"
                        )
                    )
                }
            }
        }
        
        // Chunk N: Important points (combined)
        chapter.important_points?.let { points ->
            val combinedPoints = points.joinToString(" ")
            if (combinedPoints.isNotBlank()) {
                chunks.add(
                    DocumentChunk(
                        id = generateId(),
                        text = combinedPoints,
                        subject = subject,
                        chapterTitle = chapterTitle,
                        chapterNumber = chapterNumber,
                        contentType = "important_points"
                    )
                )
            }
        }
        
        // Chunk N+1: Formulas and identities (if present)
        chapter.formulas_and_identities?.let { formulas ->
            val formulasText = when (formulas) {
                is Map<*, *> -> formulas.entries.joinToString("; ") { "${it.key}: ${it.value}" }
                is String -> formulas
                else -> formulas.toString()
            }
            
            if (formulasText.isNotBlank()) {
                chunks.add(
                    DocumentChunk(
                        id = generateId(),
                        text = "Formulas: $formulasText",
                        subject = subject,
                        chapterTitle = chapterTitle,
                        chapterNumber = chapterNumber,
                        contentType = "formula"
                    )
                )
            }
        }
        
        return chunks
    }

    /**
     * Generates a unique ID for a chunk
     */
    private fun generateId(): String {
        return UUID.randomUUID().toString()
    }
}
