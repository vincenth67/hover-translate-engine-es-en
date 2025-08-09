/**
 * @fileoverview Single sentence translation test using LOCAL files
 * 
 * This test demonstrates basic translation functionality using local model files.
 * It shows performance metrics and memory usage for a single translation.
 * 
 * Test Structure:
 * ├── Single sentence translation with local files
 * │   ├── Model loading from local assets
 * │   ├── Translation execution
 * │   └── Performance analysis
 */

import { loadEngineLocal, translate, TranslationStatus } from '../src/engine.js';

/**
 * Format duration in a human-readable way
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Get current memory usage in MB
 * @returns {number} Memory usage in MB
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  }
  return 0;
}

async function runSingleSentenceTest() {
  console.log('🧪 Single Sentence Translation Test (LOCAL FILES)');
  console.log('============================================================');
  console.log('🌐 MODE: Using LOCAL model files (offline)');
  console.log('📁 Model source: ./dist/models/Xenova/opus-mt-es-en/');
  console.log('');
  
  // Test configuration
  const targetWord = 'banco';
  const fullSentence = 'El banco está cerrado hoy.';
  const expectedTranslation = 'bank';
  
  console.log(`📝 Target word: "${targetWord}"`);
  console.log(`📝 Full sentence: "${fullSentence}"`);
  console.log(`🎯 Expected translation: "${expectedTranslation}"`);
  console.log('');
  
  const initialMemory = getMemoryUsage();
  console.log(`💾 Initial memory usage: ${initialMemory}MB`);
  console.log('');
  
  // Step 1: Load the translation model
  console.log('🔄 Step 1: Loading translation model (LOCAL FILES)...');
  const loadStartTime = performance.now();
  
  try {
    const loadResult = await loadEngineLocal();
    const loadEndTime = performance.now();
    const loadTime = loadEndTime - loadStartTime;
    const memoryAfterLoad = getMemoryUsage();
    const memoryIncrease = memoryAfterLoad - initialMemory;
    
    console.log(`✅ Model load result: ${loadResult}`);
    console.log(`⏱️  Model load time: ${formatDuration(loadTime)}`);
    console.log(`💾 Memory increase during load: ${memoryIncrease}MB`);
    console.log(`💾 Memory after load: ${memoryAfterLoad}MB`);
    console.log('');
    
    // Step 2: Translate the sentence
    console.log('🔄 Step 2: Translating sentence...');
    const translateStartTime = performance.now();
    
    const result = await translate(targetWord, fullSentence);
    const translateEndTime = performance.now();
    const translateTime = translateEndTime - translateStartTime;
    const memoryAfterTranslate = getMemoryUsage();
    const memoryIncreaseDuringTranslate = memoryAfterTranslate - memoryAfterLoad;
    
    console.log(`✅ Translation status: ${result.status}`);
    console.log(`📝 Translated word: "${result.targetWord}"`);
    console.log(`📝 Translated sentence: "${result.fullSentence}"`);
    console.log(`⏱️  Translation time: ${formatDuration(translateTime)}`);
    console.log(`💾 Memory increase during translation: ${memoryIncreaseDuringTranslate}MB`);
    console.log(`💾 Memory after translation: ${memoryAfterTranslate}MB`);
    console.log('');
    
    // Performance analysis
    const totalTime = loadTime + translateTime;
    const totalMemoryIncrease = memoryAfterTranslate - initialMemory;
    const translationSpeed = fullSentence.length / (translateTime / 1000);
    
    console.log('📊 Performance Analysis:');
    console.log('----------------------------------------');
    console.log(`⏱️  Total time (load + translate): ${formatDuration(totalTime)}`);
    console.log(`💾 Total memory increase: ${totalMemoryIncrease}MB`);
    console.log(`🚀 Translation speed: ${translationSpeed.toFixed(2)} chars/sec`);
    console.log('');
    
    // Performance expectations
    console.log('🎯 Performance Expectations:');
    console.log('----------------------------------------');
    console.log(`✅ Model load time is fast: ${formatDuration(loadTime)}`);
    console.log(`✅ Translation time is fast: ${formatDuration(translateTime)}`);
    console.log(`✅ Memory usage is reasonable: ${totalMemoryIncrease}MB`);
    console.log('');
    
    // Translation accuracy check
    if (result.status === TranslationStatus.SUCCESS) {
      if (result.targetWord.toLowerCase() === expectedTranslation.toLowerCase()) {
        console.log('🎯 Translation accuracy: ✅ CORRECT');
      } else {
        console.log(`🎯 Translation accuracy: ❌ INCORRECT (got "${result.targetWord}", expected "${expectedTranslation}")`);
      }
    } else {
      console.log(`🎯 Translation accuracy: ❌ FAILED (status: ${result.status})`);
    }
    
    console.log('');
    console.log('✅ Test completed successfully!');
    console.log('============================================================');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('============================================================');
    process.exit(1);
  }
}

// Run the test
runSingleSentenceTest();
