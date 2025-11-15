import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Area, AreaChart
} from 'recharts'

export default function Dashboard() {
  const [mentions, setMentions] = useState([])
  const [spikes, setSpikes] = useState([])
  const [sentiment, setSentiment] = useState({ positive: 0, negative: 0, neutral: 0 })
  const [topics, setTopics] = useState([])
  const [apiStatus, setApiStatus] = useState({ ok: false })
  const [lastFetch, setLastFetch] = useState(null)
  const [filter, setFilter] = useState({ sentiment: 'all', source: 'all', search: '' })
  const [chartData, setChartData] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [sentimentTrend, setSentimentTrend] = useState([])
  const [expandedCard, setExpandedCard] = useState(null)
  const navigate = useNavigate()
  
  // Demo user for local dev
  const getUserFromStorage = () => {
    let user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user || !user.email) {
      user = { email: 'demo@example.com' }
      try { localStorage.setItem('user', JSON.stringify(user)) } catch (e) { /* ignore */ }
    }
    return user
  }
  const user = getUserFromStorage()

  const COLORS = { positive: '#10b981', negative: '#ef4444', neutral: '#6b7280' }
  const GRADIENT_COLORS = { positive: '#34d399', negative: '#f87171', neutral: '#9ca3af' }

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user.email) {
      navigate('/login')
      return
    }

    // Fetch initial mentions (use absolute backend URL to avoid dev-server proxy issues)
    const fetchMentions = () => {
      fetch('http://localhost:3000/api/mentions')
        .then((r) => r.json())
        .then((list) => {
          // Normalize incoming records: parse topics, ensure created_at is a number
          const normalized = (list || []).map((m) => {
            let topics = m.topics
            try {
              if (typeof topics === 'string') topics = JSON.parse(topics)
            } catch (e) {
              topics = []
            }
            return {
              ...m,
              topics: Array.isArray(topics) ? topics : [],
              created_at: Number(m.created_at) || Date.now(),
              sentiment_label: m.sentiment_label || 'neutral',
            }
          })
          setMentions(normalized)
          updateSentimentCounts(normalized)
          updateTopics(normalized)
          updateChartData(normalized)
          updateSentimentTrend(normalized)
          setApiStatus({ ok: true })
          setLastFetch(Date.now())
        })
        .catch((err) => {
          console.error('Failed to fetch mentions:', err)
          setApiStatus({ ok: false, error: err.message })
        })
    }
    fetchMentions()
    // Poll every 2 seconds to ensure quick updates
    const poll = setInterval(fetchMentions, 2000)

    return () => {
      clearInterval(poll)
    }
  }, [user, navigate])

  const updateSentimentCounts = (list) => {
    const c = { positive: 0, negative: 0, neutral: 0 }
    for (const m of (list || [])) {
      const label = m && m.sentiment_label ? m.sentiment_label : 'neutral'
      c[label] = (c[label] || 0) + 1
    }
    setSentiment(c)
  }

  const updateTopics = (list) => {
    const topicMap = {}
    for (const m of list) {
      try {
        const t = typeof m.topics === 'string' ? JSON.parse(m.topics) : m.topics
        if (Array.isArray(t)) {
          for (const topic of t) {
            topicMap[topic] = (topicMap[topic] || 0) + 1
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    const topicList = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
    setTopics(topicList)
  }

  const updateChartData = (list) => {
    // Build minute buckets for the last 60 minutes
    const now = Date.now()
    const minutes = 60
    const buckets = new Array(minutes).fill(0)
    // labels for X axis
    const labels = []
    for (let i = minutes - 1; i >= 0; i--) {
      const t = new Date(now - i * 60 * 1000)
      labels.push(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`)
    }

    for (const m of (list || [])) {
      try {
        const ts = Number(m.created_at)
        if (Number.isNaN(ts)) continue
        const diffMin = Math.floor((now - ts) / 60000)
        if (diffMin >= 0 && diffMin < minutes) {
          // bucket index from oldest (0) to newest (minutes-1)
          const idx = minutes - 1 - diffMin
          buckets[idx] = (buckets[idx] || 0) + 1
        }
      } catch (e) {
        // ignore
      }
    }

    const data = labels.map((lab, i) => ({ time: lab, count: buckets[i] }))
    setChartData(data)
  }

  const updateSentimentTrend = (list) => {
    const now = Date.now()
    const minutes = 30
    const trends = {}
    
    for (let i = 0; i < minutes; i++) {
      const timeLabel = new Date(now - i * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      trends[timeLabel] = { positive: 0, negative: 0, neutral: 0 }
    }

    for (const m of (list || [])) {
      try {
        const ts = Number(m.created_at)
        if (Number.isNaN(ts)) continue
        const diffMin = Math.floor((now - ts) / 60000)
        if (diffMin >= 0 && diffMin < minutes) {
          const timeLabel = new Date(now - diffMin * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const label = m.sentiment_label || 'neutral'
          if (trends[timeLabel]) {
            trends[timeLabel][label] = (trends[timeLabel][label] || 0) + 1
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const data = Object.entries(trends).map(([time, counts]) => ({
      time,
      ...counts
    })).reverse()
    setSentimentTrend(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getEngagementScore = () => {
    if (mentions.length === 0) return 0
    const posRatio = sentiment.positive / mentions.length
    return Math.round(posRatio * 100)
  }

  const getSentimentHealthColor = () => {
    const score = getEngagementScore()
    if (score >= 60) return '#10b981'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getMentionVelocity = () => {
    if (mentions.length < 2) return '0'
    const now = Date.now()
    const recent = mentions.filter(m => now - m.created_at < 300000).length
    return recent
  }

  const getTrendDirection = () => {
    if (chartData.length < 2) return '→'
    const recentCount = chartData.slice(-5).reduce((sum, d) => sum + d.count, 0)
    const earlierCount = chartData.slice(-10, -5).reduce((sum, d) => sum + d.count, 0)
    if (recentCount > earlierCount) return '↗'
    if (recentCount < earlierCount) return '↘'
    return '→'
  }

  const filteredMentions = mentions.filter((m) => {
    if (filter.sentiment !== 'all' && m.sentiment_label !== filter.sentiment) return false
    if (filter.source !== 'all' && m.source !== filter.source) return false
    if (filter.search && !m.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const sentimentData = [
    { name: 'Positive', value: sentiment.positive, fill: COLORS.positive },
    { name: 'Negative', value: sentiment.negative, fill: COLORS.negative },
    { name: 'Neutral', value: sentiment.neutral, fill: COLORS.neutral },
  ]

  const handleExport = () => {
    const csv = 'ID,Source,Title,Sentiment,Score,Date\n' +
      filteredMentions.map(m => `"${m.id}","${m.source}","${m.title}","${m.sentiment_label}","${m.sentiment_score}","${new Date(m.created_at).toLocaleString()}"`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brand-mentions-${Date.now()}.csv`
    a.click()
  }

  // Debug visible JSON preview (dev only)
  const debugPreview = () => {
    if (!mentions || mentions.length === 0) return <div style={{color:'#6b7280'}}>No mentions loaded</div>
    const first = mentions[0]
    return (
      <div className="debug-panel" style={{fontSize:12, color:'#374151'}}>
        <div>Last fetch: {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'n/a'}</div>
        <div>Loaded mentions: {mentions.length}</div>
      </div>
    )
  }

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Premium Navbar */}
      <nav className="navbar-premium">
        <div className="navbar-brand-premium">
          <div className="brand-logo">📊</div>
          <div className="brand-text">
            <div className="brand-name">Brand Monitor</div>
            <div className="brand-tagline">Real-time Reputation Tracking</div>
          </div>
        </div>
        <div className="navbar-center-info">
          <div className="status-badge" style={{background: getSentimentHealthColor()}}>
            <span className="status-dot">●</span> {sentiment.positive > sentiment.negative ? 'Healthy' : 'Needs Attention'}
          </div>
          <div className="velocity-badge">
            {getTrendDirection()} {getMentionVelocity()} mentions (5min)
          </div>
        </div>
        <div className="navbar-menu-premium">
          <span className="user-info-premium">👤 {user.email}</span>
          <button 
            onClick={() => navigate('/home')}
            className="btn-icon"
            title="Home"
            style={{ background: '#10b981', color: 'white', fontWeight: '600', padding: '8px 12px', borderRadius: '6px', marginRight: '8px' }}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="btn-icon"
            title="Custom Reports"
            style={{ background: '#764ba2', color: 'white', fontWeight: '600', padding: '8px 12px', borderRadius: '6px', marginRight: '8px' }}
          >
            📑 Reports
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="btn-icon"
            title="Advanced Analytics"
            style={{ background: '#667eea', color: 'white', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' }}
          >
            🎯 Analytics
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="btn-icon"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={handleExport}
            className="btn-icon"
            title="Export CSV"
          >
            💾
          </button>
          <button 
            onClick={async () => {
              try {
                const r = await fetch('http://localhost:3000/api/debug/emit');
                const j = await r.json();
                if (j && j.ok && j.mention) {
                  setMentions((prev) => [j.mention, ...prev].slice(0, 500))
                }
              } catch (e) {
                console.error('emit test failed', e)
              }
            }}
            title="Add Test Mention"
            className="btn-icon"
            style={{ background: '#ffb86b' }}
          >
            ✨
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content-premium">
        {/* Top Stats Row */}
        <div className="stats-row-premium">
          <div className="stat-card premium-gradient-1">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Total Mentions</div>
              <div className="stat-value">{mentions.length}</div>
              <div className="stat-trend">+12% from yesterday</div>
            </div>
          </div>
          <div className="stat-card premium-gradient-2">
            <div className="stat-icon">😊</div>
            <div className="stat-content">
              <div className="stat-label">Sentiment Health</div>
              <div className="stat-value">{getEngagementScore()}%</div>
              <div className="stat-trend">Positive ratio</div>
            </div>
          </div>
          <div className="stat-card premium-gradient-3">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-label">Engagement Rate</div>
              <div className="stat-value">{Math.round((sentiment.positive / mentions.length * 100) || 0)}%</div>
              <div className="stat-trend">{sentiment.positive} positive</div>
            </div>
          </div>
          <div className="stat-card premium-gradient-4">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-label">Mention Velocity</div>
              <div className="stat-value">{getMentionVelocity()}</div>
              <div className="stat-trend">Last 5 minutes</div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-section-premium">
          <div className="kpi-card-premium sentiment-positive">
            <div className="kpi-icon">✓</div>
            <div className="kpi-label">Positive</div>
            <div className="kpi-value">{sentiment.positive}</div>
          </div>
          <div className="kpi-card-premium sentiment-negative">
            <div className="kpi-icon">✗</div>
            <div className="kpi-label">Negative</div>
            <div className="kpi-value">{sentiment.negative}</div>
          </div>
          <div className="kpi-card-premium sentiment-neutral">
            <div className="kpi-icon">→</div>
            <div className="kpi-label">Neutral</div>
            <div className="kpi-value">{sentiment.neutral}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-section-premium">
          {/* Sentiment Trend */}
          <div className="chart-card-premium full-width">
            <div className="chart-header">
              <h3>📊 Sentiment Trend (30 min)</h3>
              <span className="chart-refresh">● Live</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sentimentTrend}>
                <defs>
                  <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="negGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{fontSize: '12px'}} />
                <YAxis stroke="#9ca3af" style={{fontSize: '12px'}} />
                <Tooltip 
                  contentStyle={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px'}}
                  labelStyle={{color:'#2c3e50'}}
                />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="url(#posGradient)" name="Positive" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="url(#negGradient)" name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-card-premium">
            <div className="chart-header">
              <h3>🥧 Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Topics */}
          <div className="chart-card-premium">
            <div className="chart-header">
              <h3>🏷️ Top Topics</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{fontSize: '12px'}} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" style={{fontSize: '12px'}} />
                <Tooltip contentStyle={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline */}
          <div className="chart-card-premium full-width">
            <div className="chart-header">
              <h3>📅 Mention Timeline (60 min)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{fontSize: '11px'}} />
                <YAxis stroke="#9ca3af" style={{fontSize: '12px'}} />
                <Tooltip contentStyle={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px'}} />
                <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="filters-section-premium">
          <h3>� Filter & Search</h3>
          <div className="filter-controls-premium">
            <input
              type="text"
              placeholder="Search mentions..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="search-input-premium"
            />
            <select
              value={filter.sentiment}
              onChange={(e) => setFilter({ ...filter, sentiment: e.target.value })}
              className="filter-select-premium"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">😊 Positive</option>
              <option value="negative">😢 Negative</option>
              <option value="neutral">😐 Neutral</option>
            </select>
            <select
              value={filter.source}
              onChange={(e) => setFilter({ ...filter, source: e.target.value })}
              className="filter-select-premium"
            >
              <option value="all">All Sources</option>
              <option value="debug">Debug</option>
              <option value="rss">RSS</option>
              <option value="reddit">Reddit</option>
            </select>
          </div>
        </div>

        {/* Mentions Feed */}
        <div className="feed-section-premium">
          <div className="feed-header-premium">
            <h3>📰 Latest Mentions ({filteredMentions.length})</h3>
            <div className="feed-stats">
              <span className="stat-badge">Updated {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'n/a'}</span>
            </div>
          </div>
          <div className="mention-feed-premium">
            {filteredMentions.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-icon">📭</div>
                <p>No mentions found</p>
              </div>
            ) : (
              filteredMentions.map((m, idx) => (
                <article
                  key={m.id}
                  className={`mention-card-premium sentiment-${m.sentiment_label}`}
                  onClick={() => setExpandedCard(expandedCard === m.id ? null : m.id)}
                >
                  <div className="mention-card-top">
                    <div className="mention-badges">
                      <span className="badge badge-source">{m.source.toUpperCase()}</span>
                      <span className={`badge badge-sentiment sentiment-${m.sentiment_label}`}>
                        {m.sentiment_label === 'positive' ? '😊' : m.sentiment_label === 'negative' ? '😢' : '😐'} {m.sentiment_label.toUpperCase()}
                      </span>
                      <span className="badge badge-score">{m.sentiment_score.toFixed(2)}</span>
                    </div>
                    <span className="mention-time">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="mention-title-premium">
                    <a href={m.url || '#'} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      {m.title || 'Untitled mention'}
                    </a>
                  </h4>
                  <p className="mention-content-premium">
                    {(m.content || '').slice(0, 150)}...
                  </p>
                  <div className="mention-topics">
                    {Array.isArray(m.topics) && m.topics.map((t, i) => (
                      <span key={i} className="topic-badge-premium">#{t}</span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {debugPreview()}
      </div>
    </div>
  )
}
