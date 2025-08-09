# hover-translate-engine-es-en

A standalone Spanish-to-English translation engine using the Helsinki model with an innovative semicolon technique for context-aware translation. Designed for Chrome extensions and web applications requiring fast, accurate translations.

**Version 0.2.4**: Now includes webpack bundling for Chrome extension integration with zero external dependencies and WASM files included in package.

## Features

- **Context-Aware Translation**: Resolves ambiguous words using sentence context (e.g., "banco" = bank vs bench)
- **Fast Performance**: Sub-500ms translation times for optimal hover experience
- **Memory Efficient**: Stable memory usage with Helsinki model (<100MB working memory)
- **Storm-Safe Loading**: Graceful failure handling with safe loading mechanisms
- **Standalone Package**: Independent NPM package installable from GitHub
- **Webpack Bundling**: Self-contained bundle for Chrome extensions (v0.2.0+)

## Installation

### From GitHub (Development)
```bash
npm install git+https://github.com/yourusername/hover-translate-engine-es-en.git
```

### From NPM (When Published)
```bash
npm install hover-translate-engine-es-en
```

## Quick Start

### Source Version (Development)
```javascript
import { translate, loadEngine, getEngineState, TranslationStatus } from 'hover-translate-engine-es-en';

// Initialize engine (typically on page load)
await loadEngine();

// Translate with context
const result = await translate("banco", "El banco central subió las tasas.");
if (result.status === TranslationStatus.SUCCESS) {
  console.log(result.targetWord); // "bank"
  console.log(result.fullSentence); // "The central bank raised interest rates."
}
```

### Bundled Version (Chrome Extensions)
```javascript
// Load the bundled version (no imports needed)
// Functions available globally: loadEngine, translate, getEngineState, TranslationStatus

// Use local WASM files (required for Chrome extensions)
const wasmPaths = {
  'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm'),
  'ort-wasm-simd-threaded.jsep.mjs': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs')
};
await loadEngine(wasmPaths);

// Translate with context
const result = await translate("banco", "El banco central subió las tasas.");
if (result.status === TranslationStatus.SUCCESS) {
  console.log(result.targetWord); // "bank"
}
```

## Chrome Extension Integration

### Package Installation
```bash
npm install hover-translate-engine-es-en
```

### Manifest.json Setup
```json
{
  "manifest_version": 3,
  "name": "Hover Translate - Spanish",
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": [
      "node_modules/hover-translate-engine-es-en/dist/hover-translate-engine.js",
      "src/main.js"
    ]
  }],
  "web_accessible_resources": [{
    "resources": [
      "node_modules/hover-translate-engine-es-en/dist/wasm/*"
    ],
    "matches": ["<all_urls>"]
  }]
}
```

### Usage in Content Script
```javascript
// src/main.js - No imports needed, bundle loads globally

async function initializeTranslation() {
  // Use local WASM files (required for Chrome extensions)
  const wasmPaths = {
    'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm'),
    'ort-wasm-simd-threaded.jsep.mjs': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs')
  };
  await loadEngine(wasmPaths);
  
  console.log('Engine ready:', getEngineState());
}

async function handleHover(targetWord, sentence) {
  const result = await translate(targetWord, sentence);
  
  if (result.status === TranslationStatus.SUCCESS) {
    showTooltip(result.targetWord);
  }
}

// Initialize when content script loads
initializeTranslation();
```

## Advanced Chrome Extension Architecture (Recommended)

For production Chrome extensions, it's recommended to use a background script with an offscreen document to handle the translation engine. This approach provides better performance and follows Chrome extension best practices.

### Architecture Overview

```
Content Script → Background Script → Offscreen Document → Translation Engine
```

### Manifest.json Setup
```json
{
  "manifest_version": 3,
  "name": "Hover Translate - Spanish",
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "web_accessible_resources": [{
    "resources": [
      "node_modules/hover-translate-engine-es-en/dist/wasm/*"
    ],
    "matches": ["<all_urls>"]
  }],
  "permissions": ["offscreen"]
}
```

