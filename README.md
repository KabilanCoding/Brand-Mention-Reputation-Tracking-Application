# Brand Monitor — MVP

This is a minimal prototype for a Brand Mention & Reputation Tracker.

Features included in this MVP:
- RSS feed connector (using `rss-parser`)
- Reddit subreddit polling via RSS
- Sentiment analysis using VADER
- SQLite persistence
- Real-time updates via Socket.IO
- Minimal static frontend served from the backend

Quick start (Windows PowerShell):

```powershell
cd c:\Users\Gopal\Downloads\BRAND
npm install
npm start
# open http://localhost:3000
```

Frontend (optional) - run dev server in a separate terminal:

```powershell
cd c:\Users\Gopal\Downloads\BRAND\frontend
npm install
npm run dev
# open the Vite URL (usually http://localhost:5173)
```

Webhook alerts
----------------
You can configure webhook alert delivery for spikes by setting the `WEBHOOK_URLS` environment variable (comma-separated list of URLs). The server will POST JSON payloads to each URL when a spike is detected.

Example (PowerShell):

```powershell
$env:WEBHOOK_URLS = 'https://example.com/webhook1,https://example.com/webhook2'
npm start
```

Payload example:

```json
{ "type": "spike", "data": { "key": "topic:apple", "last": 12, "avg": 2.3, "timestamp": 163... }, "timestamp": 163... }
```

Notes & next steps:
- This is an MVP scaffold. Next steps are: improve deduplication, add topic clustering (embeddings + kmeans), add spike detection/alerting, add more connectors (Twitter/X, blogs), and replace static frontend with a React dashboard.
