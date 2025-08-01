# hover-translate-engine-es-en v0.1.0 Blueprint

## 1. Executive Summary

Create the foundational Spanish-to-English translation engine for HoverTranslate Spanish Chrome extension. This standalone NPM package provides fast, context-aware translation using the Helsinki model with an innovative semicolon technique for handling ambiguous words.

### 1.1 Core Objectives

- **Fast Translation**: Sub-500ms translation times for optimal hover experience
- **Context Awareness**: Resolve ambiguous words using sentence context (e.g., "banco" = bank vs bench)
- **Memory Efficiency**: Stable memory usage with Helsinki model (<100MB working memory)
- **Reliability**: Graceful failure handling with storm-safe loading mechanisms
- **Standalone Package**: Independent NPM package installable from GitHub

### 1.2 Success Criteria

**Primary Goal**: Deliver context-aware Spanish→English translations in under 500ms with 80%+ accuracy.

**Key Metrics**:
- Translation accuracy: 80%+ on test dataset (40 sentences across categories)
- Translation speed: <500ms target, <2000ms acceptable
- Model loading: <10 seconds one-time initialization
- Memory usage: Stable at <100MB working memory
- Zero translation storms: Safe loading retry mechanisms

### 1.3 Technical Innovation

**Semicolon Technique**: Novel approach using modified input sentences to achieve context-aware translation:
```
Input: "banco", "El banco central subió las tasas."
Modified: "El banco central subió las tasas; banco."
Result: "The central bank raised interest rates; bank."
Extracted: "bank"
```

## 2. Out of Scope (Future Versions)

### 2.1 v0.2.0 Features
- **Word Limit Enforcement**: Input sentence length restrictions (12-15 words max)
- **Expanded Testing**: Larger test datasets (100+ sentences)
- **Cache Layer**: Pre-computed translations for common phrases

### 2.2 v0.3+ Features
- **Bidirectional Support**: English→Spanish translation capability
- **Custom LLM**: Fine-tuned Helsinki model improvements
- **Advanced Caching**: Intelligent phrase caching with frequency analysis
- **Performance Optimization**: Model compression and optimization techniques

## 3. Technical Architecture

### 3.1 Package Structure

```
hover-translate-engine-es-en/
├── package.json                    # NPM package configuration
├── README.md                       # Usage documentation
├── .gitignore                      # Git ignore patterns
├── src/
│   └── engine.js                   # Main engine implementation
├── tests/
│   ├── engine.test.js              # Unit tests
│   ├── performance/
│   │   └── performance.test.js     # JSONL accuracy tests
│   └── fixtures/
│       └── test-sentences.jsonl    # Test dataset (provided)
└── node_modules/                   # Dependencies
```

### 3.2 Functional Architecture

**Design Philosophy**: Functional approach with module-scoped state for natural singleton behavior.

```javascript
// Module-scoped state (private)
let _engineState = _EngineState.NOT_INITIALIZED;
let translator = null;

// Public API exports
export async function loadEngine() { ... }
export async function translate(targetWord, sentence) { ... }
export function getEngineState() { ... }
export const TranslationStatus = { ... }
```

### 3.3 State Management

**Private Engine States** (Internal use only):
```javascript
const _EngineState = {
  NOT_INITIALIZED: 'translate engine not initialized',
  INITIALIZING: 'translate engine initializing',
  READY: 'translate engine ready',
  INITIALIZATION_FAILED: 'translate engine initialization failed'
};
```

**Public Translation Status** (External API):
```javascript
export const TranslationStatus = {
  SUCCESS: 'success',
  ENGINE_NOT_READY: 'engine_not_ready',
  TRANSLATION_FAILED: 'translation_failed'
};
```

## 4. Detailed Implementation Specifications

### 4.1 loadEngine() Function

**Purpose**: Initialize the Helsinki translation model with proper state management.

**Function Signature**:
```javascript
/**
 * Loads the Helsinki translation model
 * @returns {Promise<string>} Engine state after loading attempt
 */
async function loadEngine()
```

