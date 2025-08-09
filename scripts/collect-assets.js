/**
 * Collect Assets Script
 * 
 * This script automatically discovers and copies all model files needed for offline operation.
 * It uses runtime inspection to ensure we get exactly the files that transformers.js downloads.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI color codes for terminal output (same as build.js)
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

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main asset collection function
async function collectAssets() {
  const cacheDir = 'node_modules/@huggingface/transformers/.cache/Xenova/opus-mt-es-en';
  const tempModelsDir = 'dist-temp/models/Xenova/opus-mt-es-en';
  const finalModelsDir = 'dist/models/Xenova/opus-mt-es-en';
  
  try {
    log.header('ASSET COLLECTION - DISCOVERING MODEL FILES');
    log.info('Using runtime inspection to discover exactly what files transformers.js downloads');
    
    // Step 1: Clear cache to force fresh download
    log.step('Step 1: Clearing transformers cache');
    if (fs.existsSync(cacheDir)) {
      log.info(`Removing existing cache: ${cacheDir}`);
      fs.rmSync(cacheDir, { recursive: true, force: true });
      log.success('Cache cleared successfully');
    } else {
      log.info('No existing cache found - will create fresh');
    }
    
    // Step 2: Run engine to download fresh assets
    log.step('Step 2: Running engine to download fresh assets');
    log.info('Importing engine and running loadEngine() + translate()...');
    
    // Import the engine (this will trigger the download)
    const { loadEngine, translate } = await import('../src/engine.js');
    
    // Run the engine to force asset download
    log.info('Loading engine (this will download model files)...');
    const loadResult = await loadEngine();
    log.success(`Engine load result: ${loadResult}`);
    
    log.info('Running translation test to ensure all assets are downloaded...');
    const translateResult = await translate('banco', 'El banco está cerrado.');
    log.success(`Translation test result: ${translateResult.status}`);
    log.info(`Translated word: "${translateResult.targetWord}"`);
    log.info(`Translated sentence: "${translateResult.fullSentence}"`);
    
    // Step 3: Scan cache directory for downloaded files
    log.step('Step 3: Scanning cache for downloaded files');
    
    if (!fs.existsSync(cacheDir)) {
      throw new Error('Cache directory was not created - engine may have failed to download assets');
    }
    
    const discoveredFiles = scanDirectory(cacheDir);
    log.success(`Discovered ${discoveredFiles.length} files in cache`);
    
    // Log discovered files
    for (const file of discoveredFiles) {
      log.info(`  ${file.path} (${file.sizeFormatted})`);
    }
    
         // Step 4: Create temp directory structure
     log.step('Step 4: Creating temporary directory structure');
     ensureDirectoryExists(tempModelsDir);
     log.success(`Created temporary directory: ${tempModelsDir}`);
    
         // Step 5: Copy all discovered files to temp directory
     log.step('Step 5: Copying assets to temporary directory');
     
     let totalSize = 0;
     let copiedCount = 0;
     
     for (const file of discoveredFiles) {
       const destPath = path.join(tempModelsDir, file.path);
       const destDir = path.dirname(destPath);
       
       // Ensure destination directory exists
       ensureDirectoryExists(destDir);
       
       // Copy file
       fs.copyFileSync(file.fullPath, destPath);
       totalSize += file.size;
       copiedCount++;
       
       log.info(`  Copied: ${file.path} (${file.sizeFormatted})`);
     }
     
     log.success(`Copied ${copiedCount} files to temp directory (${formatFileSize(totalSize)})`);
    
         // Step 6: Validate copied files in temp directory
     log.step('Step 6: Validating copied files in temp directory');
     
     const copiedFiles = scanDirectory(tempModelsDir);
     let validationErrors = 0;
     
     for (const originalFile of discoveredFiles) {
       const copiedFile = copiedFiles.find(f => f.path === originalFile.path);
       
       if (!copiedFile) {
         log.error(`Missing file: ${originalFile.path}`);
         validationErrors++;
       } else {
         // Allow small size differences (within 1% or 1KB, whichever is larger)
         const sizeDiff = Math.abs(copiedFile.size - originalFile.size);
         const tolerance = Math.max(originalFile.size * 0.01, 1024); // 1% or 1KB
         
         if (sizeDiff > tolerance) {
           log.error(`Size mismatch for ${originalFile.path}: expected ${originalFile.sizeFormatted}, got ${copiedFile.sizeFormatted} (diff: ${formatFileSize(sizeDiff)})`);
           validationErrors++;
         } else if (sizeDiff > 0) {
           log.warning(`Minor size difference for ${originalFile.path}: expected ${originalFile.sizeFormatted}, got ${copiedFile.sizeFormatted} (diff: ${formatFileSize(sizeDiff)})`);
         }
       }
     }
     
     if (validationErrors > 0) {
       throw new Error(`${validationErrors} validation errors found`);
     }
     
          log.success('All files validated successfully in temp directory');
     
     // Step 7: Atomic move to final location
     log.step('Step 7: Atomic move to final location');
     
     // Backup existing dist/models if it exists
     const backupDir = 'dist-backup';
     if (fs.existsSync('dist/models')) {
       log.info('Backing up existing dist/models directory...');
       if (fs.existsSync(backupDir)) {
         fs.rmSync(backupDir, { recursive: true, force: true });
       }
       fs.renameSync('dist/models', backupDir);
       log.success('Existing models backed up');
     }
     
     // Ensure dist directory exists
     ensureDirectoryExists('dist');
     
     // Atomically move temp to final location
     log.info('Moving temp directory to final location...');
     
     // Remove existing dist directory (after backup)
     if (fs.existsSync('dist')) {
       fs.rmSync('dist', { recursive: true, force: true });
     }
     
     // Move temp to dist
     fs.renameSync('dist-temp', 'dist');
     log.success('Atomic move completed successfully');
     
     // Clean up backup since move was successful
     if (fs.existsSync(backupDir)) {
       fs.rmSync(backupDir, { recursive: true, force: true });
       log.info('Backup directory cleaned up');
     }
     
     // Step 8: Final summary
     log.step('Step 8: Asset collection summary');
    
    log.info('Package structure:');
    log.info('  dist/');
    log.info('  └── models/');
    log.info('      └── Xenova/');
    log.info('          └── opus-mt-es-en/');
    
    for (const file of discoveredFiles) {
      const indent = '              ';
      log.info(`${indent}${file.path} (${file.sizeFormatted})`);
    }
    
    console.log('\n' + '='.repeat(60));
    log.success('ASSET COLLECTION SUCCESSFUL! 🎉');
    log.success(`Total assets: ${copiedCount} files`);
    log.success(`Total size: ${formatFileSize(totalSize)}`);
    log.success('Assets are ready for offline operation');
    console.log('='.repeat(60) + '\n');
    
     } catch (error) {
     console.log('\n' + '='.repeat(60));
     log.error('ASSET COLLECTION FAILED! 💥');
     log.error(`Error: ${error.message}`);
     
     // Clean up temp directory if it exists
     if (fs.existsSync('dist-temp')) {
       log.step('Cleaning up temporary directory');
       fs.rmSync('dist-temp', { recursive: true, force: true });
       log.info('Temporary directory cleaned up');
     }
     
     // Restore backup if it exists
     if (fs.existsSync('dist-backup')) {
       log.step('Restoring previous models from backup');
       if (fs.existsSync('dist/models')) {
         fs.rmSync('dist/models', { recursive: true, force: true });
       }
       fs.renameSync('dist-backup', 'dist/models');
       log.success('Previous models restored successfully');
     }
     
     if (error.stack) {
       console.log('\nStack trace:');
       console.log(error.stack);
     }
     
     console.log('\nℹ️  Previous models preserved - no data loss');
     console.log('='.repeat(60) + '\n');
     process.exit(1);
   }
}

// Run the asset collection
collectAssets().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
