import { describe, it, expect } from 'vitest';

describe('CustomInput validation logic', () => {
  const validateInput = (val) => {
    if (val.length === 0) return "Please enter a string.";
    if (val.length > 60) return "Max 60 characters for readability.";
    return "";
  };

  it('should return error for empty string', () => {
    expect(validateInput("")).toBe("Please enter a string.");
  });

  it('should return error for string longer than 60 characters', () => {
    const longString = "a".repeat(61);
    expect(validateInput(longString)).toBe("Max 60 characters for readability.");
  });

  it('should return empty string for valid input', () => {
    expect(validateInput("hello")).toBe("");
  });

  it('should accept string with exactly 60 characters', () => {
    const exactString = "a".repeat(60);
    expect(validateInput(exactString)).toBe("");
  });
});
