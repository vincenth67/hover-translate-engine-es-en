# Prompt for Rebuilding the Translation Engine

## High-Level Goal:
My primary goal is to rebuild the hover-translate-engine-es-en project. The final output, dist/hover-translate-engine.js, must be a single, 100% self-contained file with zero external network requests.
Problem Statement:
Currently, the bundled engine fails when used inside a Manifest V3 Chrome Extension due to a strict Content Security Policy (CSP). The extension's console shows the following fatal error:
This error proves that the @huggingface/transformers library, a core dependency, is trying to download its WebAssembly (WASM) runtime components from an external CDN. This is not permissible in my extension.

## Core Requirement:
The final dist/hover-translate-engine.js file and its associated assets must be completely self-hosted. All necessary components, especially the WASM helper files from @huggingface/transformers, must be included locally within the dist folder and loaded without any internet access.
Technical Implementation Plan:
The solution is to force the @huggingface/transformers library into an offline, self-hosted mode. Please implement the following steps:
Download the Necessary WASM Helper Files.
You will need to manually download the required ONNX runtime files from the Hugging Face CDN. The key files are likely:
ort-wasm-simd-threaded.jsep.mjs
ort-wasm-simd.wasm
ort-wasm-threaded.wasm
Store These Files Locally in the Project.
Create a new directory at the root of the hover-translate-engine-es-en project, for example: public/wasm/. Place the downloaded files into this new directory.
Configure Transformers.js to Use Local Paths.
In the main entry point of the engine's JavaScript code (before any model loading occurs), you must use the library's env configuration object to override the default CDN paths and point to your local files.
Here is a code example of how to do this:
Update the Build Process (e.g., webpack.config.js).
Ensure your bundler is configured to copy the entire public/ directory (containing the new wasm folder) into the final dist directory. This is critical so that the local paths you set in the previous step are correct relative to the dist root.

## Final Deliverable:
The dist directory should contain:
hover-translate-engine.js (the main bundle)
A wasm subdirectory containing the self-hosted runtime files.

## Verification:
After the build is complete, please verify that the final dist/hover-translate-engine.js file contains no references to cdn.jsdelivr.net or any other external URLs. The build must be completely offline-ready.