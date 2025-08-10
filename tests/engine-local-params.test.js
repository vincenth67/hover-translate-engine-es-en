/**
 * This test suite verifies the new parameterized signature of loadEngineLocal(),
 * ensuring explicit paths are forwarded to the underlying pipeline and that
 * defaults are applied when parameters are null.
 */
import { loadEngineLocal, _resetEngine, EngineState } from '../src/engine.js';
import { pipeline } from '@huggingface/transformers';

// Default values used in src/engine.js for backward compatibility
const DEFAULT_WASM_PATHS = {
  'ort-wasm-simd-threaded.jsep.wasm': './wasm/ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.jsep.mjs': './wasm/ort-wasm-simd-threaded.jsep.mjs'
};
const DEFAULT_MODEL_PATH = './dist/models/Xenova/opus-mt-es-en/';

/**
 * Tests for loadEngineLocal() parameterized usage
 * Verifies explicit parameters are forwarded and defaults apply when null.
 */
describe('loadEngineLocal() parameterized usage', () => {
  beforeEach(() => {
    _resetEngine();
    if (pipeline && typeof pipeline.mockClear === 'function') {
      pipeline.mockClear();
    }
  });

  afterEach(() => {
    _resetEngine();
  });

  /**
   * Validates that when explicit wasmPaths and modelPath are provided, they are
   * forwarded to pipeline unchanged and the engine reaches the READY state.
   */
  /**
   * should use provided wasmPaths and modelPath when passed explicitly
   */
  it('should use provided wasmPaths and modelPath when passed explicitly', async () => {
    const explicitWasmPaths = {
      'ort-wasm-simd-threaded.jsep.wasm': '/custom/wasm/ort-wasm-simd-threaded.jsep.wasm',
      'ort-wasm-simd-threaded.jsep.mjs': '/custom/wasm/ort-wasm-simd-threaded.jsep.mjs'
    };
    const explicitModelPath = '/custom/models/Xenova/opus-mt-es-en/';

    const state = await loadEngineLocal(explicitWasmPaths, explicitModelPath);
    expect(state).toBe(EngineState.READY);

    // Assert pipeline was called with repo id while using our explicit parameters via env.localModelPath
    expect(pipeline).toHaveBeenCalled();
    const [task, modelPathArg, options] = pipeline.mock.calls[0];
    expect(task).toBe('translation');
    expect(modelPathArg).toBe('Xenova/opus-mt-es-en');
    expect(options).toEqual(expect.objectContaining({ wasmPaths: explicitWasmPaths, dtype: 'fp32' }));
  });

  /**
   * Ensures that when wasmPaths is null, defaults are applied while modelPath
   * is taken from the provided argument.
   */
  /**
   * should apply default wasmPaths when wasmPaths is null
   */
  it('should apply default wasmPaths when wasmPaths is null', async () => {
    const customModelPath = '/alt/models/Xenova/opus-mt-es-en/';
    const state = await loadEngineLocal(null, customModelPath);
    expect(state).toBe(EngineState.READY);

    expect(pipeline).toHaveBeenCalled();
    const [, modelPathArg, options] = pipeline.mock.calls[0];
    expect(modelPathArg).toBe('Xenova/opus-mt-es-en');
    expect(options.wasmPaths).toEqual(DEFAULT_WASM_PATHS);
  });

  /**
   * Ensures that when modelPath is null, the default model path is applied while
   * using the provided wasmPaths.
   */
  /**
   * should apply default modelPath when modelPath is null
   */
  it('should apply default modelPath when modelPath is null', async () => {
    const customWasmPaths = {
      'ort-wasm-simd-threaded.jsep.wasm': './assets/wasm/ort-wasm-simd-threaded.jsep.wasm',
      'ort-wasm-simd-threaded.jsep.mjs': './assets/wasm/ort-wasm-simd-threaded.jsep.mjs'
    };
    const state = await loadEngineLocal(customWasmPaths, null);
    expect(state).toBe(EngineState.READY);

    expect(pipeline).toHaveBeenCalled();
    const [, modelPathArg, options] = pipeline.mock.calls[0];
    expect(modelPathArg).toBe('Xenova/opus-mt-es-en');
    expect(options.wasmPaths).toEqual(customWasmPaths);
  });
});


