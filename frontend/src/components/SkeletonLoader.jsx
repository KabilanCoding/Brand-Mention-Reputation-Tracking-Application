import React from 'react'

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  const skeletons = Array(count).fill(0)

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            style={{
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '20px',
              animation: 'skeleton-loading 1s infinite'
            }}
          >
            <div style={{
              height: '40px',
              background: '#e5e7eb',
              borderRadius: '8px',
              marginBottom: '12px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              height: '16px',
              background: '#e5e7eb',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              height: '16px',
              background: '#e5e7eb',
              borderRadius: '4px',
              width: '80%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#e5e7eb',
              borderRadius: '8px'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                height: '16px',
                background: '#e5e7eb',
                borderRadius: '4px',
                marginBottom: '8px'
              }} />
              <div style={{
                height: '12px',
                background: '#e5e7eb',
                borderRadius: '4px',
                width: '60%'
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      background: '#f3f4f6',
      borderRadius: '12px',
      padding: '20px',
      height: '200px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  )
}

export const SkeletonStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes skeleton-loading {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
`
