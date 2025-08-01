# hover-translate-engine-es-en v0.2.0 Blueprint

## 1. Executive Summary

Upgrade the Spanish-to-English translation engine to support webpack bundling for Chrome extension integration. This version focuses exclusively on build tooling and distribution improvements, enabling the main application to consume a self-contained, bundled version without any external dependencies or downloads.

### 1.1 Core Objectives

- **Webpack Bundling**: Create a single, self-contained JavaScript bundle including Helsinki model and all dependencies
- **Chrome Extension Compatibility**: Enable seamless integration with Chrome extensions via bundled distribution
- **Zero External Dependencies**: Main application requires no Hugging Face downloads or dependency management
- **Automated Build Process**: Prevent stale bundles with automated rebuild workflows
- **Bundle Validation**: Ensure webpack output maintains full functionality

### 1.2 Success Criteria

**Primary Goal**: Deliver a ~55MB bundled JavaScript file that works identically to the source version with zero external dependencies.

**Key Metrics**:
- Bundle size: ~45-55MB (Helsinki model + Transformers.js + engine code)
- Functionality parity: 100% feature compatibility with v0.1.x source version
- Build automation: Automatic rebuilds prevent stale bundle issues
- Integration testing: Bundled version passes all existing tests
- Chrome extension ready: Direct manifest.json inclusion without webpack knowledge

### 1.3 No Feature Changes

**v0.2.0 scope**: Pure build tooling upgrade - no translation functionality changes
- All v0.1.x features remain identical
- Same API, same performance, same accuracy
- Translation behavior completely unchanged

## 2. Version History Context

### 2.1 v0.1.0 Foundation (Complete)
- Helsinki model integration with semicolon technique
- Context-aware translation with rich return objects
- Storm-safe loading and graceful error handling
- Comprehensive unit and performance testing

### 2.2 v0.2.0 Focus (Current Version)
- **Webpack bundling system** (only new feature)
- Build automation and validation
- Chrome extension distribution readiness

### 2.3 Future Versions (Out of Scope)
- v0.3.0: Quality improvements (word limits, cache layer, expanded testing)
- v0.4.0+: Advanced features (bidirectional support, custom models)

## 3. Technical Architecture Changes

### 3.1 Updated Project Structure

```
hover-translate-engine-es-en/
├── package.json                       # Updated with webpack dependencies
├── README.md                          # Updated usage instructions
├── .gitignore                         # Include dist/ but ignore node_modules/
├── webpack.config.js                  # NEW: Webpack build configuration
├── .git/
│   └── hooks/
│       └── pre-commit                 # NEW: Auto-rebuild hook script
├── src/
│   └── engine.js                      # Source code (unchanged from v0.1.x)
├── dist/                              # NEW: Webpack output folder
│   └── hover-translate-engine.js      # Bundled file (~55MB)
├── tests/
│   ├── engine.test.js                 # Unit tests (unchanged)
│   ├── webpack.test.js                # NEW: Bundle integration test
│   ├── performance/
│   │   └── performance.test.js        # Performance tests (unchanged)
│   └── fixtures/
│       └── test-sentences.jsonl       # Test data (unchanged)
└── node_modules/                      # Dependencies (including webpack)
```

### 3.2 Build System Architecture

**Webpack Configuration Requirements**:
- Bundle Helsinki model ONNX files directly into JavaScript
- Include all Transformers.js dependencies
- ES6 module output format for Chrome extension compatibility
- Production optimization with code splitting disabled
- Single output file for easy Chrome extension integration

**Build Process Flow**:
```
Source (src/engine.js) + Dependencies + Helsinki Model
        ↓ [Webpack Build Process]
Single Bundle (dist/hover-translate-engine.js ~55MB)
        ↓ [Chrome Extension Integration]
Direct manifest.json inclusion - No NPM resolution needed
```

## 4. Webpack Configuration Specifications

### 4.1 webpack.config.js Requirements

