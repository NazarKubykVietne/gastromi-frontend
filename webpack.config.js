const path = require('path')

const isDev = process.env.NODE_ENV || 'development'

const config = {
  mode: isDev ? 'development' : 'production',

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      assets: path.resolve(__dirname, './assets'),
    },
    fallback: {
      util: require.resolve('util/'),
    },
  },

  entry: [
    // babel-polyfill лучше заменить позже, но оставим как есть, чтобы ничего не сломать
    'babel-polyfill',
    path.resolve(__dirname, './src/index.js'),
  ],

  output: {
    path: path.join(__dirname, './build'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },

  devtool: isDev ? 'eval-source-map' : 'source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: [
              isDev && [
                require.resolve('react-refresh/babel'),
                { skipEnvCheck: true },
              ],
            ].filter(Boolean),
          },
        },
      },
    ],
  },

  plugins: [
    isDev && new (require('@pmmmwh/react-refresh-webpack-plugin'))(),
  ].filter(Boolean),

  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    historyApiFallback: true,
    port: 8081,
    hot: true,

    proxy: [
      {
        context: ['/api'],
        target: 'http://127.0.0.1:3003',
        changeOrigin: true,
      },
    ],
  },
}

module.exports = config
