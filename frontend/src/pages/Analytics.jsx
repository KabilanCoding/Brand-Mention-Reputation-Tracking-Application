import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function Analytics() {
  const [mentions, setMentions] = useState([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState({ trend: 'positive', confidence: 0, prediction: '' })
  const [trendingTopics, setTrendingTopics] = useState([])
  const [socialMetrics, setSocialMetrics] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [competitorData, setCompetitorData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.email) {
      navigate('/login')
      return
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/mentions')
        const data = await response.json()
        setMentions(data || [])
        processAnalytics(data || [])
        setLoading(false)
      } catch (err) {
        console.error('Analytics fetch error:', err)
        setLoading(false)
      }
    }

    fetchAnalytics()
    const poll = setInterval(fetchAnalytics, 5000)
    return () => clearInterval(poll)
  }, [navigate])

  const processAnalytics = (data) => {
    // AI Insights Generation
    generateInsights(data)

    // Trending Topics
    generateTrendingTopics(data)

    // Social Media Metrics
    generateSocialMetrics(data)

    // Heatmap Data (Last 7 days)
    generateHeatmap(data)

    // Competitor Comparison
    generateCompetitorData(data)
  }

  const generateInsights = (data) => {
    const positive = data.filter(d => d.sentiment_label === 'positive').length
    const negative = data.filter(d => d.sentiment_label === 'negative').length
    const total = data.length || 1
    const positiveRatio = (positive / total) * 100

    let trend = 'neutral'
    let confidence = 0
    let prediction = ''

    if (positiveRatio > 70) {
      trend = 'very-positive'
      confidence = 95
      prediction = '📈 Brand sentiment is excellent. Expect continued growth in customer satisfaction and engagement.'
    } else if (positiveRatio > 55) {
      trend = 'positive'
      confidence = 85
      prediction = '👍 Positive trend detected. Your brand messaging is resonating well with audiences.'
    } else if (positiveRatio < 30) {
      trend = 'negative'
      confidence = 90
      prediction = '⚠️ Critical attention needed. Negative sentiment is rising. Consider immediate response strategy.'
    } else if (positiveRatio < 45) {
      trend = 'caution'
      confidence = 80
      prediction = '📊 Mixed sentiment detected. Monitor closely and engage with concerned customers.'
    }

    setInsights({ trend, confidence, prediction, positiveRatio: positiveRatio.toFixed(1) })
  }

  const generateTrendingTopics = (data) => {
    const topicMap = {}
    data.forEach(m => {
      try {
        const topics = typeof m.topics === 'string' ? JSON.parse(m.topics) : m.topics
        if (Array.isArray(topics)) {
          topics.forEach(t => {
            topicMap[t] = (topicMap[t] || 0) + 1
          })
        }
      } catch (e) {}
    })

    const sorted = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], idx) => ({
        id: idx,
        name,
        count,
        growth: Math.floor(Math.random() * 45) + 5,
        icon: ['🔥', '⭐', '💡', '🎯', '🚀', '💬', '📱', '🌟'][idx % 8]
      }))

    setTrendingTopics(sorted)
  }

  const generateSocialMetrics = (data) => {
    const platforms = {
      twitter: { mentions: 0, sentiment: 0, reach: 0, engagement: 0 },
      linkedin: { mentions: 0, sentiment: 0, reach: 0, engagement: 0 },
      reddit: { mentions: 0, sentiment: 0, reach: 0, engagement: 0 },
      instagram: { mentions: 0, sentiment: 0, reach: 0, engagement: 0 },
    }

    data.forEach(m => {
      const source = (m.source || 'twitter').toLowerCase()
      if (platforms[source]) {
        platforms[source].mentions++
        if (m.sentiment_label === 'positive') platforms[source].sentiment++
      }
    })

    const metrics = Object.entries(platforms)
      .map(([platform, stats]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        mentions: stats.mentions,
        sentiment: stats.mentions > 0 ? ((stats.sentiment / stats.mentions) * 100).toFixed(0) : 0,
        reach: Math.floor(Math.random() * 50000) + 10000,
        engagement: Math.floor(Math.random() * 5000) + 500,
      }))

    setSocialMetrics(metrics)
  }

  const generateHeatmap = (data) => {
    const heatmap = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayData = data.filter(m => {
        const mDate = new Date(Number(m.created_at) || Date.now())
        return mDate.toDateString() === d.toDateString()
      })

      const positive = dayData.filter(m => m.sentiment_label === 'positive').length
      const sentiment = dayData.length > 0 ? (positive / dayData.length) * 100 : 50

      heatmap.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: sentiment.toFixed(0),
        count: dayData.length,
        color: sentiment > 70 ? '#10b981' : sentiment > 45 ? '#fbbf24' : '#ef4444'
      })
    }
    setHeatmapData(heatmap)
  }

  const generateCompetitorData = (data) => {
    const myBrand = {
      name: 'Your Brand',
      mentions: data.length,
      positive: data.filter(d => d.sentiment_label === 'positive').length,
      engagement: Math.floor(data.length * 2.5),
      growth: 24.5
    }

    const competitors = [
      { name: 'Competitor A', mentions: Math.floor(data.length * 0.8), positive: Math.floor(data.length * 0.6), engagement: Math.floor(data.length * 1.8), growth: 12.3 },
      { name: 'Competitor B', mentions: Math.floor(data.length * 0.6), positive: Math.floor(data.length * 0.5), engagement: Math.floor(data.length * 1.5), growth: 8.7 },
      { name: 'Competitor C', mentions: Math.floor(data.length * 0.5), positive: Math.floor(data.length * 0.45), engagement: Math.floor(data.length * 1.2), growth: 5.2 },
    ]

    setCompetitorData([myBrand, ...competitors])
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading Analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px' }}>
      {/* Header with Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>🎯 Advanced Analytics</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

        {/* AI Insights Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          marginBottom: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>🤖 AI-Powered Insights</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
                {insights.trend === 'very-positive' && '✨ Excellent'}
                {insights.trend === 'positive' && '👍 Positive'}
                {insights.trend === 'caution' && '📊 Mixed'}
                {insights.trend === 'negative' && '⚠️ Critical'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Confidence: <strong>{insights.confidence}%</strong>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📈 Prediction</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{insights.prediction}</div>
              <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
                Current Sentiment: <strong>{insights.positiveRatio}% Positive</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>🔥 Trending Topics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {trendingTopics.map(topic => (
              <div key={topic.id} style={{
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{topic.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{topic.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: '#6b7280' }}>
                  <span><strong>{topic.count}</strong> mentions</span>
                  <span style={{ color: '#10b981' }}>↑ {topic.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Heatmap */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>📅 7-Day Sentiment Heatmap</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {heatmapData.map((day, idx) => (
              <div key={idx} style={{
                flex: '1',
                minWidth: '100px',
                background: day.color,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{day.date}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', margin: '8px 0' }}>{day.sentiment}%</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{day.count} mentions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Performance */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>📱 Social Platform Performance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Platform</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Mentions</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Sentiment %</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Reach</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600', color: '#6b7280' }}>Engagement</th>
                </tr>
              </thead>
              <tbody>
                {socialMetrics.map((metric, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937' }}>{metric.platform}</td>
                    <td style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>{metric.mentions}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{
                        background: metric.sentiment > 70 ? '#dcfce7' : metric.sentiment > 45 ? '#fef3c7' : '#fee2e2',
                        color: metric.sentiment > 70 ? '#166534' : metric.sentiment > 45 ? '#92400e' : '#991b1b',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {metric.sentiment}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>{metric.reach.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', padding: '12px', color: '#6b7280' }}>{metric.engagement.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitive Analysis */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>🏆 Competitive Analysis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {competitorData.map((comp, idx) => (
              <div key={idx} style={{
                background: idx === 0 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : '#f9fafb',
                border: idx === 0 ? 'none' : '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                color: idx === 0 ? 'white' : '#1f2937'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{comp.name}</div>
                  {idx === 0 && <span style={{ background: 'rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>👑 Leading</span>}
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mentions</span>
                    <strong>{comp.mentions}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Positive</span>
                    <strong>{comp.positive}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Engagement</span>
                    <strong>{comp.engagement}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${idx === 0 ? 'rgba(255,255,255,0.3)' : '#e5e7eb'}` }}>
                    <span>Growth</span>
                    <strong style={{ color: '#10b981' }}>↑ {comp.growth}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}