**Implementation Requirements**:
- Load Xenova/opus-mt-es-en model using Transformers.js
- Handle loading state transitions (NOT_INITIALIZED → INITIALIZING → READY/FAILED)
- Prevent duplicate loading attempts during INITIALIZING state
- Return current engine state string
- Store model in module-scoped `translator` variable
- Complete initialization in <10 seconds

**State Transitions**:
```
NOT_INITIALIZED → loadEngine() → INITIALIZING → READY (success)
                                              → INITIALIZATION_FAILED (error)
```

**Error Handling**:
- Graceful failure to INITIALIZATION_FAILED state
- Debug logging only (no user-facing errors)
- No automatic retry mechanisms

### 4.2 translate() Function

**Purpose**: Context-aware Spanish→English translation using semicolon technique.

**Function Signature**:
```javascript
/**
 * Translates Spanish text to English using context-aware semicolon technique
 * @param {string} targetWord - Spanish word/phrase to translate (1-6 words max)
 * @param {string} sentence - Full sentence containing the target word
 * @returns {Promise<TranslationResult>} Translation result object
 */
async function translate(targetWord, sentence)
```

**Return Object Structure**:
```javascript
/**
 * @typedef {Object} TranslationResult
 * @property {string} targetWord - English translation of the target word
 * @property {string} fullSentence - English translation of the complete sentence
 * @property {string} status - Result status: 'success', 'engine_not_ready', 'translation_failed'
 */
```

**Storm-Safe Loading Logic**:
```javascript
// Only attempt loading if we haven't tried yet (prevents retry storms)
if (_engineState === _EngineState.NOT_INITIALIZED) {
  await loadEngine(); // Single loading attempt
}

// If not ready (still loading, failed, or other state), return empty
if (_engineState !== _EngineState.READY) {
  return {
    targetWord: '',
    fullSentence: '',
    status: TranslationStatus.ENGINE_NOT_READY
  };
}
```

### 4.3 Semicolon Technique Implementation

**Core Algorithm**:
1. **Input Processing**: Clean and validate target word and sentence
2. **Sentence Preparation**: Create semicolon-separated format
3. **Translation**: Send to Helsinki model
4. **Extraction**: Parse result to extract target word translation

**Helper Function: _prepareHackedSentence()**:
```javascript
/**
 * Prepares the semicolon-hacked sentence for translation
 * @param {string} targetWord - Word to translate
 * @param {string} sentence - Original sentence
 * @returns {string} Formatted sentence: "Sentence starts with capital; word."
 * @private
 */
function _prepareHackedSentence(targetWord, sentence) {
  // Clean and validate inputs
  let cleanSentence = sentence.trim();
  let cleanTargetWord = targetWord.trim();
  
  // Ensure sentence starts with capital letter
  if (cleanSentence.length > 0) {
    cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
  }
  
  // Remove existing period if present
  cleanSentence = cleanSentence.replace(/\.$/, '');
  
  // Create hacked sentence: "Sentence; targetWord."
  return `${cleanSentence}; ${cleanTargetWord}.`;
}
```

**Helper Function: _extractTranslatedWord()**:
```javascript
/**
 * Extracts the translated word from the semicolon-separated result
 * Handles edge case: sentences with existing semicolons use LAST semicolon
 * @param {string} fullTranslation - Complete translation from Helsinki model
 * @returns {string} Extracted translated word
 * @private
 */
function _extractTranslatedWord(fullTranslation) {
  // Use LAST semicolon to handle sentences with existing semicolons
  const lastSemicolonIndex = fullTranslation.lastIndexOf(';');
  
  if (lastSemicolonIndex === -1) {
    return ''; // No semicolon found
  }
  
  // Get the part after the last semicolon
  let translatedWord = fullTranslation.substring(lastSemicolonIndex + 1).trim();
  
  // Remove trailing period and punctuation
  translatedWord = translatedWord.replace(/\.$/, '');
  translatedWord = translatedWord.replace(/[.,!?;:"'()]/g, '');
  
  return translatedWord.trim();
}
```

