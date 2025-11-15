const RSSConnector = require('../../server/connectors/rssConnector');

describe('RSSConnector', () => {
  it('should initialize with default options', () => {
    const connector = new RSSConnector();
    expect(connector.pollingInterval).toBe(30000);
    expect(connector.feeds.size).toBe(0);
  });

  it('should initialize with custom polling interval', () => {
    const connector = new RSSConnector({ pollingInterval: 60000 });
    expect(connector.pollingInterval).toBe(60000);
  });

  it('should add feeds', () => {
    const connector = new RSSConnector();
    connector.addFeed('https://example.com/feed.rss');
    connector.addFeed('https://example.com/feed2.rss');
    expect(connector.feeds.size).toBe(2);
  });

  it('should start and stop polling', () => {
    const connector = new RSSConnector();
    connector.start();
    expect(connector._timer).toBeDefined();
    connector.stop();
    expect(connector._timer).toBeNull();
  });

  it('should emit item events', (done) => {
    const connector = new RSSConnector();

    connector.on('item', (item) => {
      expect(item).toBeDefined();
      done();
    });

    // manually emit to test listener
    connector.emit('item', { title: 'Test', link: 'http://test.com' });
  });
});
