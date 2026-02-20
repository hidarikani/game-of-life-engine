import { Grid } from "./grid.ts";
import { pointToCellKey } from "../seed/seed.ts";
import type { LiveCells, Point } from "../types.ts";
import { assertEquals, assertThrows } from "@std/assert";

Deno.test("Valid constructor params", async (t) => {
  await t.step("should instantiate dead Grid", () => {
    const bottomRightCorner: Point = { x: 10, y: 10 };
    const grid = new Grid(bottomRightCorner);
    assertEquals(grid instanceof Grid, true);
  });

  await t.step("should accept valid liveCells within bounds", () => {
    const bottomRightCorner: Point = { x: 5, y: 5 };
    const liveCells: LiveCells = new Map();

    // Add cells within bounds
    liveCells.set(pointToCellKey({ x: 0, y: 0 }), true);
    liveCells.set(pointToCellKey({ x: 5, y: 5 }), true);
    liveCells.set(pointToCellKey({ x: 2, y: 3 }), true);

    const grid = new Grid(bottomRightCorner, liveCells);
    assertEquals(grid instanceof Grid, true);
  });
});

Deno.test("Invalid constructor params", async (t) => {
  await t.step("should throw when cell x coordinate is out of bounds", () => {
    const bottomRightCorner: Point = { x: 5, y: 5 };
    const liveCells: LiveCells = new Map();

    // Add a cell that's out of bounds (x too large)
    liveCells.set(pointToCellKey({ x: 6, y: 3 }), true);

    assertThrows(
      () => new Grid(bottomRightCorner, liveCells),
      Error,
      "Cell at (6, 3) is out of bounds. Grid bounds are (0, 0) to (5, 5).",
    );
  });

  await t.step(
    "should throw when cell y coordinate is out of bounds",
    () => {
      const bottomRightCorner: Point = { x: 5, y: 5 };
      const liveCells: LiveCells = new Map();

      // Add a cell that's out of bounds (y too large)
      liveCells.set(pointToCellKey({ x: 3, y: 6 }), true);

      assertThrows(
        () => new Grid(bottomRightCorner, liveCells),
        Error,
        "Cell at (3, 6) is out of bounds. Grid bounds are (0, 0) to (5, 5).",
      );
    },
  );

  await t.step("should throw when cell has negative x", () => {
    const bottomRightCorner: Point = { x: 5, y: 5 };
    const liveCells: LiveCells = new Map();

    // Add a cell with negative x
    liveCells.set(pointToCellKey({ x: -1, y: 3 }), true);

    assertThrows(
      () => new Grid(bottomRightCorner, liveCells),
      Error,
      "Cell at (-1, 3) is out of bounds. Grid bounds are (0, 0) to (5, 5).",
    );
  });

  await t.step("should throw when cell has negative y", () => {
    const bottomRightCorner: Point = { x: 5, y: 5 };
    const liveCells: LiveCells = new Map();

    // Add a cell with negative x
    liveCells.set(pointToCellKey({ x: 3, y: -1 }), true);

    assertThrows(
      () => new Grid(bottomRightCorner, liveCells),
      Error,
      "Cell at (3, -1) is out of bounds. Grid bounds are (0, 0) to (5, 5).",
    );
  });
});
