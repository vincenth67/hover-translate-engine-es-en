
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('dist/hover-translate-engine.js');
const searchString = 's.wasm.wasmPaths=`https://cdn.jsdelivr.net/npm/@huggingface/transformers@${g.env.version}/dist/`';
const replaceString = 's.wasm.wasmPaths=\'wasm/\'';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const result = data.replace(searchString, replaceString);

  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('File updated successfully!');
    }
  });
});
