#!/usr/bin/env node

/**
 * BRAND MONITOR - Live System Verification
 * Run this to verify all services are running and responsive
 */

const http = require('http');

console.log('\n' + '='.repeat(70));
console.log('   ✅ BRAND MONITOR - SYSTEM VERIFICATION');
console.log('='.repeat(70) + '\n');

// Test Backend API
console.log('📊 Backend API Test:');
const backendReq = http.get('http://localhost:3000/api/mentions', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const mentions = JSON.parse(data);
      console.log(`   ✓ http://localhost:3000/api/mentions`);
      console.log(`   ✓ Records: ${mentions.length} mentions in database`);
      if (mentions.length > 0) {
        const m = mentions[0];
        console.log(`   ✓ Sample: [${m.source}] ${m.sentiment_label} • ${m.title.substring(0, 50)}...`);
      }
    } catch (err) {
      console.log('   ✗ API error:', err.message);
    }
    console.log('\n');
  });
});

backendReq.on('error', (err) => {
  console.log('   ✗ Backend not responding:', err.message);
  console.log('\n');
});

// Test Frontend (after 1 second)
setTimeout(() => {
  console.log('🎨 Frontend Vite Test:');
  [5173, 5174].forEach((port) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      console.log(`   ✓ http://localhost:${port}`);
      console.log(`   ✓ Vite dev server ready`);
      console.log('\n');
    });
    req.on('error', () => {
      // Try next port
    });
    req.setTimeout(500);
  });
}, 1000);

// Summary
setTimeout(() => {
  console.log('='.repeat(70));
  console.log('   📖 NEXT STEPS:');
  console.log('   1. Open browser: http://localhost:5173');
  console.log('   2. Login with any email (e.g., test@example.com)');
  console.log('   3. Password: anything');
  console.log('   4. Navigate: Home → Dashboard');
  console.log('   5. View live mentions and charts');
  console.log('='.repeat(70) + '\n');
}, 2000);