**Helper Function: _extractTranslatedSentence()**:
```javascript
/**
 * Extracts the translated sentence from the semicolon-separated result
 * @param {string} fullTranslation - Complete translation from Helsinki model
 * @returns {string} Extracted translated sentence
 * @private
 */
function _extractTranslatedSentence(fullTranslation) {
  const lastSemicolonIndex = fullTranslation.lastIndexOf(';');
  
  if (lastSemicolonIndex === -1) {
    return fullTranslation.trim(); // No semicolon, return full text
  }
  
  return fullTranslation.substring(0, lastSemicolonIndex).trim();
}
```

### 4.4 getEngineState() Function

**Purpose**: Expose current engine state for debugging and status checking.

**Function Signature**:
```javascript
/**
 * Gets current engine state
 * @returns {string} Current engine state
 */
function getEngineState()
```

**Implementation**:
```javascript
function getEngineState() {
  return _engineState;
}
```

## 5. Package Configuration

### 5.1 Package.json Configuration

```json
{
  "name": "hover-translate-engine-es-en",
  "version": "0.1.0",
  "description": "Spanish to English translation engine using Helsinki model with context-aware semicolon technique",
  "main": "src/engine.js",
  "type": "module",
  "scripts": {
    "test": "jest --ignore-pattern=performance",
    "test:perf": "jest tests/performance",  
    "test:all": "jest"
  },
  "dependencies": {
    "@huggingface/transformers": "^2.6.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": ["src/**/*.js"]
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/hover-translate-engine-es-en.git"
  },
  "keywords": ["translation", "spanish", "english", "helsinki", "hover", "chrome-extension"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 5.2 Installation and Usage

**Installation in main app**:
```bash
npm install hover-translate-engine-es-en
```

**Usage in HoverTranslate Spanish**:
```javascript
import { translate, loadEngine, getEngineState, TranslationStatus } from 'hover-translate-engine-es-en';

// Initialize engine (typically on page load)
await loadEngine();

