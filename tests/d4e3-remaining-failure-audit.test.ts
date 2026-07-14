import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const matrix = JSON.parse(readFileSync('qa-reports/legacy-migration-change-control/phase-d4e3-failure-matrix.json', 'utf8')) as {
  failures: Array<{ id: string; file: string; test: string; error: string; category: string }>;
};
const inventory = JSON.parse(readFileSync('qa-reports/legacy-migration-change-control/phase-d4e3-remaining-work-inventory.json', 'utf8')) as {
  baseline: { failedTests: number; passedTests: number; failedFiles: number };
};

describe('D4E3 remaining failure audit', () => {
  it('accounts for exactly the captured current failures once', () => {
    expect(matrix.failures).toHaveLength(43);
    expect(new Set(matrix.failures.map((failure) => failure.id)).size).toBe(43);
    expect(new Set(matrix.failures.map((failure) => `${failure.file}\u0000${failure.test}`)).size).toBe(43);
    expect(inventory.baseline.failedTests).toBe(43);
    expect(inventory.baseline.passedTests).toBe(1790);
    expect(inventory.baseline.failedFiles).toBe(14);
    for (const failure of matrix.failures) {
      expect(failure.file).toMatch(/^tests\/.+\.test\.ts$/);
      expect(failure.test.length).toBeGreaterThan(0);
      expect(failure.error.length).toBeGreaterThan(0);
      expect(failure.category.length).toBeGreaterThan(0);
    }
  });
});
