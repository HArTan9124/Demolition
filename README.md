<body>

  <h1>📚 Ravya Web</h1>
  <p><strong>AI-Assisted Timetable Management Platform for Schools</strong></p>

  <div class="section">
    <h2>🚀 Quick Start</h2>
    <h3>Prerequisites</h3>
    <ul>
      <li>Python 3.11+</li>
      <li>PostgreSQL 16</li>
      <li>Redis</li>
    </ul>
    <h3>Start the System</h3>
    <pre>

source .venv/bin/activate

uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

celery -A src.tasks.celery_app worker --loglevel=info
    </pre>
    <p><strong>Access:</strong><br>
      API: <a href="http://localhost:8000">http://localhost:8000</a><br>
      Docs: <a href="http://localhost:8000/docs">http://localhost:8000/docs</a>
    </p>
  </div>

  <div class="section">
    <h2>🏗️ Project Structure</h2>
    <pre>
edu_schedule/
├── src/
│   ├── core/                 # Config, security, validation
│   ├── api/                  # FastAPI routes
│   │   ├── routes/           # Modular endpoints (timetable, auth, upload)
│   │   ├── main.py           # Main app entry point
│   │   └── middleware.py     # Security headers, request logs
│   ├── models.py             # SQLAlchemy models
│   ├── database.py           # PostgreSQL connection
│   ├── tasks/                # Celery tasks for notifications
│   ├── services/             # Business logic
│   └── utils/                # Helper functions
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── scripts/
├── docs/
├── frontend/
└── alembic/
    </pre>
  </div>

  <div class="section">
    <h2>✨ Features</h2>
    <ul>
      <li>🗓️ Timetable Upload & Parsing – Teachers can upload Excel/PDF timetables</li>
      <li>🧠 AI Validation – Detects clashes or missing periods automatically</li>
      <li>🌐 Multilingual Interface – English, Hindi, Tamil, Telugu, Marathi, Bengali</li>
      <li>🔔 Smart Notifications – Sends reminders or updates to staff</li>
      <li>📊 Analytics Dashboard – View timetable usage & teacher workload</li>
      <li>🔒 Secure Authentication – JWT-based login for teachers/admins</li>
    </ul>
  </div>

  <div class="section">
    <h2>🔧 Configuration</h2>
    <p>Copy <code>.env.example</code> → <code>.env</code></p>
    <pre>

DATABASE_URL=postgresql://user:pass@localhost:5432/edu_schedule

REDIS_URL=redis://localhost:6379/0

JWT_SECRET_KEY=supersecret
    </pre>
  </div>

  <div class="section">
    <h2>📊 API Overview</h2>
    <h3>Authentication</h3>
    <ul>
      <li>POST /api/v1/auth/register – Register new user</li>
      <li>POST /api/v1/auth/login – Login teacher</li>
      <li>GET /api/v1/auth/me – Get profile</li>
    </ul>
    <h3>Timetable Management</h3>
    <ul>
      <li>POST /api/v1/timetable/upload – Upload Excel/PDF timetable</li>
      <li>GET /api/v1/timetable/all – List all uploaded timetables</li>
      <li>POST /api/v1/timetable/validate – Run AI validation</li>
    </ul>
  </div>

  <div class="section">
    <h2>🔒 Security</h2>
    <ul>
      <li>✅ SQL injection and XSS protection</li>
      <li>✅ File validation (Excel, CSV, PDF)</li>
      <li>✅ Rate limiting via Redis</li>
      <li>✅ Password hashing (bcrypt)</li>
      <li>✅ CORS and security headers</li>
    </ul>
  </div>

  <div class="section">
    <h2>🚀 Deployment</h2>
    <pre>
docker-compose up -d
    </pre>
    <ul>
      <li>Update <code>JWT_SECRET_KEY</code></li>
      <li>Enable Redis caching</li>
      <li>Set up HTTPS</li>
    </ul>
  </div>

  <div class="footer">
    <p>👨‍💻 Created By <strong>Om Jha</strong></p>
    <p>📧 <a href="mailto:omjhaofficial@gmail.com">omj3430@gmail.com</a></p>
    <p>💼 <a href="https://linkedin.com/in/om-jha" target="_blank">linkedin.com/in/om-jha-cs</a></p>
  </div>

</body>
</html>
