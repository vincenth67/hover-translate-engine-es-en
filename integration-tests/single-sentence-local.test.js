// Single sentence translation test using local files with performance stats
// This test demonstrates the engine's ability to translate one sentence
// and provides timing information for model loading and translation

import { loadEngineLocal, translate, getEngineState, _resetEngine } from '../src/engine.js';

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

/**
 * Formats duration in a human-readable way
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

console.log('🧪 Single Sentence Translation Test (Local Files)');
console.log('=' .repeat(60));

async function runTest() {
  try {
    // Test data
    const targetWord = 'banco';
    const sentence = 'El banco está cerrado hoy.';
    const expectedWord = 'bank';
    
    console.log(`📝 Target word: "${targetWord}"`);
    console.log(`📝 Full sentence: "${sentence}"`);
    console.log(`🎯 Expected translation: "${expectedWord}"`);
    console.log('');
    
    // Measure initial memory
    const initialMemory = getMemoryUsage();
    console.log(`💾 Initial memory usage: ${initialMemory.toFixed(2)}MB`);
    
    // Step 1: Reset and load model
    console.log('\n🔄 Step 1: Loading translation model...');
    _resetEngine();
    
    const loadStartTime = performance.now();
    const loadStartMemory = getMemoryUsage();
    
    const loadResult = await loadEngineLocal();
    const loadEndTime = performance.now();
    const loadEndMemory = getMemoryUsage();
    
    const loadDuration = loadEndTime - loadStartTime;
    const loadMemoryIncrease = loadEndMemory - loadStartMemory;
    
    console.log(`✅ Model load result: ${loadResult}`);
    console.log(`⏱️  Model load time: ${formatDuration(loadDuration)}`);
    console.log(`💾 Memory increase during load: ${loadMemoryIncrease.toFixed(2)}MB`);
    console.log(`💾 Memory after load: ${loadEndMemory.toFixed(2)}MB`);
    
    if (loadResult !== 'translate engine ready') {
      throw new Error(`Model load failed: ${loadResult}`);
    }
    
    // Step 2: Translate and measure time
    console.log('\n🔄 Step 2: Translating sentence...');
    const translateStartTime = performance.now();
    const translateStartMemory = getMemoryUsage();
    
    const translationResult = await translate(targetWord, sentence);
    const translateEndTime = performance.now();
    const translateEndMemory = getMemoryUsage();
    
    const translateDuration = translateEndTime - translateStartTime;
    const translateMemoryIncrease = translateEndMemory - translateStartMemory;
    
    console.log(`✅ Translation status: ${translationResult.status}`);
    console.log(`📝 Translated word: "${translationResult.targetWord}"`);
    console.log(`📝 Translated sentence: "${translationResult.fullSentence}"`);
    console.log(`⏱️  Translation time: ${formatDuration(translateDuration)}`);
    console.log(`💾 Memory increase during translation: ${translateMemoryIncrease.toFixed(2)}MB`);
    console.log(`💾 Memory after translation: ${translateEndMemory.toFixed(2)}MB`);
    
    // Step 3: Performance analysis
    console.log('\n📊 Performance Analysis:');
    console.log('-'.repeat(40));
    
    const totalMemoryIncrease = translateEndMemory - initialMemory;
    const totalTime = loadDuration + translateDuration;
    
    console.log(`⏱️  Total time (load + translate): ${formatDuration(totalTime)}`);
    console.log(`💾 Total memory increase: ${totalMemoryIncrease.toFixed(2)}MB`);
    console.log(`🚀 Translation speed: ${(sentence.length / (translateDuration / 1000)).toFixed(2)} chars/sec`);
    
    // Performance expectations
    console.log('\n🎯 Performance Expectations:');
    console.log('-'.repeat(40));
    
    // Model loading should be reasonable
    if (loadDuration < 5000) {
      console.log(`✅ Model load time is fast: ${formatDuration(loadDuration)}`);
    } else if (loadDuration < 30000) {
      console.log(`⚠️  Model load time is acceptable: ${formatDuration(loadDuration)}`);
    } else {
      console.log(`❌ Model load time is slow: ${formatDuration(loadDuration)}`);
    }
    
    // Translation should be fast
    if (translateDuration < 1000) {
      console.log(`✅ Translation time is fast: ${formatDuration(translateDuration)}`);
    } else if (translateDuration < 5000) {
      console.log(`⚠️  Translation time is acceptable: ${formatDuration(translateDuration)}`);
    } else {
      console.log(`❌ Translation time is slow: ${formatDuration(translateDuration)}`);
    }
    
    // Memory usage should be reasonable
    if (totalMemoryIncrease < 100) {
      console.log(`✅ Memory usage is reasonable: ${totalMemoryIncrease.toFixed(2)}MB`);
    } else if (totalMemoryIncrease < 500) {
      console.log(`⚠️  Memory usage is acceptable: ${totalMemoryIncrease.toFixed(2)}MB`);
    } else {
      console.log(`❌ Memory usage is high: ${totalMemoryIncrease.toFixed(2)}MB`);
    }
    
    // Validation
    if (translationResult.status !== 'success') {
      throw new Error(`Translation failed with status: ${translationResult.status}`);
    }
    
    if (translationResult.targetWord !== expectedWord) {
      console.log(`⚠️  Warning: Expected "${expectedWord}" but got "${translationResult.targetWord}"`);
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('=' .repeat(60));
  }
}

// Run the test
runTest();
