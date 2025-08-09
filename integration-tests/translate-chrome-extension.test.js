/**
 * Chrome extension-style integration test for loadEngineLocal() using getURL()-built paths.
 *
 * This test mimics a Chrome extension environment by defining global.chrome.runtime.getURL.
 * It constructs wasmPaths and modelPath via getURL() and verifies the engine loads and translates
 * using LOCAL assets from dist/. If required assets are missing, the test exits successfully with
 * a warning so that default developer environments aren't blocked.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEngineLocal, translate, TranslationStatus } from '../src/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve project root (integration-tests is at projectRoot/integration-tests)
const projectRoot = path.resolve(__dirname, '..');

// Required assets
const WASM_DIR = path.join(projectRoot, 'dist', 'wasm');
const MODELS_DIR = path.join(projectRoot, 'dist', 'models', 'Xenova', 'opus-mt-es-en');

function hasLocalAssets() {
  if (!fs.existsSync(WASM_DIR)) return false;
  if (!fs.existsSync(MODELS_DIR)) return false;
  // Basic file checks
  const requiredModelFiles = [
    'generation_config.json',
    'config.json',
    'tokenizer.json',
    'tokenizer_config.json',
    path.join('onnx', 'decoder_model_merged.onnx'),
    path.join('onnx', 'encoder_model.onnx')
  ];
  for (const rel of requiredModelFiles) {
    if (!fs.existsSync(path.join(MODELS_DIR, rel))) return false;
  }
  // WASM files
  const requiredWasm = [
    'ort-wasm-simd-threaded.jsep.wasm',
    'ort-wasm-simd-threaded.jsep.mjs'
  ];
  for (const f of requiredWasm) {
    if (!fs.existsSync(path.join(WASM_DIR, f))) return false;
  }
  return true;
}

async function main() {
  console.log('🧪 Chrome Extension-style Integration Test (LOCAL FILES)');
  console.log('================================================================');

  if (!hasLocalAssets()) {
    console.warn('⚠️  Local assets not found in dist/. Skipping Chrome-style integration test.');
    console.warn('   Run: npm run collect-assets to populate dist/models and dist/wasm');
    process.exit(0);
    return;
  }

  // Mock Chrome extension environment
  global.chrome = {
    runtime: {
      // In a browser extension, this returns a chrome-extension:// URL.
      // For Node integration tests, return a filesystem-relative path into dist/.
      getURL: (relativePath) => {
        // Normalize to projectRoot-based path to ensure Node can read files
        return path.join(projectRoot, relativePath);
      }
    }
  };

  const wasmPaths = {
    'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('dist/wasm/ort-wasm-simd-threaded.jsep.wasm'),
    'ort-wasm-simd-threaded.jsep.mjs': chrome.runtime.getURL('dist/wasm/ort-wasm-simd-threaded.jsep.mjs')
  };
  const modelPath = chrome.runtime.getURL('dist/models/Xenova/opus-mt-es-en/');

  console.log('🔧 Using Chrome-style paths:');
  console.log('   wasmPaths:', wasmPaths);
  console.log('   modelPath:', modelPath);

  // Test input (Spanish)
  const targetWord = 'banco';
  const fullSentence = 'El banco está cerrado.';
  const expectedTranslation = 'bank';
  console.log('');
  console.log('📝 Input (ES)');
  console.log(`   target word: "${targetWord}"`);
  console.log(`   sentence:    "${fullSentence}"`);
  console.log(`   expected EN: "${expectedTranslation}"`);
  console.log('');

  try {
    const loadState = await loadEngineLocal(wasmPaths, modelPath);
    console.log('✅ loadEngineLocal state:', loadState);

    const res = await translate(targetWord, fullSentence);
    console.log('✅ Output (EN)');
    console.log('   status:', res.status);
    console.log('   word:  ', res.targetWord);
    console.log('   sent:  ', res.fullSentence);

    if (res.status !== TranslationStatus.SUCCESS) {
      console.error('❌ Translation failed');
      process.exit(1);
      return;
    }

    console.log('✅ Chrome-style integration test passed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Chrome-style integration test error:', err?.message || err);
    process.exit(1);
  }
}

main();


