Service worker is ready. It will create the offscreen document on install/update.
background.js:19 Creating offscreen document...
offscreen.js:3 === NEW OFFScreen script executing... ===
offscreen.js:6 === Available global functions ===
offscreen.js:7 loadEngine: undefined
offscreen.js:8 loadEngineLocal: undefined
offscreen.js:9 translate: undefined
offscreen.js:10 getEngineState: undefined
offscreen.js:11 TranslationStatus: undefined
offscreen.js:14 === Global objects ===
offscreen.js:15 self.HoverTranslateEngine: object
offscreen.js:16 window.HoverTranslateEngine: object
offscreen.js:20 === Engine object functions ===
offscreen.js:21 engine.loadEngine: function
offscreen.js:22 engine.loadEngineLocal: function
offscreen.js:23 engine.translate: function
offscreen.js:24 engine.getEngineState: function
offscreen.js:25 engine.TranslationStatus: object
offscreen.js:65 === Checking if engine object and loadEngineLocal function are available ===
offscreen.js:70 === Engine functions found. Initializing with local files... ===
offscreen.js:33 === Loading engine with local WASM files and model files... ===
offscreen.js:44 === WASM paths configured: Object
offscreen.js:45 === Model path configured: chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/models/Xenova/opus-mt-es-en/
offscreen.js:49 === About to call engine's loadEngineLocal() with parameters ===
offscreen.js:50 === WASM paths being passed: {
  "ort-wasm-simd-threaded.jsep.wasm": "chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-simd-threaded.jsep.mjs": "chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs"
}
offscreen.js:51 === Model path being passed: chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/models/Xenova/opus-mt-es-en/
offscreen.js:52 === Model path type: string
offscreen.js:53 === Model path length: 127
background.js:25 Offscreen document created.
hover-translate-engine.js:2 WARNING: `MarianTokenizer` is not yet supported by Hugging Face's "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.
UI @ hover-translate-engine.js:2Understand this warning
ort-wasm-simd-threaded.jsep.mjs:1 wasm streaming compile failed: CompileError: WebAssembly.instantiateStreaming(): Refused to compile or instantiate WebAssembly module because neither 'wasm-eval' nor 'unsafe-eval' is an allowed source of script in the following Content Security Policy directive: "script-src 'self'"
(anonymous) @ ort-wasm-simd-threaded.jsep.mjs:1Understand this error
ort-wasm-simd-threaded.jsep.mjs:1 falling back to ArrayBuffer instantiation
(anonymous) @ ort-wasm-simd-threaded.jsep.mjs:1Understand this error
ort-wasm-simd-threaded.jsep.mjs:1 failed to asynchronously prepare wasm: CompileError: WebAssembly.instantiate(): Refused to compile or instantiate WebAssembly module because neither 'wasm-eval' nor 'unsafe-eval' is an allowed source of script in the following Content Security Policy directive: "script-src 'self'"
(anonymous) @ ort-wasm-simd-threaded.jsep.mjs:1Understand this error
ort-wasm-simd-threaded.jsep.mjs:1 Aborted(CompileError: WebAssembly.instantiate(): Refused to compile or instantiate WebAssembly module because neither 'wasm-eval' nor 'unsafe-eval' is an allowed source of script in the following Content Security Policy directive: "script-src 'self'")
ir @ ort-wasm-simd-threaded.jsep.mjs:1Understand this error
hover-translate-engine.js:2 Xenova model failed to load from local assets: Error: no available backend found. ERR: [wasm] RuntimeError: Aborted(CompileError: WebAssembly.instantiate(): Refused to compile or instantiate WebAssembly module because neither 'wasm-eval' nor 'unsafe-eval' is an allowed source of script in the following Content Security Policy directive: "script-src 'self'"). Build with -sASSERTIONS for more info.
    at H (hover-translate-engine.js:2:28816681)
    at async A.create (hover-translate-engine.js:2:28834065)
(anonymous) @ hover-translate-engine.js:2Understand this error
offscreen.js:56 === Engine loading completed. State: translate engine initialization failed
offscreen.js:76 === FAILURE: Offscreen engine failed to initialize. Final state: translate engine initialization failed
(anonymous) @ offscreen.js:76Understand this error
ort-wasm-simd-threaded.jsep.mjs:1 Uncaught (in promise) RuntimeError: Aborted(CompileError: WebAssembly.instantiate(): Refused to compile or instantiate WebAssembly module because neither 'wasm-eval' nor 'unsafe-eval' is an allowed source of script in the following Content Security Policy directive: "script-src 'self'"). Build with -sASSERTIONS for more info.
    at ir (ort-wasm-simd-threaded.jsep.mjs:1:6068)
    at ort-wasm-simd-threaded.jsep.mjs:1:40023
    at async ort-wasm-simd-threaded.jsep.mjs:1:39387Understand this error