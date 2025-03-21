import '@testing-library/jest-dom';

declare global {
  namespace NodeJS {
    interface Global {
      ResizeObserver: any;
    }
  }
  
  var jest: any;
  var global: any;
}

export {}; 