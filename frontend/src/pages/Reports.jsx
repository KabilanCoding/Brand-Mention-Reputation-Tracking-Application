import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Reports() {
  const [mentions, setMentions] = useState([])
  const [reportType, setReportType] = useState('summary')
  const [dateRange, setDateRange] = useState('7days')
  const [generating, setGenerating] = useState(false)
  const [templates, setTemplates] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.email) {
      navigate('/login')
      return
    }

    const fetchMentions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/mentions')
        const data = await response.json()
        setMentions(data || [])
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }

    fetchMentions()
  }, [navigate])

  const generateReport = async (type) => {
    setGenerating(true)
    try {
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create report data based on type
      const reportData = generateReportData(type)
      
      // Create CSV content
      const csv = createCSVContent(reportData, type)
      
      // Download CSV
      downloadFile(csv, `brand-monitor-${type}-report-${new Date().toISOString().split('T')[0]}.csv`)
      
      setGenerating(false)
    } catch (err) {
      console.error('Error:', err)
      setGenerating(false)
    }
  }

  const generateReportData = (type) => {
    const positive = mentions.filter(m => m.sentiment_label === 'positive').length
    const negative = mentions.filter(m => m.sentiment_label === 'negative').length
    const neutral = mentions.filter(m => m.sentiment_label === 'neutral').length
    const total = mentions.length || 1

    if (type === 'summary') {
      return {
        title: 'Brand Monitor - Executive Summary',
        generatedDate: new Date().toLocaleString(),
        metrics: {
          'Total Mentions': total,
          'Positive Sentiment': positive,
          'Negative Sentiment': negative,
          'Neutral Sentiment': neutral,
          'Positive %': ((positive / total) * 100).toFixed(2),
          'Negative %': ((negative / total) * 100).toFixed(2),
        }
      }
    } else if (type === 'detailed') {
      return {
        title: 'Brand Monitor - Detailed Report',
        generatedDate: new Date().toLocaleString(),
        mentions: mentions
      }
    } else if (type === 'competitive') {
      return {
        title: 'Brand Monitor - Competitive Analysis',
        generatedDate: new Date().toLocaleString(),
        yourBrand: {
          mentions: total,
          positive: positive,
          engagement: Math.floor(total * 2.5)
        },
        competitors: [
          { name: 'Competitor A', mentions: Math.floor(total * 0.8) },
          { name: 'Competitor B', mentions: Math.floor(total * 0.6) }
        ]
      }
    }
  }

  const createCSVContent = (data, type) => {
    let csv = `${data.title}\n`
    csv += `Generated: ${data.generatedDate}\n\n`

    if (type === 'summary') {
      csv += 'Metric,Value\n'
      Object.entries(data.metrics).forEach(([key, value]) => {
        csv += `${key},${value}\n`
      })
    } else if (type === 'detailed') {
      csv += 'ID,Title,Source,Sentiment,Created Date\n'
      data.mentions.forEach(m => {
        csv += `${m.id},"${m.title}","${m.source}","${m.sentiment_label}","${new Date(Number(m.created_at) || Date.now()).toLocaleString()}"\n`
      })
    } else if (type === 'competitive') {
      csv += 'Brand,Mentions,Positive Sentiment,Engagement\n'
      csv += `Your Brand,${data.yourBrand.mentions},${data.yourBrand.positive},${data.yourBrand.engagement}\n`
      data.competitors.forEach(c => {
        csv += `${c.name},${c.mentions},N/A,N/A\n`
      })
    }

    return csv
  }

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reportTemplates = [
    {
      id: 'summary',
      title: '📊 Executive Summary',
      description: 'High-level overview of key metrics and trends',
      icon: '📈',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'detailed',
      title: '📋 Detailed Report',
      description: 'Complete list of all mentions with sentiment analysis',
      icon: '📝',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'competitive',
      title: '🏆 Competitive Analysis',
      description: 'Benchmark against competitors with key metrics',
      icon: '⚔️',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              📑 Custom Reports
            </h1>
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
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Generate customized reports for your brand monitoring data
          </p>
        </div>

        {/* Report Templates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {reportTemplates.map(template => (
            <div
              key={template.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {/* Color Bar */}
              <div style={{
                background: template.color,
                height: '4px'
              }}></div>

              {/* Content */}
              <div style={{ padding: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>
                  {template.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
                  {template.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>
                  {template.description}
                </p>

                {/* Date Range Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => generateReport(template.id)}
                  disabled={generating}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: generating ? '#d1d5db' : template.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {generating ? '⏳ Generating...' : '⬇️ Download CSV'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 24px 0' }}>
            📊 Current Data Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Total Mentions</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#166534' }}>
                {mentions.length}
              </div>
            </div>
            <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '12px', border: '1px solid #86efac' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Positive</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#15803d' }}>
                {mentions.filter(m => m.sentiment_label === 'positive').length}
              </div>
            </div>
            <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Negative</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#991b1b' }}>
                {mentions.filter(m => m.sentiment_label === 'negative').length}
              </div>
            </div>
            <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '12px', border: '1px solid #d1d5db' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Neutral</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6b7280' }}>
                {mentions.filter(m => m.sentiment_label === 'neutral').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