### Background Script (background.js)
```javascript
// Background script - handles communication and manages offscreen document

let offscreenCreated = false;

// Create offscreen document for translation engine
async function createOffscreen() {
  if (offscreenCreated) return;
  
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['WORKERS'],
    justification: 'Load translation engine for Spanish-English translation'
  });
  offscreenCreated = true;
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSLATE') {
    handleTranslation(message.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleTranslation({ targetWord, sentence }) {
  // Ensure offscreen document exists
  await createOffscreen();
  
  // Send translation request to offscreen document
  const response = await chrome.runtime.sendMessage({
    type: 'TRANSLATE_REQUEST',
    targetWord,
    sentence
  });
  
  return response;
}
```

### Offscreen Document (offscreen.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Translation Engine Offscreen</title>
</head>
<body>
  <script src="node_modules/hover-translate-engine-es-en/dist/hover-translate-engine.js"></script>
  <script src="offscreen.js"></script>
</body>
</html>
```

### Offscreen Script (offscreen.js)
```javascript
// Offscreen document - loads and manages the translation engine

let engineReady = false;

// Initialize the translation engine
async function initializeEngine() {
  if (engineReady) return;
  
  try {
    // Use local WASM files
    const wasmPaths = {
      'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm'),
      'ort-wasm-simd-threaded.jsep.mjs': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs')
    };
    
    await loadEngine(wasmPaths);
    engineReady = true;
    console.log('Translation engine ready in offscreen document');
  } catch (error) {
    console.error('Failed to initialize translation engine:', error);
    throw error;
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSLATE_REQUEST') {
    handleTranslateRequest(message)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open
  }
});

async function handleTranslateRequest({ targetWord, sentence }) {
  // Ensure engine is ready
  if (!engineReady) {
    await initializeEngine();
  }
  
  // Perform translation
  const result = await translate(targetWord, sentence);
  return result;
}

// Initialize engine when offscreen document loads
initializeEngine().catch(console.error);
```

### Content Script (content.js)
```javascript
// Content script - handles page interaction and requests translation

async function handleHover(targetWord, sentence) {
  try {
    // Send translation request to background script
    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE',
      data: { targetWord, sentence }
    });
    
    if (response.error) {
      console.error('Translation error:', response.error);
      return;
    }
    
    if (response.status === TranslationStatus.SUCCESS) {
      showTooltip(response.targetWord);
    }
  } catch (error) {
    console.error('Failed to translate:', error);
  }
}

function showTooltip(translation) {
  // Your tooltip implementation
  console.log('Translation:', translation);
}

// Example: Add hover listeners to Spanish text
document.addEventListener('mouseover', (event) => {
  const element = event.target;
  const text = element.textContent;
  
  // Simple Spanish word detection (improve as needed)
  if (isSpanishText(text)) {
    const words = text.split(/\s+/);
    const targetWord = words[0]; // Simplified - get word under cursor
    handleHover(targetWord, text);
  }
});

function isSpanishText(text) {
  // Simple Spanish detection logic
  const spanishWords = ['el', 'la', 'es', 'en', 'de', 'y', 'que', 'un', 'una'];
  return spanishWords.some(word => text.toLowerCase().includes(word));
}
```

### Benefits of This Architecture

- ✅ **Better Performance**: Heavy ML processing in offscreen document
- ✅ **Service Worker Compatibility**: Background script stays lightweight
- ✅ **Memory Management**: Offscreen document can be closed when not needed
- ✅ **Error Isolation**: Translation errors don't crash the background script
- ✅ **Chrome Extension Best Practices**: Follows recommended patterns


## Build System

### Development Commands
```bash
# Build the webpack bundle
npm run build

# Build in development mode (larger, unminified)
npm run build:dev

# Test the bundled version
npm run test:bundle

# Run all tests including bundle tests
npm run test:all
```

### Bundle Information
- **Bundle Size**: ~55MB (includes Helsinki model + Transformers.js + engine code)
- **Format**: UMD (Universal Module Definition) - works in browsers, CommonJS, and ES modules
- **Dependencies**: Zero external dependencies at runtime
- **Offline Capable**: Works completely offline after installation

## API Reference

### `loadEngine(wasmPaths?)`

Initializes the Helsinki translation model with optional WASM file paths.

**Parameters**:
- `wasmPaths` (optional): Object mapping WASM filenames to local paths for offline usage

**Returns**: `Promise<string>` - Engine state after loading attempt

**Examples**:
```javascript
// Web applications: Use default CDN loading
const state = await loadEngine();
console.log(state); // "translate engine ready"

