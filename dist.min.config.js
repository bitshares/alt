module.exports = {
  context: __dirname + '/src',
  entry: {
    'alt': ['./index.js'],
  },
  mode: "production",
  output: {
    path: __dirname + '/dist',
    filename: '[name].min.js',
    library: 'Alt',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }]
  },
};
