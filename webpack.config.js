import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './src/engine.js',
  target: 'web', // Target web environment for browser compatibility
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hover-translate-engine.js',
    library: 'HoverTranslateEngine',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
    publicPath: '', // No public path needed for single file bundle
    clean: true // Clean dist directory before each build
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      // Transformers.js browser compatibility fallbacks
      "path": false,
      "fs": false,
      "os": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.wasm$/,
        type: 'asset/inline'
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: false,
  }
};
