// This script's only job is to load the engine and log the result.

console.log("Offscreen script executing...");

// The engine script is loaded by the HTML, so the engine object should be available.
const engine = self.HoverTranslateEngine;

if (!engine || typeof engine.loadEngine !== 'function') {
    console.error("FATAL: self.HoverTranslateEngine is not available.");
} else {
    console.log("Engine object found. Initializing...");
    engine.loadEngine().then(engineState => {
        if (engineState === 'translate engine ready') {
            // SUCCESS!
            console.log("SUCCESS: Offscreen engine is ready.");
        } else {
            console.error('FAILURE: Offscreen engine failed to initialize. Final state:', engineState);
        }
    }).catch(error => {
        console.error("FAILURE: An error occurred during engine initialization:", error);
    });
}
