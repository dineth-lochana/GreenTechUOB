module.exports = {
    // The root directory where your test files are located
    roots: ['<rootDir>/src'],
    
    // File extensions to look for
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    
    // Setup files
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.js',
      '@testing-library/jest-dom/extend-expect'
    ],
    
    // Module name mapper for CSS imports and other non-JS files
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/__mocks__/fileMock.js'
    },
    
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test paths to run
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    
    // Transform files with Babel
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    
    // Code coverage configuration
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/**/*.d.ts',
      '!src/index.js',
      '!src/serviceWorker.js'
    ],
    
    // Other options
    verbose: true,
    testTimeout: 30000,
    clearMocks: true
  };