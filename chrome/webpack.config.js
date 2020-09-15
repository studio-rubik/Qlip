const webpack = require('webpack');
const path = require('path');

const API_URL = {
  production: JSON.stringify('prod-url'),
  development: JSON.stringify('dev-url'),
};

// check environment mode
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  devtool: 'inline-source-map',
  mode: mode,
  watch: true,

  entry: {
    content: './src/app/content.tsx',
    background: './src/app/background.ts',
    popup: './src/ui/popup.tsx',
  },

  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name].js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      API_URL: API_URL[mode],
    }),
  ],
};
