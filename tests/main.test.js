const { add, greet } = require('../src/main');

describe('Template Tests', () => {
  test('addition works correctly', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('greeting works correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  test('dummy test always passes', () => {
    expect(true).toBe(true);
  });
}); 