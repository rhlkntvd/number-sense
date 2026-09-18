import { describe, expect, test } from "vitest";

import type { Configuration } from "./configuration";
import { generateProblem } from "./problem";

function createCountConfiguration(
  operations: Configuration["operations"],
): Configuration {
  return {
    operations,
    drillMode: {
      type: "count",
      count: 25,
    },
  };
}

describe("generateProblem", () => {
  describe("individual operations", () => {
    test("generates a correct addition problem", () => {
      const configuration = createCountConfiguration({
        additive: {
          addition: true,
          subtraction: false,
          left: {
            min: 4,
            max: 4,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: 4,
        right: 7,
        operation: "addition",
        answer: 11,
      });
    });

    test("generates subtraction by reversing addition", () => {
      const configuration = createCountConfiguration({
        additive: {
          addition: false,
          subtraction: true,
          left: {
            min: 4,
            max: 4,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: 11,
        right: 4,
        operation: "subtraction",
        answer: 7,
      });
    });

    test("generates a correct multiplication problem", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: true,
          division: false,
          left: {
            min: 4,
            max: 4,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: 4,
        right: 7,
        operation: "multiplication",
        answer: 28,
      });
    });

    test("generates division by reversing multiplication", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: 4,
            max: 4,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: 28,
        right: 4,
        operation: "division",
        answer: 7,
      });
    });
  });

  describe("negative numbers", () => {
    test("generates multiplication with negative operands", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: true,
          division: false,
          left: {
            min: -4,
            max: -4,
          },
          right: {
            min: -7,
            max: -7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: -4,
        right: -7,
        operation: "multiplication",
        answer: 28,
      });
    });

    test("generates division with negative factors", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: -4,
            max: -4,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: -28,
        right: -4,
        operation: "division",
        answer: 7,
      });
    });
  });

  describe("division edge cases", () => {
    test("generates division when one factor is zero and the other is nonzero", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: 0,
            max: 0,
          },
          right: {
            min: 7,
            max: 7,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toEqual({
        left: 0,
        right: 7,
        operation: "division",
        answer: 0,
      });
    });

    test("returns null when division cannot generate a valid problem", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: 0,
            max: 0,
          },
          right: {
            min: 0,
            max: 0,
          },
        },
      });

      const problem = generateProblem(configuration);

      expect(problem).toBeNull();
    });

    test("never generates division by zero", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: -5,
            max: 5,
          },
          right: {
            min: -5,
            max: 5,
          },
        },
      });

      for (let i = 0; i < 100; i += 1) {
        const problem = generateProblem(configuration);

        expect(problem).not.toBeNull();

        if (!problem) {
          continue;
        }

        expect(problem.operation).toBe("division");
        expect(problem.right).not.toBe(0);
        expect(problem.left / problem.right).toBe(problem.answer);
      }
    });
  });

  describe("randomized generation", () => {
    test("generates mathematically correct addition problems within the configured ranges", () => {
      const configuration = createCountConfiguration({
        additive: {
          addition: true,
          subtraction: false,
          left: {
            min: -10,
            max: 10,
          },
          right: {
            min: -20,
            max: 20,
          },
        },
      });

      for (let i = 0; i < 100; i += 1) {
        const problem = generateProblem(configuration);

        expect(problem).not.toBeNull();

        if (!problem) {
          continue;
        }

        expect(problem.operation).toBe("addition");

        expect(problem.left).toBeGreaterThanOrEqual(-10);
        expect(problem.left).toBeLessThanOrEqual(10);

        expect(problem.right).toBeGreaterThanOrEqual(-20);
        expect(problem.right).toBeLessThanOrEqual(20);

        expect(problem.answer).toBe(problem.left + problem.right);
      }
    });

    test("generates mathematically correct multiplication problems within the configured ranges", () => {
      const configuration = createCountConfiguration({
        multiplicative: {
          multiplication: true,
          division: false,
          left: {
            min: -5,
            max: 5,
          },
          right: {
            min: -8,
            max: 8,
          },
        },
      });

      for (let i = 0; i < 100; i += 1) {
        const problem = generateProblem(configuration);

        expect(problem).not.toBeNull();

        if (!problem) {
          continue;
        }

        expect(problem.operation).toBe("multiplication");

        expect(problem.answer).toBe(problem.left * problem.right);
      }
    });

    test("only generates enabled operations", () => {
      const configuration = createCountConfiguration({
        additive: {
          addition: true,
          subtraction: false,
          left: {
            min: -10,
            max: 10,
          },
          right: {
            min: -10,
            max: 10,
          },
        },
        multiplicative: {
          multiplication: false,
          division: true,
          left: {
            min: -5,
            max: 5,
          },
          right: {
            min: 1,
            max: 5,
          },
        },
      });

      for (let i = 0; i < 100; i += 1) {
        const problem = generateProblem(configuration);

        expect(problem).not.toBeNull();

        if (!problem) {
          continue;
        }

        expect(["addition", "division"]).toContain(problem.operation);
      }
    });
  });
});
