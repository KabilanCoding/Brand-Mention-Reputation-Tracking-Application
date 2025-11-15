import React, { useState, useEffect } from 'react'

export default function MentionCard({ mention, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [sentimentColor, setSentimentColor] = useState('#6b7280')

  useEffect(() => {
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#6b7280'
    }
    setSentimentColor(colors[mention.sentiment_label] || '#6b7280')
  }, [mention.sentiment_label])

  const sentimentEmoji = {
    positive: '😊',
    negative: '😠',
    neutral: '😐'
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        border: `2px solid ${sentimentColor}30`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: expanded ? 'scale(1.02)' : 'scale(1)',
        boxShadow: expanded ? `0 8px 24px ${sentimentColor}20` : '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseOver={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 6px 16px ${sentimentColor}20`
        }
      }}
      onMouseOut={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: expanded ? '12px' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>
              {sentimentEmoji[mention.sentiment_label] || '🤔'}
            </span>
            <div>
              <span style={{
                background: sentimentColor,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {mention.sentiment_label}
              </span>
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                {mention.source}
              </span>
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px',
            lineHeight: '1.4'
          }}>
            {mention.title}
          </div>
          {mention.sentiment_score && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Confidence: {mention.sentiment_score}%
            </div>
          )}
        </div>
        <span style={{
          fontSize: '18px',
          transition: 'transform 0.3s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </div>

      {expanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${sentimentColor}20`,
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{
            background: `${sentimentColor}08`,
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#374151',
            lineHeight: '1.5',
            marginBottom: '12px'
          }}>
            {mention.title}
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {mention.topics && Array.isArray(mention.topics) && mention.topics.slice(0, 5).map((topic, idx) => (
              <span
                key={idx}
                style={{
                  background: '#e5e7eb',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#374151',
                  fontWeight: '500'
                }}
              >
                #{topic}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            {mention.created_at ? new Date(Number(mention.created_at)).toLocaleString() : 'Recently'}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
