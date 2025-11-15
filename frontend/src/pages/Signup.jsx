import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: 'technology'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return strength
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const { company, email, password, confirmPassword, industry } = formData

      if (!company || !email || !password || !confirmPassword) {
        throw new Error('Please fill in all fields')
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      localStorage.setItem('user', JSON.stringify({
        email,
        company,
        industry,
        role: 'admin',
        signupDate: new Date().toISOString()
      }))

      setSuccess('✅ Account created successfully! Redirecting...')
      setIsLoading(false)
      
      setTimeout(() => {
        navigate('/home')
      }, 1500)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return '#9ca3af'
    if (passwordStrength === 1) return '#ef4444'
    if (passwordStrength === 2) return '#f59e0b'
    if (passwordStrength === 3) return '#3b82f6'
    return '#10b981'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'No password'
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Fair'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="signup-content">
        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-logo">✨</div>
            <h1>Create Your Account</h1>
            <p>Join thousands monitoring their brand</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group-enhanced">
                <label htmlFor="company">🏢 Company Name</label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className="form-input-enhanced"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-enhanced">
                <label htmlFor="email">📧 Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@company.com"
                  className="form-input-enhanced"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-enhanced">
                <label htmlFor="industry">🏭 Industry</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="form-input-enhanced"
                  disabled={isLoading}
                >
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="media">Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-enhanced">
                <label htmlFor="password">🔑 Password</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
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
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{
                            background: i < passwordStrength ? getStrengthColor() : '#e5e7eb'
                          }}
                        ></div>
                      ))}
                    </div>
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-enhanced">
                <label htmlFor="confirm">🔒 Confirm Password</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="form-input-enhanced"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={isLoading}
                  >
                    {showConfirm ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="signup-terms">
              <label className="checkbox-wrapper">
                <input type="checkbox" disabled={isLoading} />
                <span>
                  I agree to the{' '}
                  <button type="button" className="link-text">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="link-text">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <div className="message error">
                <span className="message-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="message success">
                <span className="message-icon">✅</span>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn-signup"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="link-button-enhanced"
                disabled={isLoading}
              >
                Sign in →
              </button>
            </p>
          </div>
        </div>

        <div className="signup-benefits">
          <h3>Why join Brand Monitor?</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">🚀</span>
              <div>
                <h4>Get started in minutes</h4>
                <p>No complex setup required</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📈</span>
              <div>
                <h4>Real-time insights</h4>
                <p>Monitor mentions as they happen</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🛡️</span>
              <div>
                <h4>Enterprise security</h4>
                <p>Your data is always protected</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <div>
                <h4>Smart alerts</h4>
                <p>Never miss important mentions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
