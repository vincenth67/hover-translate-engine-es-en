
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
offscreen.js:44 === WASM paths configured: Objectort-wasm-simd-threaded.jsep.mjs: "chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.mjs"ort-wasm-simd-threaded.jsep.wasm: "chrome-extension://akloglapgpiadiimnlmkggoggpnnmiga/node_modules/hover-translate-engine-es-en/dist/wasm/ort-wasm-simd-threaded.jsep.wasm"[[Prototype]]: Object
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
4hover-translate-engine.js:2 Unable to add response to browser cache: TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported.
(anonymous) @ hover-translate-engine.js:2Understand this warning
hover-translate-engine.js:2 WARNING: `MarianTokenizer` is not yet supported by Hugging Face's "fast" tokenizers library. Therefore, you may experience slightly inaccurate results.
UI @ hover-translate-engine.js:2Understand this warning
hover-translate-engine.js:2 Unable to add response to browser cache: TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported.
(anonymous) @ hover-translate-engine.js:2Understand this warning
hover-translate-engine.js:2 Refused to load the script 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.0/dist/ort-wasm-simd-threaded.jsep.mjs' because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.

vA @ hover-translate-engine.js:2Understand this error
hover-translate-engine.js:2 Refused to load the script 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.0/dist/ort-wasm-simd-threaded.jsep.mjs' because it violates the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.

vA @ hover-translate-engine.js:2Understand this error
hover-translate-engine.js:2 Xenova model failed to load from local assets: Error: no available backend found. ERR: [wasm] TypeError: Failed to fetch dynamically imported module: https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.0/dist/ort-wasm-simd-threaded.jsep.mjs
    at H (hover-translate-engine.js:2:28816681)
    at async A.create (hover-translate-engine.js:2:28834065)
    at async o (hover-translate-engine.js:2:29252394)
    at async hover-translate-engine.js:2:29306414
    at async Promise.all (index 0)
    at async L (hover-translate-engine.js:2:29303258)
    at async Promise.all (index 0)
    at async RU.from_pretrained (hover-translate-engine.js:2:29315705)
    at async JF.from_pretrained (hover-translate-engine.js:2:29363915)
    at async Promise.all (index 1)
(anonymous) @ hover-translate-engine.js:2Understand this error
offscreen.js:56 === Engine loading completed. State: translate engine initialization failed
offscreen.js:76 === FAILURE: Offscreen engine failed to initialize. Final state: translate engine initialization failed
(anonymous) @ offscreen.js:76Understand this error
hover-translate-engine.js:2 Unable to add response to browser cache: TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported.
(anonymous) @ hover-translate-engine.js:2Understand this warning