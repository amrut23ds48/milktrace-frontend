import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically cleanup React components after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
