module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
          {
            loader: 'url-loader',
            options: { limit: 25000 },
          }
        ]
      }
    ]
  }
};