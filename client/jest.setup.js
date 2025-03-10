import '@testing-library/jest-dom/extend-expect';


// Mock window methods not available in Jest environment
window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };
  
  // Silence console errors during tests
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: React.createFactory') ||
      args[0].includes('Warning: unstable_flushDiscreteUpdates') ||
      args[0].includes('Warning: The current testing environment is not configured to support act')
    ) {
      return;
    }
    originalError(...args);
  };