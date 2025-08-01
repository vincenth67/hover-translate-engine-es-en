import fs from 'fs';
import path from 'path';

const distPath = path.resolve('./dist');

console.log('🧹 Cleaning dist directory...');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Dist directory cleaned');
} else {
  console.log('ℹ️  Dist directory does not exist, nothing to clean');
} 