import React, { useState, useMemo } from 'react'

export default function AdvancedSearch({ data, onResults, placeholder = 'Search mentions...' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({ sentiment: 'all', source: 'all' })
  const [isExpanded, setIsExpanded] = useState(false)

  const results = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSentiment = selectedFilters.sentiment === 'all' || 
        item.sentiment_label === selectedFilters.sentiment
      
      const matchesSource = selectedFilters.source === 'all' || 
        item.source === selectedFilters.source

      return matchesSearch && matchesSentiment && matchesSource
    })
  }, [searchTerm, selectedFilters, data])

  React.useEffect(() => {
    onResults(results)
  }, [results, onResults])

  const sources = [...new Set(data.map(item => item.source))]
  const sentiments = ['positive', 'negative', 'neutral']

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '24px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: isExpanded ? '16px' : '0'
      }}>
        <span style={{ fontSize: '18px' }}>🔍</span>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsExpanded(true)
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea'
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            setIsExpanded(true)
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={() => {
            setSearchTerm('')
            setSelectedFilters({ sentiment: 'all', source: 'all' })
            setIsExpanded(false)
          }}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#dc2626'}
          onMouseOut={(e) => e.target.style.background = '#ef4444'}
        >
          Clear
        </button>
      </div>

      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '2px solid #e5e7eb'
        }}>
          {/* Sentiment Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
              Sentiment
            </label>
            <select
              value={selectedFilters.sentiment}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, sentiment: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Sentiments</option>
              {sentiments.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
              Source
            </label>
            <select
              value={selectedFilters.source}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, source: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Sources</option>
              {sources.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px'
          }}>
            <div style={{
              background: '#dbeafe',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#1e40af',
              width: '100%',
              textAlign: 'center'
            }}>
              {results.length} results
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
