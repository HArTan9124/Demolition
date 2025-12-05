package com.example.demolition.rag

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Main RAG (Retrieval Augmented Generation) pipeline.
 * Orchestrates data loading, chunking, indexing, and retrieval operations.
 */
class RAGPipeline {

    private val TAG = "RAGPipeline"
    
    private val vectorStore = VectorStore()
    private var isInitialized = false

    /**
     * Initializes the RAG pipeline.
     * Loads data from Data.json, chunks it, and builds the vector index.
     * 
     * @param context Android context for asset access
     * @throws Exception if initialization fails
     */
    suspend fun initialize(context: Context) = withContext(Dispatchers.IO) {
        if (isInitialized) {
            Log.d(TAG, "RAG pipeline already initialized")
            return@withContext
        }
        
        try {
            Log.d(TAG, "Initializing RAG pipeline...")
            
            // Step 1: Chunk the data
            val startChunk = System.currentTimeMillis()
            val chunks = DataChunker.chunkData(context)
            val chunkTime = System.currentTimeMillis() - startChunk
            Log.d(TAG, "Chunking completed in ${chunkTime}ms: ${chunks.size} chunks")
            
            // Step 2: Index the chunks
            val startIndex = System.currentTimeMillis()
            vectorStore.index(chunks)
            val indexTime = System.currentTimeMillis() - startIndex
            Log.d(TAG, "Indexing completed in ${indexTime}ms")
            
            isInitialized = true
            Log.d(TAG, "RAG pipeline initialized successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize RAG pipeline", e)
            isInitialized = false
            throw e
        }
    }

    /**
     * Queries the RAG pipeline to retrieve relevant context for a question.
     * 
     * @param question User's question
     * @param topK Number of top chunks to retrieve (default: 5)
     * @return RAGResult containing retrieved chunks and augmented prompt
     * @throws IllegalStateException if pipeline is not initialized
     */
    suspend fun query(question: String, topK: Int = 5): RAGResult = withContext(Dispatchers.IO) {
        if (!isInitialized) {
            throw IllegalStateException("RAG pipeline not initialized. Call initialize() first.")
        }
        
        try {
            Log.d(TAG, "Querying: '$question'")
            
            // Retrieve relevant chunks
            val startSearch = System.currentTimeMillis()
            val searchResults = vectorStore.search(question, topK, minScore = 0.01)
            val searchTime = System.currentTimeMillis() - startSearch
            
            Log.d(TAG, "Search completed in ${searchTime}ms: ${searchResults.size} results")
            
            // Log top results
            searchResults.take(3).forEachIndexed { idx, result ->
                Log.d(TAG, "  #${idx + 1} [${result.getScoreDisplay()}] ${result.chunk.getSourceDisplay()}")
            }
            
            // Build context string from retrieved chunks
            val context = buildContext(searchResults.map { it.chunk })
            
            // Create augmented prompt
            val augmentedPrompt = buildPrompt(question, context)
            
            return@withContext RAGResult(
                retrievedChunks = searchResults.map { it.chunk },
                scores = searchResults.map { it.score },
                context = context,
                augmentedPrompt = augmentedPrompt
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Error during query", e)
            throw e
        }
    }

    /**
     * Builds a context string from retrieved chunks.
     */
    private fun buildContext(chunks: List<DocumentChunk>): String {
        if (chunks.isEmpty()) return ""
        
        return chunks.joinToString("\n\n") { chunk ->
            val source = chunk.getSourceDisplay()
            val content = chunk.text
            "[$source]\n$content"
        }
    }

    /**
     * Builds an augmented prompt with context and question.
     */
    private fun buildPrompt(question: String, context: String): String {
        return if (context.isNotBlank()) {
            """You are a helpful educational assistant. Use the following context from the curriculum to answer the student's question accurately.
            
Context:
$context

Question: $question

Answer based on the context above. If the context doesn't contain relevant information, say so."""
        } else {
            question
        }
    }

    /**
     * Returns true if the pipeline is initialized and ready to use
     */
    fun isReady(): Boolean = isInitialized

    /**
     * Returns the number of indexed document chunks
     */
    fun getIndexSize(): Int = if (isInitialized) vectorStore.size() else 0
}

/**
 * Result of a RAG query operation.
 */
data class RAGResult(
    val retrievedChunks: List<DocumentChunk>,
    val scores: List<Double>,
    val context: String,
    val augmentedPrompt: String
) {
    /**
     * Returns true if relevant context was found
     */
    fun hasContext(): Boolean = context.isNotBlank()
    
    /**
     * Returns the number of retrieved chunks
     */
    fun getChunkCount(): Int = retrievedChunks.size
}
