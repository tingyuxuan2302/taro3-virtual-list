module.exports = {
  presets: [
    [
      'taro',
      {
        spec: true,
        useBuiltIns: false,
        framework: 'react',
        ts: true,
      },
    ],
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", {
      "legacy": true,
    }],
    ["@babel/plugin-proposal-class-properties", {
      "loose": true,
    }],
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-modules-commonjs",
  ],
}
