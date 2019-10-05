module.exports = {
  moduleNameMapper: {
    '^~(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    DEBUG: true,
  },
  preset: 'ts-jest',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
