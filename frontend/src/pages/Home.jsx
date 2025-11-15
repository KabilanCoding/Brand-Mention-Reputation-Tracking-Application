import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState({ mentions: 0, alerts: 0, topics: 0 })
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/mentions')
        const data = await response.json()
        setStats({
          mentions: data.length || 0,
          alerts: Math.floor(Math.random() * 5) + 1,
          topics: 12
        })
      } catch (err) {
        setStats({ mentions: 14, alerts: 2, topics: 12 })
      }
    }
    fetchStats()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleGoToDashboard = async () => {
    setLoadingDashboard(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    navigate('/dashboard')
  }

  return (
    <div className="home-container-premium">
      {/* Navigation */}
      <nav className="navbar-home">
        <div className="navbar-home-content">
          <div className="navbar-logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Brand Monitor</span>
          </div>
          <div className="navbar-user-menu">
            <div className="user-badge">
              <span className="user-initial">{user.email?.charAt(0).toUpperCase()}</span>
              <div className="user-info">
                <p className="user-email">{user.email}</p>
                <p className="user-company">{user.company || 'User'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout-home">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section-premium">
        <div className="hero-overlay"></div>
        <div className="hero-content-home">
          <div className="hero-text-premium">
            <h1 className="hero-title">
              Welcome back, <span className="company-name">{user.company || 'User'}</span>! 👋
            </h1>
            <p className="hero-subtitle">
              Your brand monitoring dashboard is ready. Track mentions, analyze sentiment, and stay ahead of the conversation.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.mentions}</span>
                <span className="stat-label">Mentions Tracked</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.alerts}</span>
                <span className="stat-label">Active Alerts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.topics}</span>
                <span className="stat-label">Topics Monitored</span>
              </div>
            </div>
            <button
              onClick={handleGoToDashboard}
              className="btn-dashboard-launch"
              disabled={loadingDashboard}
            >
              {loadingDashboard ? (
                <>
                  <span className="spinner-small"></span>
                  Loading...
                </>
              ) : (
                <>
                  Go to Dashboard
                  <span className="arrow-icon">→</span>
                </>
              )}
            </button>
          </div>
          <div className="hero-illustration">
            <div className="illustration-content">
              <div className="chart-preview">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-home">
        <div className="section-header">
          <h2>Why choose Brand Monitor?</h2>
          <p>Everything you need to manage your brand reputation</p>
        </div>
        <div className="features-grid">
          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">01</span>
              <span className="feature-icon">📊</span>
            </div>
            <h3>Real-time Analytics</h3>
            <p>Monitor brand mentions across multiple sources in real-time. Get instant insights into what people are saying about you.</p>
            <div className="feature-benefits">
              <span>✓ Live updates</span>
              <span>✓ Multi-source</span>
            </div>
          </div>

          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">02</span>
              <span className="feature-icon">💚</span>
            </div>
            <h3>Sentiment Analysis</h3>
            <p>Automatically categorize mentions by sentiment. Understand your audience's emotional response to your brand.</p>
            <div className="feature-benefits">
              <span>✓ AI-powered</span>
              <span>✓ Accurate</span>
            </div>
          </div>

          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">03</span>
              <span className="feature-icon">🔔</span>
            </div>
            <h3>Smart Alerts</h3>
            <p>Get notified when unusual spikes in mentions occur. Stay informed about trending topics and potential crises.</p>
            <div className="feature-benefits">
              <span>✓ Instant notifications</span>
              <span>✓ Smart filtering</span>
            </div>
          </div>

          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">04</span>
              <span className="feature-icon">�️</span>
            </div>
            <h3>Topic Clustering</h3>
            <p>Automatically group related mentions. Identify key conversation topics and trends affecting your brand.</p>
            <div className="feature-benefits">
              <span>✓ Auto-clustering</span>
              <span>✓ Trend detection</span>
            </div>
          </div>

          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">05</span>
              <span className="feature-icon">📥</span>
            </div>
            <h3>Data Export</h3>
            <p>Export your data in multiple formats. Integrate with your existing tools and workflows seamlessly.</p>
            <div className="feature-benefits">
              <span>✓ CSV export</span>
              <span>✓ API access</span>
            </div>
          </div>

          <div className="feature-card-home">
            <div className="feature-header">
              <span className="feature-number">06</span>
              <span className="feature-icon">�️</span>
            </div>
            <h3>Enterprise Security</h3>
            <p>Your data is protected with enterprise-grade security. Rest assured your sensitive information is always safe.</p>
            <div className="feature-benefits">
              <span>✓ Encrypted</span>
              <span>✓ Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Analytics Preview */}
      <section style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div className="section-header">
          <h2>Advanced Analytics & Insights</h2>
          <p>Go deeper with AI-powered analytics, competitive analysis, and trend predictions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>AI-Powered Insights</h3>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>Get intelligent recommendations and predictions based on sentiment analysis</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>7-Day Heatmap</h3>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>Visualize sentiment patterns across days to identify trends and anomalies</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Competitive Analysis</h3>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>Compare your brand against competitors in real-time with detailed metrics</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Trending Topics</h3>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>Discover what people are talking about with live trend detection</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#1f2937',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Platform Analytics</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Detailed performance metrics for each social platform</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: '#1f2937',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Real-Time Updates</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>All analytics refresh automatically to keep you informed</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={() => navigate('/analytics')}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🎯 Explore Advanced Analytics
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-works-section">
        <div className="section-header">
          <h2>How it works</h2>
          <p>Three simple steps to start monitoring your brand</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Connect Sources</h3>
            <p>Link your brand keywords and select sources to monitor (RSS, Reddit, Twitter, etc.)</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Analyze Mentions</h3>
            <p>Our AI automatically analyzes sentiment, clusters topics, and detects anomalies</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Take Action</h3>
            <p>Respond to feedback, engage with your audience, and improve your brand presence</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to take control?</h2>
          <p>Start monitoring your brand reputation today</p>
          <button onClick={handleGoToDashboard} className="btn-cta-primary">
            Launch Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Brand Monitor</h4>
            <p>Intelligent reputation tracking for your brand</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#terms">Terms</a></li>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#cookies">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Brand Monitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
