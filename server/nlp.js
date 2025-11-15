const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Very small stopword list for English. For production, use a comprehensive list.
const STOPWORDS = new Set([
  'the','and','is','in','to','of','a','for','on','with','that','this','it','as','are','was','be','by','an','from','at','or'
]);

function normalizeTokens(text) {
  if (!text) return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens
    .map(t => t.replace(/[^a-z0-9]/g, ''))
    .filter(t => t && t.length > 2 && !STOPWORDS.has(t));
}

// Simple keyword extraction by frequency
function extractTopics(text, topN = 3) {
  const tokens = normalizeTokens(text);
  const freq = Object.create(null);
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const entries = Object.entries(freq).sort((a,b) => b[1] - a[1]);
  return entries.slice(0, topN).map(e => e[0]);
}

module.exports = { extractTopics, normalizeTokens };