**Core Configuration**:
```javascript
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/engine.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hover-translate-engine.js',
    library: 'HoverTranslateEngine',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      // Transformers.js browser compatibility fallbacks
      "path": false,
      "fs": false,
      "os": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // Handle ONNX model files
      {
        test: /\.onnx$/,
        type: 'asset/resource'
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: false // Single bundle file required
  }
};
```

**Key Requirements**:
- **UMD format**: Compatible with both ES6 imports and global script inclusion
- **Helsinki model inclusion**: Bundle ONNX files directly into JavaScript
- **Single file output**: No code splitting - everything in one bundle
- **Browser compatibility**: Proper fallbacks for Node.js specific modules
- **Production optimization**: Minified but debuggable

### 4.2 Package.json Updates

**New Dependencies**:
```json
{
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "@babel/core": "^7.22.0",
    "@babel/preset-env": "^7.22.0",
    "babel-loader": "^9.1.0"
  }
}
```

**Updated Scripts**:
```json
{
  "scripts": {
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "test": "jest --ignore-pattern=performance --ignore-pattern=webpack",
    "test:webpack": "jest tests/webpack.test.js",
    "test:all": "jest",
    "prebuild": "rm -rf dist/",
    "postbuild": "ls -lh dist/"
  }
}
```

**Module Configuration**:
```json
{
  "type": "module",
  "main": "dist/hover-translate-engine.js",
  "module": "src/engine.js",
  "exports": {
    ".": {
      "import": "./dist/hover-translate-engine.js",
      "require": "./dist/hover-translate-engine.js"
    }
  }
}
```

## 5. Build Automation System

### 5.1 Git Hook Implementation

**Pre-commit Hook** (`/.git/hooks/pre-commit`):
```bash
#!/bin/sh
echo "🔧 Checking if webpack bundle needs rebuilding..."

# Check if src/ files are newer than dist/ files
if find src/ -newer dist/hover-translate-engine.js -print -quit | grep -q .; then
    echo "📦 Source files changed - rebuilding webpack bundle..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Bundle rebuilt successfully"
        git add dist/hover-translate-engine.js
    else
        echo "❌ Bundle build failed - commit aborted"
        exit 1
    fi
else
    echo "✅ Bundle is up to date"
fi

echo "🚀 Proceeding with commit..."
```

**Hook Installation**:
- Make executable: `chmod +x .git/hooks/pre-commit`
- Automatically rebuilds bundle when source changes
- Adds rebuilt bundle to commit automatically
- Prevents commits with stale bundles

### 5.2 Build Validation Scripts

**Bundle Health Check**:
```javascript
// scripts/check-bundle.js
const fs = require('fs');
const path = require('path');

const bundlePath = 'dist/hover-translate-engine.js';
const srcPath = 'src/engine.js';

// Check if bundle exists
if (!fs.existsSync(bundlePath)) {
    console.error('❌ Bundle not found! Run: npm run build');
    process.exit(1);
}

// Check if bundle is newer than source
const bundleTime = fs.statSync(bundlePath).mtime;
const srcTime = fs.statSync(srcPath).mtime;

if (srcTime > bundleTime) {
    console.error('❌ Bundle is stale! Run: npm run build');
    process.exit(1);
}

// Check bundle size
const bundleSize = fs.statSync(bundlePath).size;
const expectedMin = 40 * 1024 * 1024; // 40MB minimum
const expectedMax = 70 * 1024 * 1024; // 70MB maximum

if (bundleSize < expectedMin || bundleSize > expectedMax) {
    console.warn(`⚠️  Bundle size unusual: ${Math.round(bundleSize / 1024 / 1024)}MB`);
}

console.log(`✅ Bundle healthy: ${Math.round(bundleSize / 1024 / 1024)}MB`);
```

## 6. Integration Testing Requirements

### 6.1 Webpack Bundle Test

**New Test File**: `tests/webpack.test.js`