// Chrome extensions: Use local WASM files (CDN blocked by CSP)
const wasmPaths = {
  'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm'),
  'ort-wasm-simd-threaded.jsep.mjs': chrome.runtime.getURL('node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs')
};
const state = await loadEngine(wasmPaths);
console.log(state); // "translate engine ready"
```

### `translate(targetWord, sentence)`

Translates Spanish text to English using context-aware semicolon technique.

**Parameters**:
- `targetWord` (string): Spanish word/phrase to translate (1-6 words max)
- `sentence` (string): Full sentence containing the target word

**Returns**: `Promise<TranslationResult>`

**TranslationResult Structure**:
```javascript
{
  targetWord: string,    // English translation of the target word
  fullSentence: string,  // English translation of the complete sentence
  status: string        // Result status: 'success', 'engine_not_ready', 'translation_failed'
}
```

**Example**:
```javascript
const result = await translate("banco", "Me senté en el banco del parque.");
if (result.status === TranslationStatus.SUCCESS) {
  console.log(result.targetWord); // "bench"
  console.log(result.fullSentence); // "I sat on the park bench."
}
```

### `getEngineState()`

Gets the current engine state for debugging and status checking.

**Returns**: `string` - Current engine state

**Example**:
```javascript
const state = getEngineState();
console.log(state); // "translate engine ready"
```

### `TranslationStatus`

Constants for translation result statuses.

**Values**:
- `TranslationStatus.SUCCESS`: Translation completed successfully
- `TranslationStatus.ENGINE_NOT_READY`: Engine not initialized or failed to load
- `TranslationStatus.TRANSLATION_FAILED`: Translation failed due to input or processing error

## Technical Details

### Semicolon Technique

The engine uses an innovative approach to achieve context-aware translation:

```
Input: "banco", "El banco central subió las tasas."
Modified: "El banco central subió las tasas; banco."
Result: "The central bank raised interest rates; bank."
Extracted: "bank"
```

This technique allows the Helsinki model to understand context and resolve ambiguous words correctly.

### Performance Characteristics

- **Translation Speed**: <500ms target, <2000ms acceptable
- **Model Loading**: <10 seconds one-time initialization
- **Memory Usage**: Stable at <100MB working memory
- **Accuracy**: 80%+ on test dataset (40 sentences across categories)

### Browser Compatibility

- Chrome 90+ (primary target for extension)
- Modern browsers with WebAssembly support
- JavaScript ES6+ module support required
- WebGL acceleration for optimal performance

## Testing

### Unit Tests
```bash
npm test
```

### Performance Tests
```bash
npm run test:perf
```

### Bundle Tests
```bash
npm run test:bundle
```

### All Tests
```bash
npm run test:all
```

## Error Handling

The engine provides graceful error handling:

```javascript
const result = await translate("invalid", "sentence");
if (result.status === TranslationStatus.ENGINE_NOT_READY) {
  // Engine failed to load - check network connectivity
} else if (result.status === TranslationStatus.TRANSLATION_FAILED) {
  // Translation failed - check input validity
} else {
  // Success - use result.targetWord and result.fullSentence
}
```

## Examples

### Basic Translation
```javascript
import { translate, loadEngine, TranslationStatus } from 'hover-translate-engine-es-en';

await loadEngine();

const result = await translate("casa", "La casa es muy grande.");
if (result.status === TranslationStatus.SUCCESS) {
  console.log(result.targetWord); // "house"
}
```

### Context-Aware Translation
```javascript
// Ambiguous word "banco" - context determines meaning
const result1 = await translate("banco", "Voy al banco a depositar dinero.");
console.log(result1.targetWord); // "bank"

