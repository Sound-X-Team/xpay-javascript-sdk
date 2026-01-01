// Global test setup
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// Mock crypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: jest.fn(),
      sign: jest.fn(),
    },
  },
});

// Mock TextEncoder for Node.js environment
Object.defineProperty(global, 'TextEncoder', {
  value: class TextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  },
});

// Simple test to make this file valid
describe('Test Setup', () => {
  test('should setup global mocks', () => {
    expect(global.fetch).toBeDefined();
    expect(global.crypto).toBeDefined();
    expect(global.TextEncoder).toBeDefined();
  });
});
