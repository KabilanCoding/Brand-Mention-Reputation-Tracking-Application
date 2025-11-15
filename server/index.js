const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RSSConnector = require('./connectors/rssConnector');
const RedditConnector = require('./connectors/redditConnector');
const DB = require('./db');
const Sentiment = require('sentiment');
const vader = new Sentiment();
const nlp = require('./nlp');
const SpikeDetector = require('./spikeDetector');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

// Allow cross-origin requests from the frontend dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// API: recent mentions
app.get('/api/mentions', async (req, res) => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 3000)
    );
    const queryPromise = DB.all('SELECT * FROM mentions ORDER BY created_at DESC LIMIT 200');
    const rows = await Promise.race([queryPromise, timeoutPromise]);
    res.json(rows || []);
  } catch (err) {
    console.error('API error:', err.message);
    // Return empty array on error so frontend doesn't crash
    res.json([]);
  }
});

// Debug helper: emit a test mention and persist it, useful for local testing
app.get('/api/debug/emit', async (req, res) => {
  try {
    const now = Date.now()
    const sample = {
      source: 'debug',
      url: `https://example.com/debug-${Math.random().toString(36).slice(2,9)}`,
      title: 'Debug: Test mention',
      content: 'This is a test mention emitted from the debug endpoint',
      topics: JSON.stringify(['debug','test']),
      sentiment_label: 'neutral',
      sentiment_score: 0,
      created_at: now
    }
    const stmt = await DB.run(
      'INSERT INTO mentions (source, url, title, content, topics, sentiment_label, sentiment_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sample.source, sample.url, sample.title, sample.content, sample.topics, sample.sentiment_label, sample.sentiment_score, sample.created_at]
    )
    const inserted = Object.assign({ id: stmt.lastID }, sample)
    // emit to connected clients
    try { io.emit('mention', inserted) } catch (e) { /* ignore */ }
    return res.json({ ok: true, mention: inserted })
  } catch (err) {
    console.error('debug emit error', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
})

io.on('connection', () => {
  console.log('client connected');
});

function mapSentiment(text) {
  const result = vader.analyze((text||'').toString());
  const score = result.score || 0;
  let label = 'neutral';
  if (score > 0) label = 'positive';
  else if (score < 0) label = 'negative';
  return { label, score };
}

const spike = new SpikeDetector({ windowMinutes: 10, multiplier: 3, minCount: 3 });

// Webhook configuration: comma-separated URLs in WEBHOOK_URLS
const webhookEnv = process.env.WEBHOOK_URLS || '';
const WEBHOOK_URLS = webhookEnv.split(',').map(s => s.trim()).filter(Boolean);

async function deliverWebhook(payload) {
  if (!WEBHOOK_URLS.length) return;
  for (const url of WEBHOOK_URLS) {
    try {
      // lazy require to avoid startup cost if unused
      const fetch = require('node-fetch');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 5000
      });
      if (!res.ok) console.warn('webhook delivery failed', url, res.status);
    } catch (err) {
      console.error('webhook delivery error', url, err && err.message ? err.message : err);
    }
  }
}

spike.on('spike', (s) => {
  console.log('spike detected', s);
  io.emit('spike', s);
  // also send to configured webhooks
  deliverWebhook({ type: 'spike', data: s, timestamp: Date.now() }).catch(err=>{
    console.error('deliverWebhook error', err);
  });
});

async function processMention(source, item) {
  try {
    const url = item.link || item.guid || item.id || null;
    const title = item.title || '';
    const content = (item.contentSnippet || item.content || item.summary || item.description || '').toString();
    const text = `${title}\n${content}`.trim();
    if (!text) return;

    // deduplicate by URL if available
    if (url) {
      const existing = await DB.get('SELECT id FROM mentions WHERE url = ?', [url]);
      if (existing) return;
    }

  const sentiment = mapSentiment(text);
  const topics = nlp.extractTopics(text, 3);

    const stmt = await DB.run(
      'INSERT INTO mentions (source, url, title, content, topics, sentiment_label, sentiment_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [source, url, title, content, JSON.stringify(topics), sentiment.label, sentiment.score, Date.now()]
    );

    const inserted = {
      id: stmt.lastID,
      source,
      url,
      title,
      content,
      topics,
      sentiment_label: sentiment.label,
      sentiment_score: sentiment.score,
      created_at: Date.now()
    };

    io.emit('mention', inserted);

    // feed spike detector by topic and source
    try {
      if (topics && topics.length) {
        for (const t of topics) spike.add(`topic:${t}`);
      }
      spike.add(`source:${source}`);
    } catch (err) {
      // ignore
    }
  } catch (err) {
    console.error('processMention error', err);
  }
}

