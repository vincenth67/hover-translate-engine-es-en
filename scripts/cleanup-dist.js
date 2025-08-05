import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');

fs.readdir(distDir, (err, files) => {
  if (err) {
    // If the dist directory doesn't exist, there's nothing to clean up.
    if (err.code === 'ENOENT') {
      return;
    }
    console.error('Error reading dist directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.mjs') || file.endsWith('.mjs.LICENSE.txt')) {
      fs.unlink(path.join(distDir, file), err => {
        if (err) {
          console.error(`Error deleting ${file}:`, err);
        } else {
          console.log(`Deleted ${file}`);
        }
      });
    }
  });
});
