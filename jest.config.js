const { jsWithTs: tsjPreset } = require('ts-jest/presets')

module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'jsx', 'json'],
  rootDir: __dirname,
  testMatch: ['<rootDir>/test/**/*.test.js', '<rootDir>/test/**/test.js'],
  transform: {
    ...tsjPreset.transform
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    weui: '<rootDir>/test/__mock__/styleMock.js',
    '\\.(css|less|sass|scss)$': '<rootDir>/test/__mock__/styleMock.js'
  }
}
