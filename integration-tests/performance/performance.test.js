import { 
  getEngineState, 
  TranslationStatus,
  _prepareHackedSentence,
  _extractTranslatedWord,
  _extractTranslatedSentence,
  _resetEngine
} from '../../src/engine.js';

/**
 * Gets current memory usage (Node.js only)
 * @returns {number} Memory usage in MB
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed / 1024 / 1024;
  }
  return 0; // Browser environment
}

describe('HoverTranslateEngine Performance Tests', () => {
  
  // No need to reset engine for performance tests since they only test string operations
  
  test('String manipulation performance', () => {
    const testCases = [
      { word: 'banco', sentence: 'el banco' },
      { word: 'gato', sentence: 'el gato' },
      { word: 'casa', sentence: 'la casa' },
      { word: 'perro', sentence: 'el perro' },
      { word: 'libro', sentence: 'el libro' }
    ];
    
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      for (const testCase of testCases) {
        _prepareHackedSentence(testCase.word, testCase.sentence);
      }
    }
    
    const duration = Date.now() - startTime;
    const operationsPerSecond = (1000 * testCases.length) / (duration / 1000);
    
    // Performance assertions - should be very fast since it's just string manipulation
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    expect(operationsPerSecond).toBeGreaterThan(1000); // Should handle 1000+ ops/sec
  });

  test('Memory usage stability', () => {
    const initialMemory = getMemoryUsage();
    
    // Run multiple string operations
    for (let i = 0; i < 10000; i++) {
      _prepareHackedSentence('banco', 'el banco');
      _extractTranslatedWord('The bank is closed; bank.');
      _extractTranslatedSentence('The bank is closed; bank.');
    }
    
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory should be stable (not continuously growing)
    expect(memoryIncrease).toBeLessThan(10); // Less than 10MB increase for string operations
    expect(finalMemory).toBeLessThan(100); // Total memory should be reasonable
  });

  test('Extraction function performance', () => {
    const testCases = [
      'The bank is closed; bank.',
      'The cat is sleeping; cat.',
      'The house is big; house.',
      'The dog is running; dog.',
      'The book is interesting; book.'
    ];
    
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      for (const testCase of testCases) {
        _extractTranslatedWord(testCase);
        _extractTranslatedSentence(testCase);
      }
    }
    
    const duration = Date.now() - startTime;
    const operationsPerSecond = (1000 * testCases.length * 2) / (duration / 1000);
    
    // Performance assertions - should be very fast since it's just string operations
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    expect(operationsPerSecond).toBeGreaterThan(1000); // Should handle 1000+ ops/sec
  });

  test('Edge case handling performance', () => {
    const edgeCases = [
      { word: 'banco', sentence: 'El banco; central subió las tasas.' }, // Existing semicolon
      { word: 'banco', sentence: 'El banco... está cerrado.' }, // Multiple periods
      { word: 'banco', sentence: 'EL BANCO ESTÁ CERRADO.' }, // All caps
      { word: 'banco', sentence: '  el banco   está   cerrado  .' }, // Extra whitespace
      { word: 'banco', sentence: 'El banco está cerrado!!!' }, // Multiple exclamation marks
    ];
    
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      for (const testCase of edgeCases) {
        _prepareHackedSentence(testCase.word, testCase.sentence);
      }
    }
    
    const duration = Date.now() - startTime;
    const operationsPerSecond = (1000 * edgeCases.length) / (duration / 1000);
    
    // Edge cases should still perform well
    expect(duration).toBeLessThan(1000); // Should handle edge cases in reasonable time
    expect(operationsPerSecond).toBeGreaterThan(1000); // Should handle 1000+ ops/sec
  });

  test('Function accuracy validation', () => {
    const testCases = [
      {
        word: 'banco',
        sentence: 'el banco',
        expectedHacked: 'El banco; banco.',
        expectedWord: 'banco',
        expectedSentence: 'El banco'
      },
      {
        word: 'gato',
        sentence: 'el gato está durmiendo.',
        expectedHacked: 'El gato está durmiendo; gato.',
        expectedWord: 'gato',
        expectedSentence: 'El gato está durmiendo'
      }
    ];
    
    let correctCount = 0;
    
    for (const testCase of testCases) {
      const hacked = _prepareHackedSentence(testCase.word, testCase.sentence);
      const word = _extractTranslatedWord(hacked);
      const sentence = _extractTranslatedSentence(hacked);
      
      if (hacked === testCase.expectedHacked &&
          word === testCase.expectedWord &&
          sentence === testCase.expectedSentence) {
        correctCount++;
      }
    }
    
    const accuracy = (correctCount / testCases.length) * 100;
    
    // Should have 100% accuracy for these simple cases
    expect(accuracy).toBe(100);
  });

  test('Engine state performance', () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 10000; i++) {
      getEngineState();
    }
    
    const duration = Date.now() - startTime;
    const operationsPerSecond = 10000 / (duration / 1000);
    
    // Should be very fast since it's just returning a string
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(operationsPerSecond).toBeGreaterThan(10000); // Should handle 10k+ ops/sec
  });
}); 