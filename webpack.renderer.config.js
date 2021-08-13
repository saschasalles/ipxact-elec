const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const assets = ['assets'];

const copyPlugins = assets.map((asset) => {
  return new CopyWebpackPlugin({
    patterns: [{ from: path.resolve(__dirname, 'src', asset), to: asset }],
  });
});

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [require('tailwindcss'), require('autoprefixer')],
        },
      },
    },
  ],
});

module.exports = {
  module: {
    rules,
  },
  plugins: [...plugins, ...copyPlugins],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: { 'react-dom': '@hot-loader/react-dom' },
  },
};
