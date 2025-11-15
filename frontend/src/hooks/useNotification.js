import React, { useState, useCallback } from 'react'

export default function useNotification() {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const notification = { id, message, type }

    setNotifications(prev => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const NotificationContainer = () => {
    const getColor = (type) => {
      const colors = {
        success: { bg: '#dcfce7', border: '#10b981', text: '#166534', icon: '✅' },
        error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '❌' },
        warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' }
      }
      return colors[type] || colors.info
    }

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}>
        {notifications.map(notification => {
          const color = getColor(notification.type)
          return (
            <div
              key={notification.id}
              style={{
                background: color.bg,
                border: `2px solid ${color.border}`,
                borderRadius: '8px',
                padding: '16px',
                color: color.text,
                fontWeight: '500',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                animation: 'slideIn 0.3s ease-out',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onClick={() => removeNotification(notification.id)}
            >
              <span style={{ fontSize: '18px' }}>{color.icon}</span>
              <span>{notification.message}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: color.text,
                  padding: '0'
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return {
    addNotification,
    removeNotification,
    NotificationContainer
  }
}

export const createNotificationComponent = () => {
  const hook = useNotification()
  return hook
}
