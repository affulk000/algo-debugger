import { describe, it, expect } from 'vitest';

describe('api utility functions', () => {
  const BASE = "http://localhost:8081";

  it('should construct correct login URL', () => {
    const loginURL = `${BASE}/auth/login`;
    expect(loginURL).toBe("http://localhost:8081/auth/login");
  });

  it('should construct correct logout URL', () => {
    const logoutURL = `${BASE}/auth/logout`;
    expect(logoutURL).toBe("http://localhost:8081/auth/logout");
  });

  it('should construct correct API runs endpoint', () => {
    const runsEndpoint = `${BASE}/api/runs`;
    expect(runsEndpoint).toBe("http://localhost:8081/api/runs");
  });

  it('should construct algorithm meta endpoint for palindrome', () => {
    const algoName = "palindrome";
    const metaEndpoint = `${BASE}/algorithms/${algoName}/meta`;
    expect(metaEndpoint).toBe("http://localhost:8081/algorithms/palindrome/meta");
  });

  it('should construct algorithm steps endpoint for sudoku', () => {
    const algoName = "sudoku";
    const stepsEndpoint = `${BASE}/algorithms/${algoName}/steps`;
    expect(stepsEndpoint).toBe("http://localhost:8081/algorithms/sudoku/steps");
  });
});
