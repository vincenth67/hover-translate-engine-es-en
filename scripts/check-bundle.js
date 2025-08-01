import fs from 'fs';
import path from 'path';

const bundlePath = path.resolve('./dist/hover-translate-engine.js');
const srcPath = path.resolve('./src/engine.js');

console.log('🔍 Checking webpack bundle health...');

// Check if bundle exists
if (!fs.existsSync(bundlePath)) {
  console.error('❌ Bundle not found! Run: npm run build');
  process.exit(1);
}

// Check if bundle is newer than source
const bundleTime = fs.statSync(bundlePath).mtime;
const srcTime = fs.statSync(srcPath).mtime;

if (srcTime > bundleTime) {
  console.error('❌ Bundle is stale! Run: npm run build');
  process.exit(1);
}

// Check bundle size
const bundleSize = fs.statSync(bundlePath).size;
const expectedMin = 40 * 1024 * 1024; // 40MB minimum
const expectedMax = 70 * 1024 * 1024; // 70MB maximum

if (bundleSize < expectedMin || bundleSize > expectedMax) {
  console.warn(`⚠️  Bundle size unusual: ${Math.round(bundleSize / 1024 / 1024)}MB`);
} else {
  console.log(`✅ Bundle size healthy: ${Math.round(bundleSize / 1024 / 1024)}MB`);
}

console.log('✅ Bundle validation passed'); 