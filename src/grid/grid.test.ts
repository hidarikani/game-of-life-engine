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

Deno.test("Grid.contains", async (t) => {
  await t.step("should return valid when grid contains a smaller grid", () => {
    const outer = new Grid({ x: 10, y: 10 });
    const inner = new Grid({ x: 5, y: 5 });
    assertEquals(outer.contains(inner), { valid: true });
  });

  await t.step("should return valid when grids are the same size", () => {
    const a = new Grid({ x: 5, y: 5 });
    const b = new Grid({ x: 5, y: 5 });
    assertEquals(a.contains(b), { valid: true });
  });

  await t.step("should return invalid when grid is larger", () => {
    const smaller = new Grid({ x: 5, y: 5 });
    const larger = new Grid({ x: 10, y: 10 });
    assertEquals(smaller.contains(larger), {
      valid: false,
      message:
        "Grid with bounds (10, 10) does not fit within (5, 5).",
    });
  });

  await t.step("should return invalid when only x exceeds bounds", () => {
    const outer = new Grid({ x: 5, y: 10 });
    const inner = new Grid({ x: 6, y: 10 });
    assertEquals(outer.contains(inner), {
      valid: false,
      message:
        "Grid with bounds (6, 10) does not fit within (5, 10).",
    });
  });

  await t.step("should return invalid when only y exceeds bounds", () => {
    const outer = new Grid({ x: 10, y: 5 });
    const inner = new Grid({ x: 10, y: 6 });
    assertEquals(outer.contains(inner), {
      valid: false,
      message:
        "Grid with bounds (10, 6) does not fit within (10, 5).",
    });
  });
});
