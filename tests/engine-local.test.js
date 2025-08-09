/**
 * Unit tests for loadEngineLocal() function
 * 
 * Tests the offline/local engine loading functionality using real assets from dist/
 * These tests validate that the engine works with bundled model files for production use.
 */

import { 
  loadEngineLocal, 
  translate, 
  getEngineState, 
  EngineState, 
  TranslationStatus,
  _resetEngine 
} from '../src/engine.js';

import fs from 'fs';
import path from 'path';

// Test configuration
const MODELS_DIR = './dist/models/Xenova/opus-mt-es-en';
const REQUIRED_FILES = [
  'generation_config.json',
  'config.json', 
  'tokenizer.json',
  'tokenizer_config.json',
  'onnx/decoder_model_merged.onnx',
  'onnx/encoder_model.onnx'
];

// Helper function to check if all required model files exist
function checkModelFilesExist() {
  if (!fs.existsSync(MODELS_DIR)) {
    return false;
  }
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(MODELS_DIR, file);
    if (!fs.existsSync(filePath)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to get model files info for debugging
function getModelFilesInfo() {
  const info = {
    modelsDirExists: fs.existsSync(MODELS_DIR),
    files: {}
  };
  
  if (info.modelsDirExists) {
    for (const file of REQUIRED_FILES) {
      const filePath = path.join(MODELS_DIR, file);
      const exists = fs.existsSync(filePath);
      info.files[file] = {
        exists,
        path: filePath
      };
    }
  }
  
  return info;
}

describe('loadEngineLocal()', () => {
  beforeEach(() => {
    // Reset engine state before each test
    _resetEngine();
  });

  afterEach(() => {
    // Reset engine state after each test
    _resetEngine();
  });

  describe('Model files validation', () => {
    it('should have all required model files in dist/', () => {
      const modelFilesInfo = getModelFilesInfo();
      
      // This test should actually fail if files are missing
      expect(modelFilesInfo.modelsDirExists).toBe(true);
      
      const missingFiles = [];
      for (const [file, info] of Object.entries(modelFilesInfo.files)) {
        if (!info.exists) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        console.warn('⚠️  Missing model files:', missingFiles);
        console.warn('   Run: npm run collect-assets to download complete model files');
        fail(`Missing ${missingFiles.length} required model files. Run: npm run collect-assets`);
      }
      
      // All files exist - test can proceed
      for (const [file, info] of Object.entries(modelFilesInfo.files)) {
        expect(info.exists).toBe(true);
      }
    });
  });

  describe('Engine loading', () => {
    it('should load engine successfully from local assets', async () => {
      // Fail test if model files don't exist
      if (!checkModelFilesExist()) {
        fail('Model files not available. Run: npm run collect-assets');
      }

      // Test loadEngineLocal()
      const initialState = getEngineState();
      expect(initialState).toBe(EngineState.NOT_INITIALIZED);

      const result = await loadEngineLocal();
      
      expect(result).toBe(EngineState.READY);
      expect(getEngineState()).toBe(EngineState.READY);
    }, 30000); // 30 second timeout for model loading

    it('should fail gracefully when model files are missing', async () => {
      // This test simulates missing model files by temporarily renaming the directory
      const originalPath = MODELS_DIR;
      const tempPath = MODELS_DIR + '.temp';
      
      // Fail test if the models directory doesn't exist
      if (!fs.existsSync(originalPath)) {
        fail('No models directory to test missing files scenario. Run: npm run collect-assets');
      }

      try {
        // Temporarily move the models directory
        fs.renameSync(originalPath, tempPath);
        
        // Reset engine state
        _resetEngine();
        
        // Test loadEngineLocal() with missing files
        const result = await loadEngineLocal();
        
        expect(result).toBe(EngineState.INITIALIZATION_FAILED);
        expect(getEngineState()).toBe(EngineState.INITIALIZATION_FAILED);
        
      } finally {
        // Restore the models directory
        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, originalPath);
        }
      }
    }, 30000);
  });

  describe('Complete offline operation', () => {
    it('should work with translate() for end-to-end offline translation', async () => {
      // Fail test if model files don't exist
      if (!checkModelFilesExist()) {
        fail('Model files not available. Run: npm run collect-assets');
      }

      // Test complete offline pipeline: loadEngineLocal() + translate()
      const loadResult = await loadEngineLocal();
      expect(loadResult).toBe(EngineState.READY);
      
      // Test translation with local engine
      const translationResult = await translate('banco', 'El banco está cerrado.');
      
      expect(translationResult.status).toBe(TranslationStatus.SUCCESS);
      expect(translationResult.targetWord).toBe('bank');
      expect(translationResult.fullSentence).toContain('bank');
      expect(translationResult.fullSentence).toContain('closed');
    }, 60000); // 60 second timeout for full pipeline

    it('should handle multiple translations with local engine', async () => {
      // Fail test if model files don't exist
      if (!checkModelFilesExist()) {
        fail('Model files not available. Run: npm run collect-assets');
      }

      // Load local engine
      await loadEngineLocal();
      expect(getEngineState()).toBe(EngineState.READY);
      
      // Test multiple translations
      const testCases = [
        { word: 'banco', sentence: 'El banco está cerrado.', expected: 'bank' },
        { word: 'casa', sentence: 'La casa es grande.', expected: 'house' },
        { word: 'tiempo', sentence: 'El tiempo es bueno.', expected: 'weather' }
      ];
      
      for (const testCase of testCases) {
        const result = await translate(testCase.word, testCase.sentence);
        
        expect(result.status).toBe(TranslationStatus.SUCCESS);
        expect(result.targetWord).toBe(testCase.expected);
        expect(result.fullSentence).toContain(testCase.expected);
      }
    }, 90000); // 90 second timeout for multiple translations
  });

  describe('Engine state management', () => {
    it('should maintain engine state correctly across multiple calls', async () => {
      // Fail test if model files don't exist
      if (!checkModelFilesExist()) {
        fail('Model files not available. Run: npm run collect-assets');
      }

      // First call should load the engine
      const result1 = await loadEngineLocal();
      expect(result1).toBe(EngineState.READY);
      expect(getEngineState()).toBe(EngineState.READY);
      
      // Second call should return ready state without reloading
      const result2 = await loadEngineLocal();
      expect(result2).toBe(EngineState.READY);
      expect(getEngineState()).toBe(EngineState.READY);
      
      // Engine should still be functional
      const translationResult = await translate('hola', 'Hola mundo.');
      expect(translationResult.status).toBe(TranslationStatus.SUCCESS);
    }, 30000);
  });
});
