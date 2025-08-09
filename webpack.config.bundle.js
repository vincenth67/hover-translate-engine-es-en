import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './src/engine.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hover-translate-engine.allinone.js',
    library: 'HoverTranslateEngine',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
    publicPath: ''
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
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
        test: /\.(wasm|mjs)$/,
        type: 'asset/source' // Inline as string
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: false,
  }
};