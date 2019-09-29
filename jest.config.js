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
};
