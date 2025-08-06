import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm', to: 'wasm' },
        { from: 'node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs', to: 'wasm' },
      ],
    }),
  ],
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
    publicPath: '' // No public path needed for single file bundle
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