```javascript
/**
 * Webpack Bundle Integration Tests
 * Validates that the bundled version maintains full functionality
 */

describe('Webpack Bundle Integration', () => {
  let bundledEngine;

  beforeAll(() => {
    // Import the webpack bundle
    bundledEngine = require('../dist/hover-translate-engine.js');
  });

  test('bundle exports all required functions', () => {
    expect(bundledEngine.loadEngine).toBeDefined();
    expect(bundledEngine.translate).toBeDefined();
    expect(bundledEngine.getEngineState).toBeDefined();
    expect(bundledEngine.TranslationStatus).toBeDefined();
  });

  test('bundled engine can load successfully', async () => {
    const loadState = await bundledEngine.loadEngine();
    expect(loadState).toBe('translate engine ready');
  });

  test('bundled translate function works with simple case', async () => {
    // Ensure engine is loaded
    await bundledEngine.loadEngine();
    
    // Test basic translation
    const result = await bundledEngine.translate('banco', 'El banco está cerrado.');
    
    expect(result).toHaveProperty('targetWord');
    expect(result).toHaveProperty('fullSentence');
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('success');
    expect(result.targetWord).toBeTruthy();
    
    console.log('✅ Webpack bundle translation result:', result);
  });

  test('bundled engine handles errors gracefully', async () => {
    const result = await bundledEngine.translate('', '');
    expect(result.status).toMatch(/engine_not_ready|translation_failed/);
  });

  test('bundled TranslationStatus constants available', () => {
    expect(bundledEngine.TranslationStatus.SUCCESS).toBe('success');
    expect(bundledEngine.TranslationStatus.ENGINE_NOT_READY).toBe('engine_not_ready');
    expect(bundledEngine.TranslationStatus.TRANSLATION_FAILED).toBe('translation_failed');
  });
});
```

### 6.2 Bundle Performance Validation

**Performance Test Update**:
```javascript
// Add to existing performance.test.js
describe('Bundle vs Source Performance Comparison', () => {
  test('bundled version performance matches source', async () => {
    const sourceEngine = require('../src/engine.js');
    const bundledEngine = require('../dist/hover-translate-engine.js');
    
    // Load both engines
    await sourceEngine.loadEngine();
    await bundledEngine.loadEngine();
    
    const testWord = 'banco';
    const testSentence = 'El banco está cerrado.';
    
    // Time source version
    const sourceStart = Date.now();
    const sourceResult = await sourceEngine.translate(testWord, testSentence);
    const sourceTime = Date.now() - sourceStart;
    
    // Time bundled version  
    const bundledStart = Date.now();
    const bundledResult = await bundledEngine.translate(testWord, testSentence);
    const bundledTime = Date.now() - bundledStart;
    
    // Results should be identical
    expect(bundledResult.targetWord).toBe(sourceResult.targetWord);
    expect(bundledResult.status).toBe(sourceResult.status);
    
    // Performance should be comparable (within 50% variance)
    expect(bundledTime).toBeLessThan(sourceTime * 1.5);
    
    console.log(`Source: ${sourceTime}ms, Bundle: ${bundledTime}ms`);
  });
});
```

## 7. Chrome Extension Integration Guide

### 7.1 Main Application Integration

**Installation in hover-translate-spanish**:
```bash
# Install from GitHub (with bundled dist/)
npm install git+https://github.com/yourusername/hover-translate-engine-es-en.git
```

**Manifest.json Integration**:
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
  }]
}
```

**Usage in Main Application**:
```javascript
// src/main.js - No imports needed, bundle loads globally
// Functions available as: loadEngine, translate, getEngineState, TranslationStatus

async function initializeTranslation() {
  // Pre-load the engine
  await loadEngine();
  console.log('Engine ready:', getEngineState());
}

