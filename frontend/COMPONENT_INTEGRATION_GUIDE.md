# 🚀 Component Integration Guide

## Quick Start - Adding Components to Your Pages

### Step 1: Import Components in Dashboard.jsx

```jsx
import AnimatedStatCard from '../components/AnimatedStatCard'
import AdvancedSearch from '../components/AdvancedSearch'
import InteractiveDateFilter from '../components/InteractiveDateFilter'
import MentionCard from '../components/MentionCard'
import SkeletonLoader from '../components/SkeletonLoader'
import useNotification from '../hooks/useNotification'
```

### Step 2: Use in Dashboard Return JSX

```jsx
// Add after the navbar
<InteractiveDateFilter 
  onFilterChange={(filter) => {
    // Handle date range filter
    console.log('Date filter changed:', filter)
  }}
  currentFilter={filter}
/>

// Replace sentiment stats section with animated cards
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
  <AnimatedStatCard
    icon="📈"
    label="Positive Mentions"
    value={sentiment.positive}
    color="#10b981"
    trend={{ direction: 'up', value: 12 }}
  />
  <AnimatedStatCard
    icon="📉"
    label="Negative Mentions"
    value={sentiment.negative}
    color="#ef4444"
    trend={{ direction: 'down', value: 8 }}
  />
  <AnimatedStatCard
    icon="➖"
    label="Neutral Mentions"
    value={sentiment.neutral}
    color="#6b7280"
  />
  <AnimatedStatCard
    icon="💬"
    label="Total Mentions"
    value={mentions.length}
    color="#667eea"
    trend={{ direction: 'up', value: 15 }}
  />
</div>

// Add search component
<AdvancedSearch 
  data={mentions}
  onResults={setFilteredMentions}
  placeholder="Search mentions by title, source..."
/>

// Replace mention list with MentionCard components
{filteredMentions.map(mention => (
  <MentionCard 
    key={mention.id}
    mention={mention}
    onSelect={() => console.log('Selected:', mention)}
  />
))}
```

### Step 3: Add Notifications

```jsx
// In component
const { addNotification, NotificationContainer } = useNotification()

// Trigger notifications
useEffect(() => {
  if (mentions.length > previousMentions) {
    addNotification(
      `New mentions detected! +${mentions.length - previousMentions}`,
      'info',
      3000
    )
  }
}, [mentions, previousMentions])

// Render container
<NotificationContainer />
```

### Step 4: Add Theme Switcher

```jsx
import ThemeSwitcher from '../components/ThemeSwitcher'

// In navbar
<ThemeSwitcher />
```

---

## 📊 Component Props Reference

### AnimatedStatCard
```jsx
<AnimatedStatCard
  icon="📊"              // Emoji icon
  label="Total Mentions" // Display label
  value={1234}          // Number to animate to
  color="#667eea"       // Color theme
  subtext="Last 24h"    // Optional subtitle
  trend={{              // Optional trend indicator
    direction: 'up',    // 'up' or 'down'
    value: 12           // Percentage change
  }}
/>
```

### AdvancedSearch
```jsx
<AdvancedSearch
  data={arrayOfItems}    // Array of items to search
  onResults={setResults} // Callback with filtered results
  placeholder="Search..." // Search input placeholder
/>
```

### InteractiveDateFilter
```jsx
<InteractiveDateFilter
  onFilterChange={(filter) => {}}  // Callback for filter changes
  currentFilter={filterState}      // Current filter state
/>
```

### MentionCard
```jsx
<MentionCard
  mention={mentionObject}          // Mention data
  onSelect={() => {}}              // Callback when clicked
/>
```

### SkeletonLoader
```jsx
<SkeletonLoader
  count={3}            // Number of skeletons
  type="card"          // 'card', 'list', or 'chart'
/>
```

