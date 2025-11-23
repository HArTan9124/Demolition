


</head>
<body>
  <div class="container" role="main">
    <header>
        <h1>Offline AI Learning Assistant</h1>
        <p class="lead">On-device AI chat tutor • Quiz generator • NCERT-driven learning • Java + XML Android (4GB-ready)</p>
        <div class="badges">
          <span class="badge">Android 12+</span>
          <span class="badge">Offline-first</span>
          <span class="badge">Phi-3 Mini (GGUF)</span>
          <span class="badge">SQLite • TFLite</span>
        </div>
      </div>
    </header>
    <div class="grid">
      <div>
        <section class="card">
          <h2>Project Purpose</h2>
          <p style="color:var(--muted)">This app provides a completely offline learning experience: a conversational AI tutor, chapter-wise study material (NCERT-ready), and an on-device quiz generator. Models run locally (no network after model load) on 4GB devices using compact quantized LLMs.</p>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Core Features</h2>
          <ul>
            <li><strong>Offline AI Chat:</strong> Ask questions, get class-level explanations (Class 1–12).</li>
            <li><strong>Quiz Generator:</strong> Create MCQs, short-answer, true/false, fill-in-the-blanks for any chapter.</li>
            <li><strong>NCERT Content:</strong> Local chapter pages, searchable and chunked for RAG retrieval.</li>
            <li><strong>Embeddings:</strong> TFLite embeddings for semantic search & offline RAG (MiniLM / MPNet).</li>
            <li><strong>Local Storage:</strong> SQLite vector store + JSON for quizzes & results.</li>
          </ul>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Recommended Architecture</h2>
          <pre><code>
NCERT PDFs -> Extract & Chunk -> Embeddings (TFLite) -> SQLite Vector DB
User Query -> Retrieve similar chunks -> Local LLM (Phi-3 Mini GGUF) -> Answer / Quiz
          </code></pre>
          <p class="note" style="margin-top:8px">Tip: Put large model files on external storage (e.g., <code>/sdcard/AI/models/</code>) to avoid apk bloat.</p>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Model & Runtime Options</h2>
          <ul>
            <li><strong>Phi-3 Mini (Q4_K_M GGUF)</strong> — recommended for 4GB devices (via <code>llama.cpp</code> or MLC runtime).</li>
            <li><strong>Gemma 2B</strong> — use LiteRT if you prefer Google’s runtime (Kotlin-first), or GGUF via <code>llama.cpp</code>/MLC.</li>
            <li><strong>Embeddings:</strong> TFLite MiniLM / MPNet for on-device vectorization.</li>
          </ul>
        </section>
      

# Android model path (example)
# Copy model file to device storage
# /sdcard/AI/models/phi-3-mini-4k-instruct.Q4_K_M.gguf
</code></pre>
          <p style="color:var(--muted)">In Android Studio, open the project and build. See the <code>docs/</code> folder for model conversion and embedding scripts.</p>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Java + WebView Integration (example)</h2>
          <pre><code>
WebView webView = findViewById(R.id.webview);
webView.getSettings().setJavaScriptEnabled(true);
webView.loadUrl("file:///android_asset/www/index.html");
          </code></pre>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Example Java LLM Usage (mlc-llm or JNI)</h2>
          <pre><code>
MLCChatModel model = MLCChatModel.fromPath(context, "/sdcard/AI/models/phi3-mlc/");
model.generate("Explain photosynthesis for class 6", token -> {
  runOnUiThread(() -> textView.append(token));
});
          </code></pre>
          <p style="color:var(--muted)">If you prefer JNI + <code>llama.cpp</code>, use a small native wrapper exposing <code>initModel()</code> and <code>generate()</code> methods (we can provide full C++ JNI code).</p>
        </section>
        <section class="card" style="margin-top:12px;">
          <h2>Storage & RAG</h2>
          <ul>
            <li><strong>Chunking:</strong> 512–1024 token chunks with overlap (e.g., 50–100 tokens).</li>
            <li><strong>Embeddings:</strong> Compute with TFLite, store vectors in SQLite (use float16/flat for speed).</li>
            <li><strong>Retrieval:</strong> k-NN (k=4..8) + prompt-assembly before LLM call.</li>
          </ul>
        </section>
      </div>
      <aside>
        <div class="card">
          <h2>Project Shortcuts</h2>
          <p class="muted" style="color:var(--muted);margin-bottom:8px">Paths & quick config</p>
          <ul>
            <li><code>/sdcard/AI/models/</code> — store GGUF or MLC model files</li>
            <li><code/assets/www/</code> — offline HTML lessons</li>
            <li><code/app/src/main/jniLibs/arm64-v8a/</code> — native libs for llama.cpp</li>
            <li><code/libs.versions.toml</code> — your version catalog (you already use Firebase BoM etc.)</li>
          </ul>
          <a class="cta" href="#install">Get started</a>
        </div>
        <div class="card" style="margin-top:12px">
          <h2>Requirements</h2>
          <ul>
            <li>Android 12+</li>
            <li>4 GB RAM (device)</li>
            <li>Model storage ~1–2 GB</li>
            <li>Optional: Google AI Edge (LiteRT) for Gemma</li>
          </ul>
        </div>
        <div class="card" style="margin-top:12px;">
          <h2>Future Ideas</h2>
          <ul>
            <li>Voice Q&A (on-device TTS/STT)</li>
            <li>Image question solving (local vision models)</li>
            <li>Auto-generate lesson summaries and daily quizzes</li>
            <li>Teacher/admin mode for customizing quizzes</li>
          </ul>
        </div>
        <div class="card" style="margin-top:12px;">
          <h2>License</h2>
          <p style="color:var(--muted)">MIT License — free to use and modify. See <code>LICENSE</code> in repo.</p>
        </div>
      </aside>
    </div>
    <footer>
      <p>Created for offline-first education with on-device LLMs. Questions? Open an issue or request a feature — I can provide Java-native examples, JNI wrappers, or a ready Android Studio sample.</p>
      <p style="margin-top:8px;color:var(--muted)">© Your Project • Built for 4GB devices • Phi-3 Mini (GGUF) recommended</p>
    </footer>
  </div>
</body>
</html>
