/**
 * Webpack Configuration for Hover Translate Engine
 * 
 * This configuration:
 * 1. Bundles src/engine.js into a single JavaScript file
 * 2. Copies WASM files from @huggingface/transformers to dist/wasm/
 * 3. Creates a UMD library for Chrome extension integration
 * 4. Optimizes for production with minification
 */

import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  // STEP 1: Copy WASM files from node_modules to dist/wasm/
  plugins: [
    new CopyPlugin({
      patterns: [
        // Copy WASM binary (20MB) - contains the ONNX runtime WebAssembly code
        { 
          from: 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm', 
          to: 'wasm/',
          info: { minimized: false } // Don't try to minify binary files
        },
        // Copy MJS loader (44KB) - JavaScript module that loads the WASM
        { 
          from: 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs', 
          to: 'wasm/',
          info: { minimized: false }
        },
      ],
    }),
  ],
  
  // STEP 2: Build configuration
  mode: 'production', // Enable minification and optimizations
  entry: './src/engine.js', // Main entry point - our translation engine
  target: 'web', // Target web environment for browser/extension compatibility
  
  // STEP 3: Output configuration - where and how to build the bundle
  output: {
    path: path.resolve(__dirname, 'dist'), // Output to dist/ directory
    filename: 'hover-translate-engine.js', // Main bundle filename
    
    // UMD library configuration - allows usage in different environments
    library: 'HoverTranslateEngine', // Global variable name when loaded via <script>
    libraryTarget: 'umd', // Universal Module Definition - works with CommonJS, AMD, and global
    globalObject: 'this', // Ensures compatibility across different JavaScript environments
    umdNamedDefine: true, // Use named AMD define for better debugging
    
    publicPath: '', // No CDN path needed - everything is self-contained
    clean: true // Clean dist/ directory before each build to remove old files
  },
  // STEP 4: Module resolution - how webpack finds and processes files
  resolve: {
    extensions: ['.js'], // Only process .js files
    fallback: {
      // Browser compatibility: disable Node.js-specific modules
      // Transformers.js tries to use these in Node.js but they don't exist in browsers
      "path": false,   // Node.js path module
      "fs": false,     // Node.js filesystem module
      "os": false,     // Node.js operating system module
      "crypto": false  // Node.js crypto module (browser has web crypto API)
    }
  },
  
  // STEP 5: Module processing rules - how to transform different file types
  module: {
    rules: [
      {
        // Transform modern JavaScript to browser-compatible JavaScript
        test: /\.js$/, // Process all .js files
        exclude: /node_modules/, // Don't process third-party packages (already processed)
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] // Transform ES6+ to ES5 for broad compatibility
          }
        }
      },
      {
        // Handle WASM files (though we copy them separately, this handles any inline imports)
        test: /\.wasm$/,
        type: 'asset/inline' // Inline small WASM files as base64 data URLs
      }
    ]
  },
  
  // STEP 6: Optimization settings
  optimization: {
    minimize: true, // Minify the JavaScript bundle for smaller size
    splitChunks: false, // Keep everything in one file (don't create separate chunks)
  },
  
  // STEP 7: Development and debugging options
  stats: {
    // Custom logging configuration
    colors: true,
    modules: false, // Don't show individual modules (too verbose)
    chunks: false,  // Don't show chunk information
    assets: true,   // Show asset information (files created)
    timings: true,  // Show build timing
    builtAt: true,  // Show build timestamp
    version: false, // Don't show webpack version
    hash: false,    // Don't show build hash
    entrypoints: false, // Don't show entrypoint details
    warnings: true, // Show warnings
    errors: true,   // Show errors
    errorDetails: true // Show detailed error information
  }
};

/**
 * Build Process Summary:
 * 
 * 1. Clean dist/ directory
 * 2. Copy WASM files from @huggingface/transformers to dist/wasm/
 * 3. Process src/engine.js through Babel (ES6+ → ES5)
 * 4. Bundle all JavaScript dependencies into single file
 * 5. Minify the bundle for production
 * 6. Output hover-translate-engine.js to dist/
 * 
 * Final package structure:
 * dist/
 * ├── hover-translate-engine.js (28MB - main bundle)
 * └── wasm/
 *     ├── ort-wasm-simd-threaded.jsep.wasm (20MB - ONNX runtime)
 *     └── ort-wasm-simd-threaded.jsep.mjs (44KB - WASM loader)
 */