async function handleHover(targetWord, sentence) {
  const result = await translate(targetWord, sentence);
  
  if (result.status === TranslationStatus.SUCCESS) {
    showTooltip(result.targetWord);
  }
}
```

### 7.2 Distribution Benefits

**Complete Self-Containment**:
- ✅ Zero external downloads during runtime
- ✅ No Hugging Face server dependencies  
- ✅ Works completely offline after installation
- ✅ No webpack knowledge required in main app
- ✅ Single file inclusion in Chrome extension

**Installation Workflow**:
1. Main app: `npm install hover-translate-engine-es-en`
2. Bundle automatically included in node_modules/
3. Chrome extension loads bundle via manifest.json
4. Translation works immediately with no setup

## 8. Updated Testing Strategy

### 8.1 Test Organization

**Test Scripts Update**:
```json
{
  "scripts": {
    "test": "jest --ignore-pattern=performance --ignore-pattern=webpack",
    "test:unit": "jest tests/engine.test.js",
    "test:webpack": "jest tests/webpack.test.js", 
    "test:perf": "jest tests/performance",
    "test:all": "jest"
  }
}
```

**Test Execution Order**:
1. **Unit tests** (`npm test`) - Fast development feedback
2. **Webpack tests** (`npm run test:webpack`) - Validate bundle works
3. **Performance tests** (`npm run test:perf`) - Accuracy validation
4. **All tests** (`npm run test:all`) - Complete validation

### 8.2 Continuous Integration Considerations

**Build Process Validation**:
```bash
# CI pipeline should run:
npm install
npm run build        # Create bundle
npm run test:all     # Test everything including bundle
npm run check-bundle # Validate bundle health
```

**Bundle Validation Requirements**:
- Bundle exists and is properly sized (45-70MB)
- Bundle exports all required functions
- Bundle translation accuracy matches source version
- Bundle performance within acceptable range of source

## 9. Distribution and Publishing

### 9.1 NPM Package Updates

**Package.json Metadata**:
```json
{
  "name": "hover-translate-engine-es-en",
  "version": "0.2.0",
  "description": "Spanish to English translation engine with webpack bundling for Chrome extensions",
  "main": "dist/hover-translate-engine.js",
  "module": "src/engine.js",
  "files": [
    "dist/",
    "src/",
    "README.md"
  ],
  "keywords": [
    "translation", 
    "spanish", 
    "english", 
    "chrome-extension",
    "webpack",
    "bundled",
    "offline"
  ]
}
```

**README.md Updates**:
- Installation instructions for bundled version
- Chrome extension integration examples
- Build instructions for development
- Bundle size and offline capabilities

### 9.2 Git Repository Management

**Updated .gitignore**:
```
node_modules/
coverage/
*.log
.DS_Store

