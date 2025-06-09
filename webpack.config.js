/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');

// Define multiple entry points
const entries = {
  extension: './src/extension.ts',
  'test/runTest': './src/test/runTest.ts',
  'test/suite/index': './src/test/suite/index.ts',
  'test/suite/extension.test': './src/test/suite/extension.test.ts',
  'test/suite/localModelService.test': './src/test/suite/localModelService.test.ts',
  'test/suite/ollamaService.test': './src/test/suite/ollamaService.test.ts',
};

module.exports = {
  target: 'node',
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode',
    mocha: 'commonjs mocha',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
};
