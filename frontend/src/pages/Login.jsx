import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format')
      }
      if (password.length < 3) {
        throw new Error('Password must be at least 3 characters')
      }

      // Store user info and preferences
      localStorage.setItem('user', JSON.stringify({ email, role: 'admin', loginTime: new Date().toISOString() }))
      
      if (rememberMe) {
        localStorage.setItem('savedEmail', email)
      } else {
        localStorage.removeItem('savedEmail')
      }

      setIsLoading(false)
      navigate('/home')
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">📊</div>
            <h1>Brand Monitor</h1>
            <p>Intelligent Reputation Tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group-enhanced">
              <label htmlFor="email">📧 Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="form-input-enhanced"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group-enhanced">
              <label htmlFor="password">🔑 Password</label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input-enhanced"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => setError('Password reset coming soon!')}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className={`message ${error.includes('Success') ? 'success' : 'error'}`}>
                <span className="message-icon">
                  {error.includes('Success') ? '✅' : '⚠️'}
                </span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="login-divider">or</div>

          <button className="btn-social" disabled={isLoading}>
            <span>🔑</span> Sign in with Demo
          </button>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="link-button-enhanced"
                disabled={isLoading}
              >
                Create one →
              </button>
            </p>
            <div className="login-features">
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Real-time Monitoring</h3>
            <p>Get instant alerts on brand mentions</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Track sentiment trends across channels</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Smart Insights</h3>
            <p>AI-powered recommendations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
