const EventEmitter = require('events');
const fetch = require('node-fetch');
const Parser = require('rss-parser');

const parser = new Parser();

class RedditConnector extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.subreddits = new Set();
    this.pollingInterval = opts.pollingInterval || 30000;
    this._timer = null;
  }

  addSubreddit(name) {
    this.subreddits.add(name);
  }

  start() {
    if (this._timer) return;
    this._tick();
    this._timer = setInterval(() => this._tick(), this.pollingInterval);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  async _tick() {
    for (const sub of this.subreddits) {
      const url = `https://www.reddit.com/r/${sub}/new/.rss`;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'brand-monitor/0.1' } });
        if (!res.ok) {
          console.error('reddit fetch failed', res.status, url);
          continue;
        }
        const text = await res.text();
        // parse RSS feed using rss-parser and emit individual items
        try {
          const feed = await parser.parseString(text);
          for (const item of feed.items || []) {
            this.emit('item', item);
          }
        } catch (parseErr) {
          // fallback: emit raw content as one item
          this.emit('item', { link: url.replace('/new/.rss',''), title: `Reddit /r/${sub} feed`, content: text });
        }
      } catch (err) {
        console.error('reddit error', err.message);
      }
    }
  }
}

module.exports = RedditConnector;
