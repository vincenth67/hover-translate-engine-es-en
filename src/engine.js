import { pipeline } from '@huggingface/transformers';



// Public Engine States (API type)
export const EngineState = {
  NOT_INITIALIZED: 'translate engine not initialized',
  INITIALIZING: 'translate engine initializing',
  READY: 'translate engine ready',
  INITIALIZATION_FAILED: 'translate engine initialization failed'
};

let _engineState = EngineState.NOT_INITIALIZED;

// Module-scoped state (private)

let translator = null;

// Public Translation Status (External API)
export const TranslationStatus = {
  SUCCESS: 'success',
  ENGINE_NOT_READY: 'engine_not_ready',
  TRANSLATION_FAILED: 'translation_failed'
};

/**
 * Loads the Helsinki translation model
 * @returns {Promise<string>} Engine state after loading attempt. One of EngineState values.
 */
export async function loadEngine() {
  try {
    if (!translator) {
      console.debug('Loading Xenova/opus-mt-es-en model...');
      translator = await pipeline('translation', 'Xenova/opus-mt-es-en');
      console.debug('Xenova model loaded successfully');
    }
    _engineState = EngineState.READY;
    return _engineState;
  } catch (error) {
    _engineState = EngineState.INITIALIZATION_FAILED;
    console.debug('Xenova model failed to load:', error.message);
    return _engineState;
  }
}

/**
 * Translates Spanish text to English using context-aware semicolon technique
 * @param {string} targetWord - Spanish word/phrase to translate (1-6 words max)
 * @param {string} sentence - Full sentence containing the target word
 * @returns {Promise<TranslationResult>} Translation result object
 */
export async function translate(targetWord, sentence) {
  try {
    // Input validation
    if (!targetWord || !sentence || typeof targetWord !== 'string' || typeof sentence !== 'string') {
      return {
        targetWord: '',
        fullSentence: '',
        status: TranslationStatus.TRANSLATION_FAILED
      };
    }

    // Load model if not already loaded
    if (!translator) {
      await loadEngine();
      if (_engineState !== EngineState.READY) {
        return {
          targetWord: '',
          fullSentence: '',
          status: TranslationStatus.ENGINE_NOT_READY
        };
      }
    }

    // Prepare the semicolon-hacked sentence
    const hackedSentence = _prepareHackedSentence(targetWord, sentence);
    
    // Translate using Helsinki model (exactly like the working test)
    const result = await translator(hackedSentence);
    const fullTranslation = result[0].translation_text;
    
    // Extract translated word and sentence
    const translatedWord = _extractTranslatedWord(fullTranslation);
    const translatedSentence = _extractTranslatedSentence(fullTranslation);
    
    return {
      targetWord: translatedWord,
      fullSentence: translatedSentence,
      status: TranslationStatus.SUCCESS
    };
    
  } catch (error) {
    // Return TRANSLATION_FAILED status with empty strings
    console.debug('Translation failed:', error);
    return {
      targetWord: '',
      fullSentence: '',
      status: TranslationStatus.TRANSLATION_FAILED
    };
  }
}

/**
 * Gets current engine state
 * @returns {string} Current engine state. One of EngineState values.
 */
export function getEngineState() {
  return _engineState;
}

/**
 * Resets the engine state (useful for testing)
 * @private
 */
export function _resetEngine() {
  _engineState = EngineState.NOT_INITIALIZED;
  translator = null;
}

/**
 * Prepares the semicolon-hacked sentence for translation
 * @param {string} targetWord - Word to translate
 * @param {string} sentence - Original sentence
 * @returns {string} Formatted sentence: "Sentence starts with capital; word."
 * @private
 */
export function _prepareHackedSentence(targetWord, sentence) {
  // Clean and validate inputs
  let cleanSentence = sentence.trim();
  let cleanTargetWord = targetWord.trim();
  
  // Ensure sentence starts with capital letter
  if (cleanSentence.length > 0) {
    cleanSentence = cleanSentence.charAt(0).toUpperCase() + cleanSentence.slice(1);
  }
  
  // Remove existing periods if present (only at the very end)
  cleanSentence = cleanSentence.replace(/\.+$/, '');
  
  // Create hacked sentence: "Sentence; targetWord."
  return `${cleanSentence}; ${cleanTargetWord}.`;
}

/**
 * Extracts the translated word from the semicolon-separated result
 * Handles edge case: sentences with existing semicolons use LAST semicolon
 * @param {string} fullTranslation - Complete translation from Helsinki model
 * @returns {string} Extracted translated word
 * @private
 */
export function _extractTranslatedWord(fullTranslation) {
  // Use LAST semicolon to handle sentences with existing semicolons
  const lastSemicolonIndex = fullTranslation.lastIndexOf(';');
  
  if (lastSemicolonIndex === -1) {
    return ''; // No semicolon found
  }
  
  // Get the part after the last semicolon
  let translatedWord = fullTranslation.substring(lastSemicolonIndex + 1).trim();
  
  // Remove trailing period and punctuation
  translatedWord = translatedWord.replace(/\.$/, '');
  translatedWord = translatedWord.replace(/[.,!?;:"'()]/g, '');
  
  return translatedWord.trim();
}

/**
 * Extracts the translated sentence from the semicolon-separated result
 * @param {string} fullTranslation - Complete translation from Helsinki model
 * @returns {string} Extracted translated sentence
 * @private
 */
export function _extractTranslatedSentence(fullTranslation) {
  const lastSemicolonIndex = fullTranslation.lastIndexOf(';');
  
  if (lastSemicolonIndex === -1) {
    return fullTranslation.trim(); // No semicolon found, return full translation
  }
  
  // Get the part before the last semicolon
  return fullTranslation.substring(0, lastSemicolonIndex).trim();
} 