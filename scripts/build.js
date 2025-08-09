/**
 * Enhanced Build Script with Detailed Logging
 * 
 * This script provides clear step-by-step feedback during the webpack build process,
 * showing exactly what's happening at each stage.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${colors.bright}${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.magenta}${colors.bright}🚀 ${msg}${colors.reset}\n`)
};

// Helper function to format file sizes
function formatFileSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to check if file exists and get its size
function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size)
    };
  } catch (error) {
    return { exists: false };
  }
}

// Helper function to recursively scan directory and get all files
function scanDirectory(dirPath, basePath = '') {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      const subFiles = scanDirectory(fullPath, relativePath);
      files.push(...subFiles);
    } else {
      // Add file with relative path
      files.push({
        path: relativePath,
        fullPath: fullPath,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size)
      });
    }
  }
  
  return files;
}

// Main build function
async function buildWithLogging() {
  const tempDir = './dist-temp';
  const finalDir = './dist';
  const backupDir = './dist-backup';
  
  try {
    log.header('HOVER TRANSLATE ENGINE - ATOMIC BUILD PROCESS');
    log.info('Building to temporary directory, will only replace on success');
    
    // Step 1: Pre-build checks
    log.step('Step 1: Pre-build validation');
    
    // Check if source file exists
    const sourceFile = './src/engine.js';
    const sourceInfo = getFileInfo(sourceFile);
    if (!sourceInfo.exists) {
      log.error(`Source file not found: ${sourceFile}`);
      process.exit(1);
    }
    log.success(`Source file found: ${sourceFile} (${sourceInfo.sizeFormatted})`);
    
    // Check if transformers package is installed
    const wasmSource1 = 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm';
    const wasmSource2 = 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs';
    
    const wasm1Info = getFileInfo(wasmSource1);
    const wasm2Info = getFileInfo(wasmSource2);
    
    if (!wasm1Info.exists || !wasm2Info.exists) {
      log.error('WASM files not found in @huggingface/transformers package');
      log.error('Run: npm install @huggingface/transformers');
      process.exit(1);
    }
    
    log.success(`WASM file 1 found: ${wasmSource1} (${wasm1Info.sizeFormatted})`);
    log.success(`WASM file 2 found: ${wasmSource2} (${wasm2Info.sizeFormatted})`);
    
    // Check if models directory exists (for full build vs dev build)
    const modelsDir = './dist/models/Xenova/opus-mt-es-en';
    const modelsDirExists = fs.existsSync(modelsDir);
    
    if (modelsDirExists) {
      log.success('Models directory found - building with offline assets');
      
      // Validate required model files
      const requiredFiles = [
        'generation_config.json',
        'config.json',
        'tokenizer.json',
        'tokenizer_config.json',
        'onnx/decoder_model_merged.onnx',
        'onnx/encoder_model.onnx'
      ];
      
      let totalModelsSize = 0;
      let missingFiles = [];
      
      for (const file of requiredFiles) {
        const filePath = path.join(modelsDir, file);
        const fileInfo = getFileInfo(filePath);
        
        if (fileInfo.exists) {
          totalModelsSize += fileInfo.size;
          log.info(`  ✓ ${file} (${fileInfo.sizeFormatted})`);
        } else {
          missingFiles.push(file);
          log.error(`  ✗ ${file} - MISSING`);
        }
      }
      
      if (missingFiles.length > 0) {
        log.error(`Missing ${missingFiles.length} required model files`);
        log.error('Run: npm run collect-assets to download model files');
        process.exit(1);
      }
      
      log.success(`All model files validated (${formatFileSize(totalModelsSize)})`);
    } else {
      log.warning('Models directory not found - building for development (CDN mode)');
      log.info('For production build with offline assets, run: npm run build');
      log.info('For development build without assets, run: npm run build:dev');
    }
    
    // Step 2: Prepare build directories
    log.step('Step 2: Preparing build directories');
    
    // Clean temp directory if it exists
    if (fs.existsSync(tempDir)) {
      log.info('Cleaning temporary build directory...');
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    // Backup existing dist if it exists
    if (fs.existsSync(finalDir)) {
      log.info('Backing up existing dist/ directory...');
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
      }
      fs.renameSync(finalDir, backupDir);
    } else {
      log.info('No previous build found');
    }
    
    // Step 3: Run webpack build
    log.step('Step 3: Running webpack build');
    log.info('Bundling JavaScript files...');
    log.info('Copying WASM files...');
    log.info('Optimizing and minifying...');
    
    const startTime = Date.now();
    
    // Execute webpack with custom stats output to temp directory
    const result = execSync(`npx webpack --mode=production --stats=errors-warnings --output-path="${tempDir}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const buildTime = Date.now() - startTime;
    
    // Step 4: Validate temporary build output
    log.step('Step 4: Validating temporary build output');
    
    // Check main bundle in temp directory
    const mainBundle = `${tempDir}/hover-translate-engine.js`;
    const mainBundleInfo = getFileInfo(mainBundle);
    
    if (!mainBundleInfo.exists) {
      throw new Error('Main bundle was not created in temporary directory!');
    }
    log.success(`Main bundle created: ${mainBundle} (${mainBundleInfo.sizeFormatted})`);
    
    // Check WASM files in temp directory
    const tempWasm1 = `${tempDir}/wasm/ort-wasm-simd-threaded.jsep.wasm`;
    const tempWasm2 = `${tempDir}/wasm/ort-wasm-simd-threaded.jsep.mjs`;
    
    const tempWasm1Info = getFileInfo(tempWasm1);
    const tempWasm2Info = getFileInfo(tempWasm2);
    
    if (!tempWasm1Info.exists || !tempWasm2Info.exists) {
      throw new Error('WASM files were not copied to temporary wasm/ directory!');
    }
    
    log.success(`WASM file created: ${tempWasm1} (${tempWasm1Info.sizeFormatted})`);
    log.success(`WASM file created: ${tempWasm2} (${tempWasm2Info.sizeFormatted})`);
    
    // Step 5: Copy README to temp directory
    log.step('Step 5: Adding package documentation');
    
    // Copy root README.md to temp directory
    const rootReadme = './README.md';
    const distReadme = `${tempDir}/README.md`;
    
    if (fs.existsSync(rootReadme)) {
      fs.copyFileSync(rootReadme, distReadme);
      const readmeInfo = getFileInfo(distReadme);
      log.success(`README.md copied to package (${readmeInfo.sizeFormatted})`);
    } else {
      log.warning('README.md not found in root directory');
    }
    
    // Step 6: Atomic replacement
    log.step('Step 6: Atomic replacement - moving temp to final location');
    
    // Move temp directory to final location
    fs.renameSync(tempDir, finalDir);
    log.success('Build successfully moved to dist/ directory');
    
    // Clean up backup since build was successful
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
      log.info('Backup directory cleaned up');
    }
    
    // Step 7: Build summary
    log.step('Step 7: Build summary');
    
    // Re-read file info from final location
    const finalMainBundle = './dist/hover-translate-engine.js';
    const finalWasm1 = './dist/wasm/ort-wasm-simd-threaded.jsep.wasm';
    const finalWasm2 = './dist/wasm/ort-wasm-simd-threaded.jsep.mjs';
    
    const finalMainBundleInfo = getFileInfo(finalMainBundle);
    const finalWasm1Info = getFileInfo(finalWasm1);
    const finalWasm2Info = getFileInfo(finalWasm2);
    
    let totalSize = finalMainBundleInfo.size + finalWasm1Info.size + finalWasm2Info.size;
    let buildType = 'Development (CDN mode)';
    
    // Check if models directory exists in final build
    const finalModelsDir = './dist/models/Xenova/opus-mt-es-en';
    if (fs.existsSync(finalModelsDir)) {
      buildType = 'Production (Offline mode)';
      
      // Calculate models directory size
      const modelsFiles = scanDirectory(finalModelsDir);
      let modelsSize = 0;
      for (const file of modelsFiles) {
        modelsSize += file.size;
      }
      totalSize += modelsSize;
      
      log.info('Package structure:');
      log.info('  dist/');
      log.info(`  ├── hover-translate-engine.js (${finalMainBundleInfo.sizeFormatted})`);
      log.info(`  ├── README.md (${getFileInfo('./dist/README.md').sizeFormatted})`);
      log.info('  ├── wasm/');
      log.info(`  │   ├── ort-wasm-simd-threaded.jsep.wasm (${finalWasm1Info.sizeFormatted})`);
      log.info(`  │   └── ort-wasm-simd-threaded.jsep.mjs (${finalWasm2Info.sizeFormatted})`);
      log.info('  └── models/');
      log.info(`      └── Xenova/opus-mt-es-en/ (${formatFileSize(modelsSize)})`);
    } else {
      log.info('Package structure:');
      log.info('  dist/');
      log.info(`  ├── hover-translate-engine.js (${finalMainBundleInfo.sizeFormatted})`);
      log.info(`  ├── README.md (${getFileInfo('./dist/README.md').sizeFormatted})`);
      log.info('  └── wasm/');
      log.info(`      ├── ort-wasm-simd-threaded.jsep.wasm (${finalWasm1Info.sizeFormatted})`);
      log.info(`      └── ort-wasm-simd-threaded.jsep.mjs (${finalWasm2Info.sizeFormatted})`);
    }
    
    log.info(`Build completed in ${buildTime}ms`);
    log.info(`Build type: ${buildType}`);
    log.info(`Total package size: ${formatFileSize(totalSize)}`);
    
    // Final success message
    console.log('\n' + '='.repeat(60));
    log.success('ATOMIC BUILD SUCCESSFUL! 🎉');
    log.success(`Build type: ${buildType}`);
    log.success('Package atomically replaced - no corruption risk');
    if (buildType === 'Production (Offline mode)') {
      log.success('Package is ready for production deployment');
      log.success('Chrome extension can now install and use this package offline');
    } else {
      log.success('Package is ready for development');
      log.success('For production build with offline assets, run: npm run build');
    }
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log.error('BUILD FAILED! 💥');
    log.error(`Error: ${error.message}`);
    
    // Restore backup if it exists
    if (fs.existsSync(backupDir)) {
      log.step('Restoring previous build from backup');
      if (fs.existsSync(finalDir)) {
        fs.rmSync(finalDir, { recursive: true, force: true });
      }
      fs.renameSync(backupDir, finalDir);
      log.success('Previous build restored successfully');
    }
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      log.info('Temporary build directory cleaned up');
    }
    
    if (error.stdout) {
      console.log('\nWebpack output:');
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      console.log('\nWebpack errors:');
      console.log(error.stderr);
    }
    
    console.log('\nℹ️  Previous build files preserved - no data loss');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
}

// Run the build
buildWithLogging().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
