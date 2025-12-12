# 📚 Demolition - AI-Powered Educational Assistant

> An offline-first Android educational app featuring AI chat, RAG-powered study assistance, interactive quizzes, and comprehensive NCERT curriculum coverage for Classes 9-12.

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-purple.svg)](https://kotlinlang.org)
[![Min SDK](https://img.shields.io/badge/Min%20SDK-24-blue.svg)](https://developer.android.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### 🤖 AI Study Assistant
- **Offline AI Chat**: On-device LLM (GGUF format) for instant answers
- **RAG Pipeline**: Retrieval-Augmented Generation with TF-IDF embeddings
- **Smart Context**: Retrieves relevant curriculum chunks for accurate responses
- **Persistent Caching**: 10x faster app startup after first initialization
- **Anti-Hallucination**: Strict prompt engineering prevents off-topic responses

### 📖 Subject Coverage
- **Mathematics**: Chapters 1-12 (Algebra, Geometry, Trigonometry, etc.)
- **Science**: Complete Physics, Chemistry, Biology curriculum
- **English**: Beehive (main textbook) + Moments (supplementary)
- **Social Science**: History, Geography, Economics, Political Science

### 📝 Interactive Quizzes
- **Multiple Choice Questions (MCQs)**
- **True/False Questions**
- **Fill in the Blanks**
- **Subject-wise quiz organization**
- **Progress tracking and scoring**

### 👤 User Features
- **Firebase Authentication** (Email/Password)
- **Custom Avatar Selection** (14+ avatars with visual feedback)
- **Profile Management** (Edit name, update avatar)
- **User Progress Tracking**
- **Personalized study dashboard**

### 🎨 Modern UI/UX
- **Material Design 3** components
- **Bottom Navigation** for subject switching
- **Drawer Navigation** for settings & profile
- **Responsive layouts** for different screen sizes
- **Custom toast notifications** with visual feedback

---

## 🏗️ Architecture

### Technology Stack
```
Frontend:    Kotlin + XML layouts
Backend:     Firebase (Auth, Firestore, Realtime Database)
AI Model:    GGUF (Gemma-3-1B or similar)
Native:      C++ (llama.cpp JNI bindings)
ML Pipeline: Custom RAG with TF-IDF
Data:        JSON-based curriculum (2000+ chunks)
```

### Project Structure
```
app/src/main/
├── java/com/example/demolition/
│   ├── ai/                      # Native AI integration
│   │   ├── GGUFModelLoader.kt   # Model loading
│   │   ├── GGUFChat.kt          # Chat wrapper
│   │   └── LlamaNative.kt       # JNI interface
│   ├── rag/                     # RAG Pipeline
│   │   ├── RAGPipeline.kt       # Main orchestrator
│   │   ├── RAGCache.kt          # Persistent caching
│   │   ├── VectorStore.kt       # In-memory search
│   │   ├── TFIDFEmbedder.kt     # Embedding generation
│   │   ├── DataChunker.kt       # Curriculum chunking
│   │   └── TextUtils.kt         # Text processing
│   ├── models/                  # Data models
│   │   ├── GGUFChat.kt          # AI chat model
│   │   ├── ChatMessage.kt       # Message data class
│   │   ├── Chapter.kt           # Chapter structure
│   │   └── User.kt              # User data
│   ├── AiChatterFrag.kt         # AI chat fragment
│   ├── MainActivity.kt          # Main entry point
│   ├── [Subject].kt             # Subject activities (Math, Science, etc.)
│   └── ...                      # Other activities/fragments
├── cpp/                         # Native code
│   ├── llama_jni.cpp           # JNI bindings for llama.cpp
│   └── CMakeLists.txt          # CMake build config
├── assets/
│   └── ai_data/                # Curriculum data (JSON)
│       ├── Science/
│       ├── maths/
│       ├── beehive/
│       ├── moments/
│       └── Social Science/
└── res/                        # UI resources
```

### RAG Pipeline Flow
```
User Query
    ↓
[Check Greeting] → Respond warmly
    ↓
[RAG Query Cache] → Return if cached
    ↓
[TF-IDF Search] → Find top 4 relevant chunks (score ≥ 0.12)
    ↓
[Clean Markdown] → Remove **, *, [cite:]
    ↓
[Build Context] → Combine chunks with source info
    ↓
[Generate Prompt] → Add anti-hallucination rules
    ↓
[GGUF Model] → Generate response
    ↓
[Clean Output] → Remove any remaining symbols
    ↓
[Display & Cache] → Show to user, cache for future
```

---

## 🚀 Getting Started

### Prerequisites
- **Android Studio** Arctic Fox or newer
- **JDK 11** or higher
- **Android SDK** API 24+ (Android 7.0)
- **Device/Emulator** with 4GB+ RAM
- **AI Model** (GGUF format, ~1-2GB)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/demolition.git
cd demolition
```

2. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Download `google-services.json`
   - Place in `app/` directory
   - Enable Authentication (Email/Password)
   - Create Firestore & Realtime Database

3. **Add AI Model**
   - Download GGUF model (e.g., `gemma-3-1b-it-Q4_K_M.gguf`)
   - Place in device storage:
```bash
adb push gemma-3-1b-it-Q4_K_M.gguf /sdcard/Download/
```

4. **Build & Run**
```bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Usage

### First Launch
1. **Signup/Login** with email and password
2. **Select Avatar** and enter your name
3. **Choose Subject** from home screen
4. **Wait for AI initialization** (~5-10 seconds on first launch)
5. **Start chatting!** Ask questions about your curriculum

### AI Chat Examples
```
You: Hi
AI: Hi there! 👋 I'm your study assistant, ready to help you learn.

You: What is photosynthesis?
AI: Photosynthesis is how plants make their food! 🌱

Here's what happens:
• Sunlight: Provides energy
• Water: Absorbed through roots
• Carbon Dioxide: Taken from air
• Sugar (Glucose): Food for the plant
• Oxygen: Released as byproduct

You: Explain quadratic equations
AI: [Retrieves Math curriculum and explains clearly]
```

### Quiz System
1. Navigate to **Quiz** tab
2. Select chapter
3. Answer questions (MCQ, T/F, Fill-in-blanks)
4. View your score
5. Track progress over time

---

## ⚙️ Configuration

### Model Configuration
Edit model path in device (default: `/sdcard/Download/`):
```kotlin
// In GGUFModelLoader.kt
private val MODEL_PATH = Environment.getExternalStoragePublicDirectory(
    Environment.DIRECTORY_DOWNLOADS
).absolutePath + "/gemma-3-1b-it-Q4_K_M.gguf"
```

### RAG Parameters
Adjust in `RAGPipeline.kt`:
```kotlin
// Minimum relevance score (0.0 - 1.0)
val minScore = 0.12

// Number of top chunks to retrieve
val topK = 4

// Query result cache size
val queryCacheSize = 50 // LRU cache
```

### Firebase Rules
**Firestore** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Realtime Database** (`database.rules.json`):
```json
{
  "rules": {
    "Users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 🎯 Key Features Explained

### Persistent RAG Caching
- **First Launch**: Indexes 2000+ chunks, saves to JSON (~5-10s)
- **Subsequent Launches**: Loads from cache (~50-200ms) - **10x faster!**
- **Query Caching**: LRU cache for 50 most recent queries
- **Cache Invalidation**: Automatic when data structure changes

### Anti-Hallucination System
1. **High Relevance Threshold**: Only chunks scoring ≥0.12 used
2. **Limited Context**: Max 4 chunks to prevent confusion
3. **Strict Prompts**: "ONLY use information from context"
4. **Source Cleaning**: Removes markdown/citations from source
5. **Output Cleaning**: Strips any symbols from AI output

### Markdown Removal
**Two-layer cleaning:**
1. **Input**: Removes `**`, `*`, `[cite:]` from curriculum
2. **Output**: Catches any symbols AI generates
3. **Result**: Clean, readable text with proper bullet points (•)

---

## 📊 Performance

| Metric | First Launch | With Cache |
|--------|--------------|------------|
| **App Startup** | 5-10 seconds | 50-200ms |
| **First Query** | 50-100ms | 50-100ms |
| **Repeated Query** | 50-100ms | <1ms |
| **Cache Size** | N/A | 2-5 MB |

---

## 🛠️ Development

### Adding New Subject
1. Create JSON files in `assets/ai_data/[subject]/`
2. Add loader in `DataChunker.kt`:
```kotlin
private fun loadNewSubject(context: Context, gson: Gson): List<DocumentChunk> {
    // Implementation
}
```
3. Call in `chunkData()`:
```kotlin
chunks.addAll(loadNewSubject(context, gson))
```

### Customizing AI Behavior
Edit prompts in:
- `GGUFChat.kt` - Main AI prompt
- `RAGPipeline.kt` - RAG context building

### Testing
```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest

# Specific test
./gradlew test --tests "RAGPipelineTest"
```

---

## 🐛 Troubleshooting

### AI Model Not Loading
- Check model path is correct
- Verify model file exists on device
- Ensure sufficient storage (1-2GB free)
- Check logcat for errors: `adb logcat | grep "GGUFModelLoader"`

### Cache Issues
- Clear app data: Settings → Apps → Demolition → Clear Data
- Delete cache manually: `rm -rf /data/data/com.example.demolition/files/rag_cache/`
- Rebuild cache on next launch

### Firebase Connection Issues
- Verify `google-services.json` is present
- Check internet connection (for first auth)
- Enable Email/Password authentication in Firebase Console

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

## 🙏 Acknowledgments

- **llama.cpp** - Efficient LLM inference
- **Firebase** - Backend infrastructure
- **Material Design** - UI components
- **NCERT** - Curriculum content

---

## 🗺️ Roadmap

- [ ] Voice Q&A (TTS/STT integration)
- [ ] Image-based question solving
- [ ] Auto-generated lesson summaries
- [ ] Teacher/admin dashboard
- [ ] Multi-language support
- [ ] Offline TTS for explanations
- [ ] Progress analytics dashboard
- [ ] Gamification (badges, streaks)

---

**Built with ❤️ for offline-first education**
