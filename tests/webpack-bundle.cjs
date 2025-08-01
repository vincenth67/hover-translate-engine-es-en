// Webpack bundle smoke test (Node.js, CommonJS)
console.log('🧪 Webpack bundle smoke test');

const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve('./dist/hover-translate-engine.js');

// Test 1: Check if bundle exists
if (!fs.existsSync(bundlePath)) {
  console.error('❌ Bundle not found! Run: npm run build');
  process.exit(1);
}

// Test 2: Check bundle size
const stats = fs.statSync(bundlePath);
const sizeInMB = stats.size / (1024 * 1024);
console.log(`📦 Bundle size: ${sizeInMB.toFixed(2)}MB`);

if (sizeInMB < 0.5 || sizeInMB > 2) {
  console.error('❌ Bundle size is outside expected range (0.5-2MB)');
  process.exit(1);
}

// Test 3: Check bundle content
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

// Check for our function names
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
  console.error('❌ Bundle does not contain Helsinki model reference');
  process.exit(1);
}

// Try to require the bundle and check for the global variable (optional, warn only)
try {
  const vm = require('vm');
  const context = { window: {}, global: {}, self: {}, console };
  vm.createContext(context);
  vm.runInContext(bundleContent, context);
  if (!context.HoverTranslateEngine) {
    console.warn('⚠️  Global variable HoverTranslateEngine not found (expected in browser/extension).');
  } else {
    console.log('✅ Global variable HoverTranslateEngine found.');
  }
} catch (err) {
  console.warn('⚠️  Could not evaluate bundle in Node.js (expected for browser bundle):', err.message);
}

console.log('✅ Bundle structure validation passed!');
console.log('✅ Bundle contains all required functions and model references');
console.log('✅ Bundle size is within expected range');
console.log('ℹ️  Full functional testing requires browser environment (Chrome extension)');
console.log('✅ Bundle is ready for Chrome extension integration!');

process.exit(0);