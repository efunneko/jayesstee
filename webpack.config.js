module.exports = {
  entry: './src/jayesstee.js',
  module: {
    //rules: [
    //  {
    //    test: /\.(js)$/,
    //    exclude: /node_modules/,
    //    use: ['babel-loader']
    //  }
    //]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  output: {
    path: __dirname + '/dist',
    filename: 'jayesstee.js',
    library: 'jst'
  }
};