const result2 = await translate("banco", "Me senté en el banco del parque.");
console.log(result2.targetWord); // "bench"
```

### Error Handling
```javascript
const result = await translate("", "Invalid input");
if (result.status === TranslationStatus.TRANSLATION_FAILED) {
  console.log("Translation failed - check input");
}
```

## Testing

### Running Tests

#### Unit Tests (Jest)
```bash
npm test                    # Run all unit tests
npm run test:cdn            # Run CDN-based unit tests
npm run test:local          # Run local file unit tests
npm run test:coverage       # Run tests with coverage report
npm run test:watch          # Run tests in watch mode
```

#### Performance Tests
```bash
# Main translation performance test (recommended)
npm run test:perf

# String manipulation performance tests
npm test -- tests/performance/performance.test.js
```

#### Bundle Tests
```bash
# Test the webpack bundle functionality
npm run test:bundle
```

#### Integration Tests
```bash
# Single sentence translation test with local files and performance stats
npm run test:translate-local

# Single sentence translation test with CDN/online loading
npm run test:translate-cdn

# Comprehensive performance test with all test sentences
npm run test:perf
```

### Test Coverage
- **Current Coverage**: 87.75% (Statements: 87.75%, Branches: 55.55%, Functions: 71.42%, Lines: 87.75%)
- **Coverage Threshold**: 45% (configured in package.json)
- **Coverage Reports**: Available in `tests/coverage/` directory

## Development
```
hover-translate-engine-es-en/
├── package.json                    # NPM package configuration
├── webpack.config.js              # Webpack build configuration
├── README.md                       # Usage documentation
├── src/
│   └── engine.js                   # Main engine implementation
├── dist/                           # Webpack output (bundled version)
│   └── hover-translate-engine.js   # Self-contained bundle (~55MB)
├── tests/
│   ├── engine-cdn.test.js          # CDN-based unit tests (Jest)
│   ├── engine-local.test.js        # Local file unit tests (Jest)
│   ├── performance/
│   │   └── performance.test.js     # String manipulation performance tests
│   ├── fixtures/
│   │   └── test-sentences.jsonl    # Test dataset (40 sentences)
│   └── coverage/                   # Test coverage reports
├── scripts/
│   ├── test-bundle.cjs             # Bundle functionality test
│   ├── clean-dist.js               # Clean dist directory
│   └── check-bundle.js             # Bundle validation
└── integration-tests/
    ├── performance.test.js              # Translation performance test (local files)
    ├── translate-local.test.js          # Single sentence test (local files)
    ├── translate-cdn.test.js            # Single sentence test (CDN/online)
    ├── webpack-bundle.cjs               # Bundle functionality test
    └── fixtures/
        └── test-sentences.jsonl    # Test dataset (40 sentences)
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Dependencies

- **@huggingface/transformers**: ^3.7.0 - Transformers.js for model loading and execution
- **Model**: Xenova/opus-mt-es-en - Spanish to English translation model (JavaScript optimized)
- **Webpack Dependencies** (dev): webpack, webpack-cli, babel-loader, @babel/core, @babel/preset-env

## Current Status

✅ **Ready for Production**: The package uses the correct Xenova/opus-mt-es-en model for JavaScript environments.

- ✅ Real Helsinki model integration
- ✅ All tests passing with 87.75% coverage
- ✅ Context-aware translation with semicolon technique
- ✅ Proper error handling and edge case support
- ✅ Performance testing with 80% accuracy on 40 test sentences
- ✅ Webpack bundling for Chrome extension integration (v0.2.0)
- ✅ Zero external dependencies at runtime

## Performance Notes

- **Translation Speed**: ~234ms average per translation (4.27 translations/second)
- **Memory Usage**: +47MB after model loading (stable)
- **Bundle Size**: ~55MB (includes complete Helsinki model)
- **Accuracy**: 80% overall on complex test cases
  - Generic/Technical: 100% accuracy
  - Idioms: 100% accuracy  
  - Ambiguous words: 66.7% accuracy
  - Colloquial slang: 40% accuracy
- First translation may be slower due to model initialization
- Subsequent translations are faster due to model caching
- Performance may vary based on hardware and browser capabilities

## Support

For issues and questions:
1. Check the error handling examples above
2. Review the test cases in `tests/` directory
3. Open an issue on GitHub with detailed error information 
