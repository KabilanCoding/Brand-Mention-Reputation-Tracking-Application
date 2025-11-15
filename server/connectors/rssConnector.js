const EventEmitter = require('events');
const Parser = require('rss-parser');

class RSSConnector extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.parser = new Parser();
    this.feeds = new Set();
    this.pollingInterval = opts.pollingInterval || 30000;
    this._timer = null;
  }

  addFeed(url) {
    this.feeds.add(url);
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
    for (const feedUrl of this.feeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        for (const item of feed.items || []) {
          this.emit('item', item);
        }
      } catch (err) {
        console.error('RSS feed error', feedUrl, err.message);
      }
    }
  }
}

module.exports = RSSConnector;
