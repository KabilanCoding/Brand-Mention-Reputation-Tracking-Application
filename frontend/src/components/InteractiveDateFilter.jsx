import React, { useState } from 'react'

export default function InteractiveDateFilter({ onFilterChange, currentFilter }) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const quickFilters = [
    { label: 'Last Hour', days: 0.04, color: '#667eea' },
    { label: 'Last 24h', days: 1, color: '#764ba2' },
    { label: 'Last 7 Days', days: 7, color: '#f093fb' },
    { label: 'Last 30 Days', days: 30, color: '#f5576c' },
  ]

  const handleQuickFilter = (days) => {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    onFilterChange({ dateRange: { start: start.toISOString(), end: end.toISOString() } })
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      border: '2px solid rgba(102, 126, 234, 0.2)'
    }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: '600', color: '#1f2937', minWidth: '100px' }}>📅 Date Range:</span>
        {quickFilters.map(filter => (
          <button
            key={filter.label}
            onClick={() => handleQuickFilter(filter.days)}
            style={{
              padding: '8px 16px',
              background: filter.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {filter.label}
          </button>
        ))}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            marginLeft: 'auto'
          }}
        >
          {showDatePicker ? '✕ Close' : '📆 Custom'}
        </button>
      </div>

      {showDatePicker && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <input
            type="datetime-local"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={{
              padding: '10px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontFamily: 'inherit'
            }}
          />
          <input
            type="datetime-local"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={{
              padding: '10px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => {
              onFilterChange({ dateRange })
              setShowDatePicker(false)
            }}
            style={{
              padding: '10px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