# Keep dist/ in repository for easy consumption
# dist/ is NOT ignored - consumers need the bundle
```

**Git Workflow**:
1. Develop in `src/engine.js`
2. Pre-commit hook automatically rebuilds bundle
3. Commit includes both source and bundled changes
4. Consumers get bundle without needing to build

## 10. Performance and Size Considerations

### 10.1 Bundle Size Analysis

**Expected Bundle Composition**:
- Helsinki model (ONNX): ~40-50MB (largest component)
- Transformers.js library: ~2-5MB
- Engine source code: ~0.1MB
- Webpack runtime: ~0.1MB
- **Total: ~45-55MB**

**Size Optimization Strategies**:
- Webpack production mode minification
- Tree shaking to remove unused Transformers.js features
- ONNX model compression (if available)
- Asset optimization for model files

### 10.2 Loading Performance

**Chrome Extension Loading**:
- Bundle loads once during extension initialization
- No runtime download delays
- Memory usage same as v0.1.x (~100MB working memory)
- Translation speed identical to source version

**Optimization Targets**:
- Bundle parse time: <2 seconds (Chrome extension startup)
- Memory efficiency: Same as v0.1.x (stable at ~100MB)
- Translation performance: No degradation from bundling

## 11. Risk Assessment and Mitigation

### 11.1 Technical Risks

**Bundle Size Risk**:
- Risk: 55MB bundle may be considered too large
- Mitigation: Chrome extension limit is 2GB - 55MB is well within range
- Alternative: Bundle optimization in future versions

**Build Complexity Risk**:
- Risk: Webpack configuration issues with Transformers.js
- Mitigation: Extensive testing with webpack.test.js
- Fallback: Source version remains available as backup

**Chrome Extension Compatibility**:
- Risk: Bundled version incompatible with Chrome extension sandbox
- Mitigation: UMD format ensures compatibility
- Testing: Comprehensive bundle integration tests

### 11.2 Development Workflow Risks

**Stale Bundle Risk**:
- Risk: Developers forget to rebuild bundle after source changes
- Mitigation: Pre-commit hook automatically rebuilds
- Backup: Bundle health check scripts

**Build Failure Risk**:
- Risk: Webpack build fails, breaking deployment
- Mitigation: Comprehensive error handling in build scripts
- Recovery: Build validation in CI/CD pipeline

## 12. Success Metrics and Validation

### 12.1 Functional Validation

**Bundle Functionality**:
- [ ] All v0.1.x functions exported correctly
- [ ] LoadEngine() works identically to source version
- [ ] Translate() maintains same accuracy and performance
- [ ] Error handling behavior unchanged
- [ ] TranslationStatus constants available

**Integration Validation**:
- [ ] Chrome extension can load bundle via manifest.json
- [ ] No external downloads required at runtime
- [ ] Bundle works completely offline
- [ ] Translation speed within 10% of source version

### 12.2 Quality Metrics

**Build System Quality**:
- [ ] Pre-commit hook prevents stale bundles
- [ ] Build process completes without errors
- [ ] Bundle size within expected range (45-70MB)
- [ ] All existing tests pass with bundled version

**Distribution Quality**:
- [ ] NPM package includes properly built bundle
- [ ] Main application can install and use without webpack knowledge
- [ ] Documentation enables successful Chrome extension integration
- [ ] Bundle validation tests ensure ongoing quality

### 12.3 Performance Benchmarks

**Bundle Performance Targets**:
- Bundle load time: <2 seconds in Chrome extension
- Translation accuracy: Identical to v0.1.x source version
- Translation speed: Within 10% of source version performance
- Memory usage: No increase from bundling process

## 13. Implementation Checklist

### 13.1 Development Tasks

**Webpack Configuration**:
- [ ] Create webpack.config.js with proper UMD output
- [ ] Configure babel-loader for ES6 compatibility
- [ ] Set up asset handling for ONNX model files
- [ ] Enable production optimizations

**Build Automation**:
- [ ] Implement pre-commit hook for automatic rebuilds
- [ ] Create bundle health check script
- [ ] Update package.json scripts for build process
- [ ] Add build validation to prevent stale bundles

**Testing Infrastructure**:
- [ ] Create webpack.test.js for bundle integration testing
- [ ] Add bundle vs source performance comparison
- [ ] Validate all existing tests work with bundle
- [ ] Implement bundle health monitoring

**Documentation Updates**:
- [ ] Update README.md with webpack usage instructions
- [ ] Document Chrome extension integration process
- [ ] Provide troubleshooting guide for build issues
- [ ] Include bundle size and performance information

### 13.2 Quality Assurance

**Validation Requirements**:
- [ ] Bundle exports match source exports exactly
- [ ] Translation accuracy identical to v0.1.x
- [ ] Performance within acceptable variance
- [ ] Chrome extension integration works seamlessly
- [ ] No external dependencies required at runtime

**Testing Completion**:
- [ ] All unit tests pass with bundle
- [ ] Performance tests validate bundle accuracy
- [ ] Integration tests confirm Chrome extension compatibility
- [ ] Build system prevents stale bundle issues

## 14. Conclusion

Version 0.2.0 transforms the hover-translate-engine-es-en from a source-only package into a production-ready, self-contained bundle optimized for Chrome extension integration. The webpack bundling system enables the main application to consume translation functionality without any knowledge of the underlying ML infrastructure, achieving the original goal of complete transparency.

The automated build system prevents common development issues like stale bundles, while comprehensive testing ensures the bundled version maintains identical functionality to the source version. The 55MB bundle size, while substantial, is well within Chrome extension limits and provides complete offline functionality with zero external dependencies.

This version establishes the foundation for seamless Chrome extension development while maintaining the clean architecture and high performance of the original engine. The build automation and validation systems ensure long-term maintainability as the project evolves.

The successful implementation of v0.2.0 enables the main hover-translate-spanish application to focus entirely on user experience and Chrome extension functionality, with the translation engine operating as a true black-box dependency requiring no ML or build tool expertise.