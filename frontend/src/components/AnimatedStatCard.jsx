import React, { useState, useEffect } from 'react'

export default function AnimatedStatCard({ icon, label, value, color, subtext, trend }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!value) return
    
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const stepValue = value / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setDisplayValue(Math.min(Math.floor(currentStep * stepValue), value))
      if (currentStep >= steps) clearInterval(interval)
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}15, ${color}08)`,
      border: `2px solid ${color}30`,
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = `0 12px 24px ${color}30`
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${color}40, transparent)`,
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
          {label}
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: color,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {displayValue.toLocaleString()}
          {trend && (
            <span style={{
              fontSize: '14px',
              color: trend.direction === 'up' ? '#10b981' : '#ef4444',
              fontWeight: '600'
            }}>
              {trend.direction === 'up' ? '📈' : '📉'} {trend.value}%
            </span>
          )}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {subtext}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
