/**
 * Simple bundle test script
 * Tests the webpack bundle functionality
 */

const bundledEngine = require('../dist/hover-translate-engine.js');

console.log('🧪 Testing webpack bundle...');

// Test 1: Check exports
console.log('\n1. Checking exports...');
console.log('loadEngine:', typeof bundledEngine.loadEngine);
console.log('translate:', typeof bundledEngine.translate);
console.log('getEngineState:', typeof bundledEngine.getEngineState);
console.log('TranslationStatus:', typeof bundledEngine.TranslationStatus);

// Test 2: Check TranslationStatus constants
console.log('\n2. Checking TranslationStatus constants...');
console.log('SUCCESS:', bundledEngine.TranslationStatus.SUCCESS);
console.log('ENGINE_NOT_READY:', bundledEngine.TranslationStatus.ENGINE_NOT_READY);
console.log('TRANSLATION_FAILED:', bundledEngine.TranslationStatus.TRANSLATION_FAILED);

// Test 3: Test translation
async function testTranslation() {
  console.log('\n3. Testing translation...');
  
  try {
    // Load engine
    console.log('Loading engine...');
    const loadState = await bundledEngine.loadEngine();
    console.log('Load state:', loadState);
    
    // Test translation
    console.log('Testing translation...');
    const result = await bundledEngine.translate('banco', 'El banco está cerrado.');
    
    console.log('Translation result:', result);
    
    if (result.status === 'success' && result.targetWord) {
      console.log('✅ Bundle test PASSED!');
      return true;
    } else {
      console.log('❌ Bundle test FAILED - unexpected result');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Bundle test FAILED with error:', error);
    return false;
  }
}

// Run the test
testTranslation().then(success => {
  process.exit(success ? 0 : 1);
}); 