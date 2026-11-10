// Environment polyfill for Node-based SSR testing of client components
if (typeof global.window === 'undefined') {
  const mockWindow = {
    self: {},
    top: {},
    location: { href: 'http://localhost/' },
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
      length: 0,
    },
    navigator: { onLine: true },
  };
  global.window = mockWindow;
  global.self = mockWindow.self;
  global.top = mockWindow.top;
  if (!global.localStorage) {
    global.localStorage = mockWindow.localStorage;
  }
}
