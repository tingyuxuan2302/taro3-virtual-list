
const path = require('path')

console.log('-----env', process.env.PARTNER)
const config = {
  projectName: 'ztrip-mini-components',
  date: '2021-01-29',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  babel: {
    sourceMap: true,
    presets: [
      [
        'env',
        {
          modules: false,
        },
      ],
    ],
    plugins: [
      'transform-class-properties',
      'transform-decorators-legacy',
      'transform-object-rest-spread',
      [
        "transform-runtime",
        {
          helpers: false,
          polyfill: false,
          regenerator: true,
          moduleName: "babel-runtime",
        },
      ],
    ],
  },
  defineConstants: {
  },
  alias: {
    '@/types': path.resolve(__dirname, '..', '@types'),
    '@/constant': path.resolve(__dirname, '..', 'src/constant'),
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/style': path.resolve(__dirname, '..', 'src/style'),
    '@/common': path.resolve(__dirname, '..', 'src/common'),
  },
  copy: {
    patterns: [
    ],
    options: {
    },
  },
  mini: {
    postcss: {
      autoprefixer: {
        enable: true,
      },
      url: {
        enable: true,
        config: {
          limit: 10240,
        },
      },
    },
    // compile: {
    //   include: [
    //     path.resolve(__dirname, '..', 'src'),
    //     path.resolve(__dirname, '..', 'src/utils'),
    //   ],
    // },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
        },
      },
    },
  },
}

if (process.env.TARO_BUILD_TYPE === 'ui') {
  Object.assign(config.h5, {
    enableSourceMap: false,
    enableExtract: false,
    enableDll: false,
  })
  config.h5.webpackChain = chain => {
    chain.plugins.delete('htmlWebpackPlugin')
    chain.plugins.delete('addAssetHtmlWebpackPlugin')
    chain.merge({
      output: {
        path: path.join(process.cwd(), 'dist', 'h5'),
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'ztrip-mini-components',
      },
      externals: {
        nervjs: 'commonjs2 nervjs',
        classnames: 'commonjs2 classnames',
        '@tarojs/components': 'commonjs2 @tarojs/components',
        '@tarojs/taro-h5': 'commonjs2 @tarojs/taro-h5',
        'weui': 'commonjs2 weui',
      },
    })
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
