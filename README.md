# hover-translate-engine-es-en

A standalone Spanish-to-English translation engine using the Helsinki model with an innovative semicolon technique for context-aware translation. Designed for Chrome extensions and web applications requiring fast, accurate translations.

## Features

- **Context-Aware Translation**: Resolves ambiguous words using sentence context (e.g., "banco" = bank vs bench)
- **Fast Performance**: Sub-500ms translation times for optimal hover experience
- **Memory Efficient**: Stable memory usage with Helsinki model (<100MB working memory)
- **Storm-Safe Loading**: Graceful failure handling with safe loading mechanisms
- **Standalone Package**: Independent NPM package installable from GitHub

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

## API Reference

### `loadEngine()`

Initializes the Helsinki translation model.

**Returns**: `Promise<string>` - Engine state after loading attempt

**Example**:
```javascript
const state = await loadEngine();
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
npm run test:coverage       # Run tests with coverage report
npm test -- tests/engine.test.js  # Run specific test file
npm run test:watch          # Run tests in watch mode
```

#### Performance Tests
```bash
# Main translation performance test (recommended)
node scripts/test_translation_performance.js

# String manipulation performance tests
npm test -- tests/performance/performance.test.js
```

### Test Coverage
- **Current Coverage**: 87.75% (Statements: 87.75%, Branches: 55.55%, Functions: 71.42%, Lines: 87.75%)
- **Coverage Threshold**: 45% (configured in package.json)
- **Coverage Reports**: Available in `tests/coverage/` directory

## Development
```
hover-translate-engine-es-en/
├── package.json                    # NPM package configuration
├── README.md                       # Usage documentation
├── src/
│   └── engine.js                   # Main engine implementation
├── tests/
│   ├── engine.test.js              # Unit tests (Jest)
│   ├── performance/
│   │   └── performance.test.js     # String manipulation performance tests
│   └── fixtures/
│       └── test-sentences.jsonl    # Test dataset (40 sentences)
├── scripts/
│   └── test_translation_performance.js  # Main performance test (vanilla JS)
└── tests/
    ├── engine.test.js              # Unit tests (Jest)
    ├── performance/
    │   └── performance.test.js     # String manipulation performance tests
    ├── fixtures/
    │   └── test-sentences.jsonl    # Test dataset (40 sentences)
    └── coverage/                   # Test coverage reports
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

## Current Status

✅ **Ready for Production**: The package uses the correct Xenova/opus-mt-es-en model for JavaScript environments.

- ✅ Real Helsinki model integration
- ✅ All tests passing with 87.75% coverage
- ✅ Context-aware translation with semicolon technique
- ✅ Proper error handling and edge case support
- ✅ Performance testing with 80% accuracy on 40 test sentences

## Performance Notes

- **Translation Speed**: ~234ms average per translation (4.27 translations/second)
- **Memory Usage**: +47MB after model loading (stable)
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