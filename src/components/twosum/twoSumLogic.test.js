import { describe, it, expect } from 'vitest';

describe('TwoSum algorithm logic', () => {
  // Simulates the core TwoSum logic: find two indices that sum to target
  const twoSum = (nums, target) => {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
      const needed = target - nums[i];
      if (seen.has(needed)) {
        return [seen.get(needed), i];
      }
      seen.set(nums[i], i);
    }
    return null;
  };

  it('should find indices for basic case', () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });

  it('should handle negative numbers', () => {
    expect(twoSum([-1, -2, -3, -4, -5], -8)).toEqual([2, 4]);
  });

  it('should return null when no solution exists', () => {
    expect(twoSum([1, 2, 3], 7)).toBeNull();
  });

  it('should handle duplicate values', () => {
    expect(twoSum([3, 3], 6)).toEqual([0, 1]);
  });

  it('should work with single pair in middle of array', () => {
    // 5 + 3 = 8, not 10. Actually 3 + 7 = 10 at indices [2, 3]
    expect(twoSum([1, 5, 3, 7, 9], 10)).toEqual([2, 3]);
  });

  it('should handle empty array', () => {
    expect(twoSum([], 5)).toBeNull();
  });

  it('should handle array with one element', () => {
    expect(twoSum([5], 5)).toBeNull();
  });
});
