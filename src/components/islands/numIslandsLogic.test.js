import { describe, it, expect } from 'vitest';

describe('Number of Islands algorithm logic', () => {
  // Core DFS-based island counting algorithm
  const numIslands = (grid) => {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    let count = 0;

    const dfs = (r, c) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (grid[r][c] === '0' || visited[r][c]) return;
      
      visited[r][c] = true;
      dfs(r - 1, c);
      dfs(r + 1, c);
      dfs(r, c - 1);
      dfs(r, c + 1);
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1' && !visited[r][c]) {
          count++;
          dfs(r, c);
        }
      }
    }

    return count;
  };

  it('should count single island', () => {
    const grid = [
      ['1', '1', '1'],
      ['0', '0', '0'],
      ['0', '0', '0']
    ];
    expect(numIslands(grid)).toBe(1);
  });

  it('should count multiple islands', () => {
    const grid = [
      ['1', '0', '1'],
      ['0', '0', '0'],
      ['1', '0', '1']
    ];
    expect(numIslands(grid)).toBe(4);
  });

  it('should handle all water', () => {
    const grid = [
      ['0', '0', '0'],
      ['0', '0', '0']
    ];
    expect(numIslands(grid)).toBe(0);
  });

  it('should handle all land', () => {
    const grid = [
      ['1', '1'],
      ['1', '1']
    ];
    expect(numIslands(grid)).toBe(1);
  });

  it('should handle empty grid', () => {
    expect(numIslands([])).toBe(0);
  });

  it('should handle diagonal separation (not connected)', () => {
    const grid = [
      ['1', '0'],
      ['0', '1']
    ];
    expect(numIslands(grid)).toBe(2);
  });

  it('should handle complex island shape', () => {
    const grid = [
      ['1', '1', '0', '0', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '1', '1']
    ];
    expect(numIslands(grid)).toBe(3);
  });
});