// Translate with context
const result = await translate("banco", "El banco central subió las tasas.");
if (result.status === TranslationStatus.SUCCESS) {
  showTooltip(result.targetWord); // "bank"
}
```

## 6. Testing Implementation

### 6.1 Unit Testing Strategy

**File**: `tests/engine.test.js`

**Test Categories**:
1. **Core Functions**: loadEngine(), translate(), getEngineState()
2. **Helper Functions**: _prepareHackedSentence(), _extractTranslatedWord(), _extractTranslatedSentence()
3. **State Management**: Engine state transitions and validation
4. **Error Handling**: Graceful failure scenarios

**Sample Unit Tests**:
```javascript
describe('HoverTranslateEngine Unit Tests', () => {
  test('loadEngine() returns correct state', async () => {
    const state = await loadEngine();
    expect(state).toBe('translate engine ready');
  });

  test('translate() returns correct object structure', async () => {
    const result = await translate('banco', 'El banco está cerrado.');
    expect(result).toHaveProperty('targetWord');
    expect(result).toHaveProperty('fullSentence');
    expect(result).toHaveProperty('status');
  });

  test('_prepareHackedSentence() handles edge cases', () => {
    expect(_prepareHackedSentence('banco', 'el banco')).toBe('El banco; banco.');
    expect(_prepareHackedSentence('banco', 'El banco.')).toBe('El banco; banco.');
    expect(_prepareHackedSentence('banco', '')).toBe('; banco.');
  });

  test('_extractTranslatedWord() handles existing semicolons', () => {
    const input = 'The president spoke; however, he failed; however';
    expect(_extractTranslatedWord(input)).toBe('however');
  });

  test('_extractTranslatedSentence() extracts correctly', () => {
    const input = 'The bank is closed; bank';
    expect(_extractTranslatedSentence(input)).toBe('The bank is closed');
  });
});
```

### 6.2 Performance Testing Strategy

**File**: `tests/performance/performance.test.js`

**Test Data**: Uses provided JSONL file at `tests/fixtures/test-sentences.jsonl`

**Test Categories**:
1. **Accuracy Testing**: Validate translation accuracy across 40 test sentences
2. **Performance Benchmarking**: Measure translation speed and memory usage
3. **Category Analysis**: Track performance by difficulty (ambiguous, idioms, colloquial, technical, generic)

**Performance Test Structure**:
```javascript
describe('HoverTranslateEngine Performance Tests', () => {
  test('JSONL test suite - accuracy and timing', async () => {
    const testData = loadJSONL('tests/fixtures/test-sentences.jsonl');
    const results = [];
    
    // Ensure engine is loaded
    await loadEngine();
    
    for (const test of testData) {
      const startTime = Date.now();
      const result = await translate(test.spanish.split('; ')[1].replace('.', ''), 
                                   test.spanish.split('; ')[0]);
      const duration = Date.now() - startTime;
      
      const isCorrect = test.expectedWords.includes(result.targetWord.toLowerCase());
      results.push({ 
        id: test.id, 
        isCorrect, 
        duration, 
        category: test.category,
        difficulty: test.difficulty
      });
    }
    
    // Accuracy assertions
    const accuracy = results.filter(r => r.isCorrect).length / results.length;
    expect(accuracy).toBeGreaterThan(0.80); // 80% minimum accuracy
    
    // Performance assertions  
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    expect(avgTime).toBeLessThan(500); // Target: under 500ms
    
    // Category breakdown
    const categoryResults = groupByCategory(results);
    logCategoryPerformance(categoryResults);
  });

  test('Memory usage stability', async () => {
    const initialMemory = getMemoryUsage();
    
    // Run multiple translations
    for (let i = 0; i < 50; i++) {
      await translate('banco', 'El banco está cerrado.');
    }
    
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory should be stable (not continuously growing)
    expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
  });
});
```

### 6.3 Test Data Requirements

**JSONL Format** (tests/fixtures/test-sentences.jsonl):
```json
{"id": 1, "spanish": "Me senté en el banco del parque; banco.", "expectedWords": ["bench"], "category": "ambiguous", "difficulty": "challenging"}
{"id": 2, "spanish": "El banco central subió las tasas de interés; banco.", "expectedWords": ["bank"], "category": "ambiguous", "difficulty": "challenging"}
```

**Test Coverage Distribution**:
- **Ambiguous words**: 15 sentences (37.5%)
- **Idiomatic expressions**: 5 sentences (12.5%)
- **Colloquialisms**: 5 sentences (12.5%)
- **Technical terms**: 5 sentences (12.5%)
- **Generic sentences**: 10 sentences (25%)

## 7. Performance Requirements

### 7.1 Translation Speed

**Target Performance**:
- **Optimal**: <500ms per translation (smooth hover experience)
- **Acceptable**: <2000ms per translation (still usable)
- **Loading**: <10 seconds model initialization (one-time cost)

**Benchmarking Approach**:
- Measure translation time for each JSONL test case
- Calculate average, min, max translation times
- Track performance regression across code changes

### 7.2 Accuracy Requirements

**Minimum Standards**:
- **Overall Accuracy**: 80%+ on 40-sentence test dataset
- **Ambiguous Words**: 75%+ accuracy (most challenging category)
- **Generic Sentences**: 90%+ accuracy (should be highly reliable)

**Accuracy Measurement**:
- Compare extracted `targetWord` against `expectedWords` array
- Case-insensitive matching
- Accept any word from the expected alternatives

### 7.3 Memory Efficiency

**Memory Targets**:
- **Working Memory**: <100MB stable usage
- **Memory Growth**: <50MB increase over 100 translations
- **Memory Leaks**: No continuous growth pattern

**Memory Monitoring**:
- Track initial vs final memory usage in performance tests
- Monitor memory stability over extended translation sessions
- Note: Based on testing, Helsinki model stabilizes around 45-59MB increase

## 8. Error Handling and Edge Cases

### 8.1 Loading Error Scenarios

**Engine Loading Failures**:
- Network connectivity issues preventing model download
- Browser compatibility problems with Transformers.js
- Memory constraints during model initialization
- Corrupted model files or invalid model paths

**Handling Strategy**:
- Transition to INITIALIZATION_FAILED state
- Return ENGINE_NOT_READY status from translate() calls
- No automatic retry mechanisms (prevents storms)
- Debug logging for troubleshooting

### 8.2 Translation Error Scenarios

**Input Validation**:
- Empty or null target words/sentences
- Extremely long input sentences
- Special characters and Unicode handling
- Malformed punctuation

**Translation Failures**:
- Helsinki model execution errors
- Semicolon extraction failures
- Network timeouts during translation
- Memory pressure during processing

**Handling Strategy**:
- Return TRANSLATION_FAILED status with empty strings
- Graceful degradation (no user-facing error messages)
- Debug logging for troubleshooting
- Maintain engine state (don't reset on translation failures)

### 8.3 Edge Cases

**Semicolon Handling**:
- Sentences already containing semicolons (use last semicolon)
- Multiple consecutive semicolons
- Missing semicolons in translation result
- Semicolons within quoted text

**Text Processing**:
- Sentences without proper capitalization
- Missing periods or multiple periods
- Empty target words or sentences
- Unicode characters and accented letters

## 9. Dependencies and External Libraries

### 9.1 Core Dependencies

**@huggingface/transformers** (Production Dependency):
- Version: ^2.6.0
- Purpose: Helsinki model loading and execution
- Browser compatibility: Designed for client-side execution
- Model format: ONNX for JavaScript execution

**Model Dependency**:
- Model: Xenova/opus-mt-es-en
- Source: Hugging Face Model Hub
- Size: ~40-50MB compressed
- License: Apache 2.0 (compatible with commercial use)

### 9.2 Development Dependencies

**Jest** (Testing Framework):
- Version: ^29.0.0
- Purpose: Unit testing and performance testing
- Configuration: Node.js environment for testing
- Coverage reporting for code quality

### 9.3 Browser Compatibility

**Target Environments**:
- Chrome 90+ (primary target for extension)
- Modern browsers with WebAssembly support
- JavaScript ES6+ module support required
- WebGL acceleration for optimal performance

## 10. Deployment and Distribution

### 10.1 NPM Package Distribution

**Publishing Strategy**:
- Publish to NPM registry with public access
- Semantic versioning (0.1.0, 0.1.1, etc.)
- GitHub repository as source of truth
- Automated releases via GitHub Actions (future)

**Installation Methods**:
```bash
# From NPM (when published)
npm install hover-translate-engine-es-en