async function start() {
  try {
    await DB.init();
    console.log('[DB] Initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }

  // Add mock data for demo if table is empty
  try {
    setImmediate(async () => {
      try {
        const count = await DB.get('SELECT COUNT(*) as cnt FROM mentions');
        if (count && count.cnt === 0) {
          console.log('[Demo] Inserting mock data...');
          const mockData = [
            { source: 'rss', title: "Apple's new AI features impress users", content: 'Apple announced groundbreaking AI features that received positive feedback from tech community', sentiment: 'positive', score: 8 },
            { source: 'reddit', title: 'Samsung S24 delivers exceptional performance', content: 'Latest Samsung flagship is getting rave reviews for its camera and processing speed', sentiment: 'positive', score: 7 },
            { source: 'rss', title: 'Microsoft faces criticism over privacy concerns', content: 'Users express concerns about data collection practices in latest Windows update', sentiment: 'negative', score: -6 },
            { source: 'reddit', title: "Google Pixel 8 Pro camera quality questioned", content: 'Some users report inconsistent image quality in low light conditions', sentiment: 'negative', score: -5 },
            { source: 'rss', title: 'New smartphone charging standards announced', content: 'Industry leaders agree on universal fast charging protocol for future devices', sentiment: 'neutral', score: 0 },
            { source: 'reddit', title: 'Battery technology breakthrough expected', content: 'Researchers develop new battery with 50% more capacity than current standards', sentiment: 'positive', score: 6 },
            { source: 'rss', title: 'Tech layoffs continue across industry', content: 'Several major tech companies announce further workforce reductions', sentiment: 'negative', score: -7 },
            { source: 'reddit', title: 'OnePlus reveals faster charging solution', content: 'New technology promises full charge in 10 minutes without heat issues', sentiment: 'positive', score: 7 },
            { source: 'rss', title: 'Smartphone market shows steady growth', content: 'Latest market analysis indicates sustained demand for flagship devices', sentiment: 'neutral', score: 1 },
            { source: 'reddit', title: 'Users praise latest software update', content: 'New version brings requested features and significantly improves stability', sentiment: 'positive', score: 8 },
          ];

          // Spread mock mentions across the last ~10 minutes for a visible timeline
          const now = Date.now();
          for (let i = 0; i < mockData.length; i++) {
            const item = mockData[i];
            try {
              // spread: latest items closer to 'now', older items up to ~10 minutes ago
              const jitter = Math.floor(Math.random() * 60000); // up to 1 minute jitter
              const minutesAgo = Math.floor((mockData.length - i) * (10 / mockData.length));
              const createdAt = now - minutesAgo * 60 * 1000 - jitter;
              await DB.run(
                'INSERT INTO mentions (source, url, title, content, topics, sentiment_label, sentiment_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  item.source,
                  `https://example.com/${Math.random().toString(36).substring(7)}`,
                  item.title,
                  item.content,
                  JSON.stringify(['tech', item.source, 'news']),
                  item.sentiment,
                  item.score,
                  createdAt
                ]
              );
            } catch (e) {
              // ignore individual insert errors
            }
          }
          console.log('[Demo] Mock data inserted');
        }
      } catch (err) {
        console.error('[Demo] Error with mock data:', err.message);
      }
    });
  } catch (err) {
    console.error('[Demo] Error:', err.message);
  }

  // Start server immediately
  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  // Start connectors in background (non-blocking) - DISABLED for stability testing
  setImmediate(() => {
    try {
      console.log('[Connectors] Disabled for stability testing. Enable in production.');
      // const rss = new RSSConnector({ pollingInterval: 60 * 1000 });
      // rss.on('item', (item) => processMention('rss', item));
      // rss.addFeed('https://news.google.com/rss/search?q=brand');
      // rss.start();
      // console.log('[RSS] Connector started');
    } catch (err) {
      console.error('[RSS] Start error:', err && err.message ? err.message : err);
    }

    try {
      // const reddit = new RedditConnector({ pollingInterval: 60 * 1000 });
      // reddit.on('item', (item) => processMention('reddit', item));
      // reddit.addSubreddit('news');
      // reddit.start();
      // console.log('[Reddit] Connector started');
    } catch (err) {
      console.error('[Reddit] Start error:', err && err.message ? err.message : err);
    }
  });
}

start().catch(err => console.error('Start error:', err));
