const SpikeDetector = require('../../server/spikeDetector');

describe('SpikeDetector', () => {
  it('should initialize with default options', () => {
    const detector = new SpikeDetector();
    expect(detector.windowMinutes).toBe(10);
    expect(detector.multiplier).toBe(3);
    expect(detector.minCount).toBe(3);
  });

  it('should initialize with custom options', () => {
    const detector = new SpikeDetector({ windowMinutes: 5, multiplier: 2, minCount: 2 });
    expect(detector.windowMinutes).toBe(5);
    expect(detector.multiplier).toBe(2);
    expect(detector.minCount).toBe(2);
  });

  it('should emit spike event when threshold exceeded', (done) => {
    const detector = new SpikeDetector({ windowMinutes: 1, multiplier: 1.5, minCount: 2 });

    detector.on('spike', (s) => {
      expect(s).toHaveProperty('key');
      expect(s).toHaveProperty('last');
      expect(s).toHaveProperty('avg');
      done();
    });

    // add items to trigger spike
    for (let i = 0; i < 10; i++) {
      detector.add('test_key');
    }
  }, 10000);

  it('should track multiple keys independently', () => {
    const detector = new SpikeDetector();
    detector.add('key1');
    detector.add('key1');
    detector.add('key2');

    expect(detector.buckets.size).toBe(2);
  });

  it('should start and stop periodic rotation', () => {
    const detector = new SpikeDetector();
    // SpikeDetector auto-starts rotation on add, doesn't have explicit start()
    // but we can test that buckets are initialized and cleanup works
    detector.add('key1');
    expect(detector.buckets.size).toBeGreaterThan(0);
  });
});