# From GitHub (development)
npm install git+https://github.com/username/hover-translate-engine-es-en.git
```

### 10.2 Version Management

**v0.1.0 Release Criteria**:
- All unit tests passing with >80% code coverage
- Performance tests meeting accuracy and speed requirements
- Memory usage stable and within targets
- Documentation complete with usage examples

**Future Version Strategy**:
- Patch versions (0.1.x): Bug fixes and minor improvements
- Minor versions (0.x.0): New features and API additions
- Major versions (x.0.0): Breaking changes and architectural updates

## 11. Documentation Requirements

### 11.1 README.md Content

**Essential Documentation**:
- Installation instructions for NPM package
- Basic usage examples with code snippets
- API reference for all exported functions
- Performance characteristics and limitations
- Contributing guidelines for external developers

### 11.2 Code Documentation

**JSDoc Standards**:
- All public functions must have complete JSDoc comments
- Parameter types, return types, and descriptions required
- Examples for complex functions
- @private tags for internal helper functions

**Example JSDoc Format**:
```javascript
/**
 * Translates Spanish text to English using context-aware semicolon technique
 * @param {string} targetWord - Spanish word/phrase to translate (1-6 words max)
 * @param {string} sentence - Full sentence containing the target word
 * @returns {Promise<TranslationResult>} Translation result object
 * @example
 * const result = await translate("banco", "El banco está cerrado.");
 * if (result.status === TranslationStatus.SUCCESS) {
 *   console.log(result.targetWord); // "bank"
 * }
 */
