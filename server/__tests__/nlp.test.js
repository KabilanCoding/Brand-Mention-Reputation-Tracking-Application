const { extractTopics, normalizeTokens } = require('../../server/nlp');

describe('NLP Module', () => {
  describe('normalizeTokens', () => {
    it('should normalize and filter tokens', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const tokens = normalizeTokens(text);
      expect(tokens).toContain('quick');
      expect(tokens).toContain('brown');
      expect(tokens).toContain('fox');
    });

    it('should return empty array for empty text', () => {
      const tokens = normalizeTokens('');
      expect(tokens).toEqual([]);
    });

    it('should handle null input gracefully', () => {
      const tokens = normalizeTokens(null);
      expect(tokens).toEqual([]);
    });

    it('should remove stopwords', () => {
      const text = 'the and is in to of a for on';
      const tokens = normalizeTokens(text);
      expect(tokens.length).toBe(0);
    });
  });

  describe('extractTopics', () => {
    it('should extract top keywords by frequency', () => {
      const text = 'apple apple apple orange orange banana';
      const topics = extractTopics(text, 2);
      expect(topics).toEqual(['apple', 'orange']);
    });

    it('should return fewer topics if text has fewer unique words', () => {
      const text = 'hello world';
      const topics = extractTopics(text, 5);
      expect(topics.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for empty text', () => {
      const topics = extractTopics('');
      expect(topics).toEqual([]);
    });

    it('should respect topN parameter', () => {
      const text = 'apple orange banana grape pear peach';
      const topics = extractTopics(text, 3);
      expect(topics.length).toBeLessThanOrEqual(3);
    });
  });
});
