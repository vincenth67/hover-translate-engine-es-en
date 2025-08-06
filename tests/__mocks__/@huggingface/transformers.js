// Mock for @huggingface/transformers
import { jest } from '@jest/globals';

// Create a more realistic mock that can handle different inputs
const mockTranslator = jest.fn().mockImplementation((input) => {
  // Simple mock translations based on common Spanish words
  const translations = {
    'banco': 'bank',
    'vela': 'candle',
    'planta': 'plant',
    'copa': 'cup',
    'rata': 'rat',
    'carta': 'letter',
    'casa': 'house',
    'hermana': 'sister',
    'perro': 'dog',
    'leche': 'milk',
    'azul': 'blue',
    'viernes': 'Friday',
    'música': 'music'
  };
  
  // Extract the target word from the input (after the last semicolon)
  const parts = input.split(';');
  const targetWord = parts[parts.length - 1].trim().replace('.', '').toLowerCase();
  
  // Get translation or default to target word
  const translation = translations[targetWord] || targetWord;
  
  // Simple sentence translation mapping
  const sentenceTranslations = {
    'El banco está cerrado': 'The bank is closed',
    'Me senté en el banco del parque': 'I sat on the park bench',
    'Voy al banco a depositar dinero': 'I am going to the bank to deposit money',
    'El banco central subió las tasas de interés': 'The central bank raised interest rates',
    'La casa es muy grande': 'The house is very large',
    'Mi hermana estudia medicina': 'My sister studies medicine',
    'El perro corre en el jardín': 'The dog runs in the garden',
    'Necesito comprar leche en el supermercado': 'I need to buy milk at the supermarket',
    'Los niños están jugando afuera': 'The children are playing outside',
    'Estoy corriendo en el parque': 'I am running in the park',
    'He comido demasiado hoy': 'I have eaten too much today',
    'El cielo está muy azul': 'The sky is very blue',
    'Mañana es viernes': 'Tomorrow is Friday',
    'Me gusta la música clásica': 'I like classical music'
  };
  
  // Get the sentence part (before the semicolon)
  const sentencePart = parts[0].trim();
  const translatedSentence = sentenceTranslations[sentencePart] || sentencePart;
  
  // Return in the expected format with translated sentence
  return Promise.resolve([{ 
    translation_text: `${translatedSentence}; ${translation}.` 
  }]);
});

export const pipeline = jest.fn().mockResolvedValue(mockTranslator);

export const env = {
  backends: {
    onnx: {
      wasm: {
        wasmPaths: ''
      }
    }
  }
}; 