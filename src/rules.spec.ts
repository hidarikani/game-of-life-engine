import { describe, expect, it } from "vitest";
import { evolve } from "./rules";

describe("Game of Life rules", () => {
  it.each([0, 1])(
    "Live cell with %i live neighbors dies as if by under population",
    (count) => {
      const neighbors = { count };

      const actual = evolve(1, neighbors);
      expect(actual).toBe(0);
    },
  );

  it.each([2, 3])("Live cell with %i live neighbors survives", (count) => {
    const neighbors = { count };

    const actual = evolve(1, neighbors);
    expect(actual).toBe(1);
  });

  it.each([4, 5, 6, 7, 8])(
    "Live cell with %i live neighbors dies as if by overpopulation",
    (count) => {
      const neighbors = { count };

      const actual = evolve(1, neighbors);
      expect(actual).toBe(0);
    },
  );

  it("Dead cell with exactly 3 live neighbors becomes a live cell", () => {
    const neighbors = {
      count: 3,
    };

    const actual = evolve(0, neighbors);
    expect(actual).toBe(1);
  });

  it.each([0, 1, 2, 4, 5, 6, 7, 8])(
    "Dead cell with %i live neighbors stays dead",
    (count) => {
      const neighbors = { count };

      const actual = evolve(0, neighbors);
      expect(actual).toBe(0);
    },
  );

  it.each([-128, -1, 2, 256])(
    "Invalid target cell state %i to throw",
    (state) => {
      const neighbors = {
        count: 0,
      };

      expect(() => {
        evolve(state, neighbors);
      }).toThrow();
    },
  );

  it.each([-128, -1, 9, 256])("Invalid neighbor count %i to throw", (count) => {
    const neighbors = {
      count,
    };

    expect(() => {
      evolve(1, neighbors);
    }).toThrow();
  });
});
