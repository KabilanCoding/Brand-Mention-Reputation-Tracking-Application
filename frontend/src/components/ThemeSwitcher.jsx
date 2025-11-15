import React, { useState, useEffect } from 'react'

const THEMES = {
  ocean: {
    name: 'Ocean Blue',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#4facfe',
    light: '#e0e7ff'
  },
  sunset: {
    name: 'Sunset Red',
    primary: '#f5576c',
    secondary: '#f093fb',
    accent: '#ff6b6b',
    light: '#ffe0e0'
  },
  forest: {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    light: '#d1fae5'
  },
  midnight: {
    name: 'Midnight Purple',
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#d946ef',
    light: '#f3e8ff'
  }
}

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('appTheme')
    return saved || 'ocean'
  })

  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme)
    const theme = THEMES[currentTheme]
    document.documentElement.style.setProperty('--primary-color', theme.primary)
    document.documentElement.style.setProperty('--secondary-color', theme.secondary)
    document.documentElement.style.setProperty('--accent-color', theme.accent)
  }, [currentTheme])

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Theme:</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setCurrentTheme(key)}
            title={theme.name}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: theme.primary,
              border: currentTheme === key ? '3px solid #1f2937' : '2px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: currentTheme === key ? 'scale(1.1)' : 'scale(1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'}
            onMouseOut={(e) => e.target.style.transform = currentTheme === key ? 'scale(1.1)' : 'scale(1)'}
          />
        ))}
      </div>
    </div>
  )
}

export { THEMES }