### useNotification
```jsx
const { 
  addNotification,     // Function to show notification
  removeNotification,  // Function to hide notification
  NotificationContainer // Component to render
} = useNotification()

// Add notification
addNotification(
  "Message text",      // Message
  "success",           // Type: success, error, warning, info
  3000                 // Duration in ms (0 = no auto-dismiss)
)
```

### ThemeSwitcher
```jsx
<ThemeSwitcher />  // No props needed, uses localStorage
```

---

## 🎨 Available Themes

```javascript
{
  ocean: {
    name: 'Ocean Blue',
    primary: '#667eea',
    secondary: '#764ba2'
  },
  sunset: {
    name: 'Sunset Red',
    primary: '#f5576c',
    secondary: '#f093fb'
  },
  forest: {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669'
  },
  midnight: {
    name: 'Midnight Purple',
    primary: '#a855f7',
    secondary: '#7c3aed'
  }
}
```

---

## 📋 Integration Checklist

### For Dashboard.jsx:
- [ ] Import all components
- [ ] Add InteractiveDateFilter after navbar
- [ ] Replace stat cards with AnimatedStatCard
- [ ] Add AdvancedSearch above mention list
- [ ] Replace mention rendering with MentionCard
- [ ] Add useNotification hook
- [ ] Add NotificationContainer
- [ ] Test all interactions

### For Analytics.jsx:
- [ ] Import AnimatedStatCard
- [ ] Import SkeletonLoader
- [ ] Use SkeletonLoader while loading
- [ ] Display stats with AnimatedStatCard
- [ ] Add theme consistency

### For Home.jsx:
- [ ] Import AnimatedStatCard
- [ ] Import ThemeSwitcher
- [ ] Add ThemeSwitcher to navbar
- [ ] Use AnimatedStatCard for welcome stats
- [ ] Test theme persistence

---

## 🔄 Data Flow Example

```
User Action → Component State → Notification
     ↓
Dashboard receives filter from InteractiveDateFilter
     ↓
Dashboard filters mentions
     ↓
Updates filteredMentions state
     ↓
AdvancedSearch displays filtered count
     ↓
MentionCard displays filtered mentions
     ↓
User gets feedback via Notification
```

---

## ⚡ Performance Tips

1. **Memoize Heavy Components**
   ```jsx
   const MemoizedSearch = React.memo(AdvancedSearch)
   ```

2. **Use Lazy Loading**
   ```jsx
   const MentionList = lazy(() => import('./MentionList'))
   ```

3. **Batch Updates**
   ```jsx
   // Update multiple states together
   setMentions(newMentions)
   setSentiment(newSentiment)
   ```

4. **Debounce Search**
   ```jsx
   // Add debounce for search input
   const [searchTerm, setSearchTerm] = useState('')
   const debouncedSearch = useMemo(
     () => debounce(setSearchTerm, 300),
     []
   )
   ```

---

## 🐛 Troubleshooting

### Components Not Showing
- Check imports are correct
- Verify file paths
- Check for CSS conflicts
- Clear browser cache

### Animations Not Working
- Check CSS support (use vendor prefixes if needed)
- Verify animation keyframes loaded
- Check z-index for stacking issues

### Notifications Not Appearing
- Verify NotificationContainer is rendered
- Check z-index is high enough (9999)
- Verify hook is properly initialized

### Performance Issues
- Reduce animation duration
- Check for unnecessary re-renders
- Use React DevTools profiler
- Reduce component count

---

## 📞 Support

For issues or questions:
1. Check component props
2. Verify data structure
3. Check browser console for errors
4. Test with sample data

---

## 🎯 Next Features to Add

- [ ] Export charts as PNG/PDF
- [ ] Custom dashboard layouts
- [ ] Real-time WebSocket updates
- [ ] Advanced charting library
- [ ] AI-powered recommendations
- [ ] Email/SMS notifications
- [ ] User preferences system
- [ ] Advanced filtering UI

---

**Last Updated**: November 15, 2025
**Status**: Ready for Production
**Component Version**: 1.0
