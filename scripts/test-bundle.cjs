/**
 * Bundle validation with translation demo
 * Tests the webpack bundle structure and shows translation example
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing webpack bundle with translation demo...');

const bundlePath = path.resolve('./dist/hover-translate-engine.js');

// Test 1: Check if bundle exists
if (!fs.existsSync(bundlePath)) {
  console.error('❌ Bundle not found! Run: npm run build');
  process.exit(1);
}

// Test 2: Check bundle content
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

// Check for required functions
const requiredFunctions = ['loadEngine', 'translate', 'getEngineState', 'TranslationStatus'];
let missing = false;
for (const func of requiredFunctions) {
  if (!bundleContent.includes(func)) {
    console.error(`❌ Bundle does not contain function: ${func}`);
    missing = true;
  }
}
if (missing) process.exit(1);

// Check for model references
if (!bundleContent.includes('Xenova/opus-mt-es-en')) {
  console.error('❌ Bundle does not contain Xenova model reference');
  process.exit(1);
}

console.log('✅ Bundle structure validation passed!');
console.log('✅ Bundle contains all required functions and model references');

// Show translation example (what would happen in browser/extension)
console.log('\n🔄 Translation Demo (bundle ready for browser/extension):');
console.log('📝 Target word: "banco"');
console.log('📄 Context sentence: "El banco está cerrado."');
console.log('✅ Expected translation: "banco" → "bank"');
console.log('📄 Expected full sentence: "The bank is closed."');
console.log('\n💡 To test actual translation, use in Chrome extension environment');
console.log('✅ Bundle is ready for Chrome extension integration!'); 