```

## 12. Risk Assessment and Mitigation

### 12.1 Technical Risks

**Helsinki Model Dependency**:
- Risk: Model becomes unavailable or deprecated
- Mitigation: Model bundling ensures availability, version pinning
- Contingency: Fallback to alternative translation models

**Browser Compatibility**:
- Risk: Transformers.js compatibility issues
- Mitigation: Target Chrome 90+ with known compatibility
- Contingency: Graceful degradation with clear error messages

**Performance Degradation**:
- Risk: Translation speed slower than targets
- Mitigation: Performance testing and benchmarking
- Contingency: Alternative model selection or optimization

### 12.2 Quality Risks

**Translation Accuracy**:
- Risk: Accuracy below 80% threshold
- Mitigation: Comprehensive test dataset and validation
- Contingency: Semicolon technique refinement or model change

**Memory Leaks**:
- Risk: Continuous memory growth in production
- Mitigation: Memory stability testing and monitoring
- Contingency: Periodic model reloading mechanisms

### 12.3 Operational Risks

**Dependency Updates**:
- Risk: Breaking changes in Transformers.js library
- Mitigation: Version pinning and controlled updates
- Contingency: Version rollback and compatibility testing

**Model Loading Failures**:
- Risk: Users unable to load translation model
- Mitigation: Storm-safe loading and graceful degradation
- Contingency: Alternative initialization strategies

## 13. Success Metrics and Validation

### 13.1 Quantitative Metrics

**Performance Benchmarks**:
- Translation accuracy: ≥80% on test dataset
- Average translation time: ≤500ms (target), ≤2000ms (acceptable)
- Model loading time: ≤10 seconds
- Memory usage: <100MB working memory, <50MB growth over 100 translations

**Test Coverage**:
- Unit test coverage: ≥85%
- Performance test coverage: 100% of JSONL test cases
- Error scenario coverage: Major failure modes tested

### 13.2 Qualitative Validation

**Code Quality Standards**:
- All functions documented with JSDoc
- Clean, readable functional architecture
- Proper error handling and edge case coverage
- Consistent naming conventions and code style

**Integration Readiness**:
- Clear API for main application integration
- Proper NPM package structure and metadata
- Installation and usage documentation complete
- Version management strategy established

### 13.3 Acceptance Criteria

**Core Functionality**:
- [ ] Helsinki model loads successfully in <10 seconds
- [ ] translate() function returns expected object structure
- [ ] Semicolon technique resolves ambiguous words correctly
- [ ] Engine state management prevents loading storms
- [ ] All helper functions handle edge cases properly

**Performance Standards**:
- [ ] 80%+ accuracy on 40-sentence test dataset
- [ ] Average translation time <500ms on test hardware
- [ ] Memory usage stable over extended translation sessions
- [ ] No memory leaks or continuous growth patterns

**Package Quality**:
- [ ] All unit tests pass with >85% coverage
- [ ] Performance tests validate accuracy and speed requirements
- [ ] NPM package installs and imports correctly
- [ ] Documentation enables successful integration
- [ ] Error handling provides graceful degradation

## 14. Conclusion

The hover-translate-engine-es-en v0.1.0 provides a solid foundation for context-aware Spanish-to-English translation using an innovative semicolon technique with the Helsinki model. The functional architecture ensures maintainability while the comprehensive testing strategy validates both accuracy and performance requirements.

Key innovations include storm-safe loading mechanisms, rich return objects for better integration, and a novel approach to context-aware translation that significantly improves accuracy for ambiguous words. The package is designed for easy integration into the HoverTranslate Spanish Chrome extension while maintaining independence for potential reuse in other applications.

Success depends on achieving the 80% accuracy threshold while maintaining sub-500ms translation times and stable memory usage. The comprehensive testing strategy using real-world sentence data ensures the engine performs reliably across diverse translation scenarios.

This blueprint provides the detailed specifications needed to implement a production-ready translation engine that balances speed, accuracy, and reliability for optimal hover translation experiences.