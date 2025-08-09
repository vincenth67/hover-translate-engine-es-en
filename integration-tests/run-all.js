/**
 * @fileoverview Simple Integration Test Runner
 * 
 * Automatically discovers and runs all .test.js files in the integration-tests directory.
 */

import { spawn } from "child_process";
import { readdir } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runAllTests() {
  console.log("🧪 Running all integration tests...\n");
  
  try {
    // Get all .test.js files
    const files = await readdir(__dirname);
    const testFiles = files.filter(f => f.endsWith(".test.js"));
    
    console.log(`📁 Found ${testFiles.length} integration tests:`);
    testFiles.forEach(f => console.log(`   • ${f}`));
    console.log("");
    
    let passed = 0;
    let failed = 0;
    
    // Run each test
    for (const testFile of testFiles) {
      console.log(`🚀 Running: ${testFile}`);
      console.log("─".repeat(50));
      
      const result = await new Promise((resolve) => {
        const child = spawn("node", ["--experimental-vm-modules", testFile], {
          cwd: __dirname,
          stdio: "inherit"
        });
        
        child.on("close", (code) => {
          resolve(code === 0);
        });
      });
      
      if (result) {
        passed++;
        console.log(`✅ ${testFile} - PASSED\n`);
      } else {
        failed++;
        console.log(`❌ ${testFile} - FAILED\n`);
      }
    }
    
    // Summary
    console.log("📊 SUMMARY");
    console.log("─".repeat(20));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🎯 Total: ${testFiles.length}`);
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runAllTests();
