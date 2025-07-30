import { loadEngine, translate } from '../src/engine.js';
import fs from 'fs';

// Memory tracking utilities
function getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        // Node.js environment
        const usage = process.memoryUsage();
        return Math.round(usage.heapUsed / 1024 / 1024); // Convert to MB
    } else if (typeof performance !== 'undefined' && performance.memory) {
        // Browser environment
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }
    return null; // Memory tracking not available
}

// Translation validation
function isCorrectTranslation(result, expectedWords) {
    const cleanResult = result.toLowerCase().trim();
    return expectedWords.some(expected => 
        cleanResult.includes(expected.toLowerCase())
    );
}

async function testTranslationEngine() {
    console.log('🚀 Starting Translation Engine Performance Test\n');
    
    // Track initial memory
    const initialMemory = getMemoryUsage();
    console.log(`📊 Initial Memory Usage: ${initialMemory !== null ? initialMemory + ' MB' : 'Unknown'}\n`);
    
    // Load test data
    console.log('📂 Loading test data...');
    const testData = fs.readFileSync('tests/fixtures/test-sentences.jsonl', 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    
    console.log(`✅ Loaded ${testData.length} test sentences\n`);
    
    // Load translation engine
    console.log('🔄 Loading translation engine...');
    await loadEngine();
    console.log('✅ Engine loaded successfully!\n');
    
    // Test results tracking
    const results = {
        ambiguous: { total: 0, correct: 0, failed: [] },
        idioms: { total: 0, correct: 0, failed: [] },
        colloquial: { total: 0, correct: 0, failed: [] },
        technical: { total: 0, correct: 0, failed: [] },
        generic: { total: 0, correct: 0, failed: [] }
    };
    
    const translationTimes = [];
    const allFailedIds = [];
    
    console.log('🧪 Running tests...\n');
    console.log('=' .repeat(80));
    
    // Test each sentence
    for (const test of testData) {
        const startTime = Date.now();
        
        try {
            // Extract target word and sentence from the test data
            const parts = test.spanish.split(';');
            const sentence = parts[0].trim();
            const targetWord = parts[1].trim().replace('.', '');
            
            // Translate using our engine
            const result = await translate(targetWord, sentence);
            const translationTime = Date.now() - startTime;
            
            // Check if translation is correct
            const isCorrect = result.status === 'success' && 
                             isCorrectTranslation(result.targetWord, test.expectedWords);
            
            // Update category results
            const category = test.category;
            results[category].total++;
            if (isCorrect) {
                results[category].correct++;
            } else {
                results[category].failed.push(test.id);
                allFailedIds.push(test.id);
            }
            
            // Track translation time
            translationTimes.push(translationTime);
            
            // Display result
            const status = isCorrect ? '✅' : '❌';
            console.log(`${status} ID ${test.id} [${category.toUpperCase()}]: "${targetWord}" in "${sentence}"`);
            console.log(`   → Status: ${result.status}`);
            console.log(`   → Translated: "${result.targetWord}" | Expected: [${test.expectedWords.join(', ')}]`);
            console.log(`   → Full sentence: "${result.fullSentence}"`);
            console.log(`   → Time: ${translationTime}ms`);
            console.log('');
            
        } catch (error) {
            console.log(`❌ ID ${test.id} - ERROR: ${error.message}`);
            results[test.category].total++;
            results[test.category].failed.push(test.id);
            allFailedIds.push(test.id);
            console.log('');
        }
    }
    
    // Final memory check
    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory !== null && initialMemory !== null 
        ? finalMemory - initialMemory 
        : null;
    
    // Calculate overall statistics
    const totalTests = testData.length;
    const totalCorrect = Object.values(results).reduce((sum, cat) => sum + cat.correct, 0);
    const overallAccuracy = ((totalCorrect / totalTests) * 100).toFixed(1);
    
    const minTime = Math.min(...translationTimes);
    const maxTime = Math.max(...translationTimes);
    const avgTime = Math.round(translationTimes.reduce((a, b) => a + b, 0) / translationTimes.length);
    
    // Display final results
    console.log('=' .repeat(80));
    console.log('📊 FINAL RESULTS - Translation Engine');
    console.log('=' .repeat(80));
    
    console.log('\n🎯 ACCURACY BY CATEGORY:');
    Object.entries(results).forEach(([category, data]) => {
        const accuracy = data.total > 0 ? ((data.correct / data.total) * 100).toFixed(1) : 'N/A';
        console.log(`  ${category.toUpperCase().padEnd(12)}: ${data.correct}/${data.total} (${accuracy}%)`);
        if (data.failed.length > 0) {
            console.log(`    Failed IDs: [${data.failed.join(', ')}]`);
        }
    });
    
    console.log('\n📈 OVERALL PERFORMANCE:');
    console.log(`  Total Accuracy: ${totalCorrect}/${totalTests} (${overallAccuracy}%)`);
    console.log(`  All Failed IDs: [${allFailedIds.join(', ')}]`);
    
    console.log('\n⏱️  TRANSLATION TIMES:');
    console.log(`  Min Time:     ${minTime}ms`);
    console.log(`  Average Time: ${avgTime}ms`);
    console.log(`  Max Time:     ${maxTime}ms`);
    console.log(`  Translations/sec: ${(1000 / avgTime).toFixed(2)}`);
    
    console.log('\n💾 MEMORY USAGE:');
    console.log(`  Initial Memory: ${initialMemory !== null ? initialMemory + ' MB' : 'Unknown'}`);
    console.log(`  Final Memory:   ${finalMemory !== null ? finalMemory + ' MB' : 'Unknown'}`);
    console.log(`  Memory Change:  ${memoryIncrease !== null ? (memoryIncrease >= 0 ? '+' : '') + memoryIncrease + ' MB' : 'Unknown'}`);
    
    console.log('\n✨ Test completed successfully!');
}

// Run the test
testTranslationEngine().catch(console.error); 