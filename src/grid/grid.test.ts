import { Grid } from "./grid.ts";
import { normalizeSeed, pointToCellKey } from "../seed/seed.ts";
import type { LiveCells, Point } from "../types.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { PLACEMENT_MODES } from "../constants.ts";

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

Deno.test("Grid.fromString valid params", async (t) => {
  const validSeed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;

  await t.step("should create a grid from a valid seed string", () => {
    const grid = Grid.fromString({ x: 4, y: 4 }, validSeed);
    assertEquals(grid.bottomRightCorner, { x: 4, y: 4 });
  });

  await t.step("should parse live cells correctly", () => {
    const grid = Grid.fromString({ x: 4, y: 4 }, validSeed);
    assertEquals(grid.toString(), normalizeSeed(validSeed));
  });

  await t.step("should parse dead cells correctly", () => {
    const grid = Grid.fromString({ x: 4, y: 4 }, validSeed);
    assertEquals(grid.liveCells.has(pointToCellKey({ x: 1, y: 0 })), false);
    assertEquals(grid.liveCells.has(pointToCellKey({ x: 2, y: 0 })), false);
    assertEquals(grid.liveCells.has(pointToCellKey({ x: 0, y: 1 })), false);
    assertEquals(grid.liveCells.has(pointToCellKey({ x: 3, y: 1 })), false);
  });

  await t.step(
    "should create a grid with no live cells from all-dead seed",
    () => {
      const deadSeed = `
    . . .
    . . .
    . . .
    `;
      const grid = Grid.fromString({ x: 3, y: 3 }, deadSeed);
      assertEquals(grid.liveCells.size, 0);
    },
  );

  await t.step(
    "should create a grid with all live cells from all-alive seed",
    () => {
      const aliveSeed = `
    # # #
    # # #
    # # #
    `;
      const grid = Grid.fromString({ x: 3, y: 3 }, aliveSeed);
      assertEquals(grid.liveCells.size, 9);
    },
  );
});

Deno.test("Grid.fromString invalid params", async (t) => {
  await t.step("should throw when seed contains invalid character `O`", () => {
    const invalidSeed = `
    # . . O
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => Grid.fromString({ x: 4, y: 4 }, invalidSeed),
      Error,
      "Seed contains invalid characters",
    );
  });

  await t.step("should throw when seed contains invalid character `,`", () => {
    const invalidSeed = `
    # . . ,
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => Grid.fromString({ x: 4, y: 4 }, invalidSeed),
      Error,
      "Seed contains invalid characters",
    );
  });

  await t.step("should throw when width is below minimum", () => {
    const seed = `
    # .
    . #
    . .
    `;
    assertThrows(
      () => Grid.fromString({ x: 2, y: 3 }, seed),
      Error,
      "Width must be at least 3",
    );
  });

  await t.step("should throw when height is below minimum", () => {
    const seed = `
    # . .
    . # .
    `;
    assertThrows(
      () => Grid.fromString({ x: 3, y: 2 }, seed),
      Error,
      "Height must be at least 3",
    );
  });

  await t.step("should throw when seed height does not match", () => {
    const seed = `
    # . . #
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => Grid.fromString({ x: 4, y: 5 }, seed),
      Error,
      "Seed height does not match specified height",
    );
  });

  await t.step("should throw when seed width does not match", () => {
    const seed = `
    # . . #
    . # # .
    . . . #
    # #   .
    `;
    assertThrows(
      () => Grid.fromString({ x: 4, y: 4 }, seed),
      Error,
      "Seed width does not match specified width",
    );
  });
});

Deno.test("Grid.toString", async (t) => {
  await t.step(
    "should return string representation of a grid with live and dead cells",
    () => {
      const seed = `
    # . . #
    . # # .
    . . . #
    # # . .
    `;
      const grid = Grid.fromString({ x: 4, y: 4 }, seed);
      assertEquals(grid.toString(), normalizeSeed(seed));
    },
  );

  await t.step("should roundtrip through fromString and toString", () => {
    const seed = `
    . # . # .
    # . # . #
    . # . # .
    `;
    const grid = Grid.fromString({ x: 5, y: 3 }, seed);
    const grid2 = Grid.fromString({ x: 5, y: 3 }, grid.toString());
    assertEquals(grid.toString(), grid2.toString());
  });
});

Deno.test("Grid.contains returns true", async (t) => {
  await t.step("should return valid when grid contains a smaller grid", () => {
    const outer = new Grid({ x: 10, y: 10 });
    const inner = new Grid({ x: 5, y: 5 });
    assertEquals(outer.contains({ inner: inner }), { valid: true });
  });

  await t.step("should return valid when grids are the same size", () => {
    const a = new Grid({ x: 5, y: 5 });
    const b = new Grid({ x: 5, y: 5 });
    assertEquals(a.contains({ inner: b }), { valid: true });
  });

  await t.step("should return valid when grid fits with offset", () => {
    const outer = new Grid({ x: 10, y: 10 });
    const inner = new Grid({ x: 5, y: 5 });
    assertEquals(outer.contains({ inner: inner, offset: { x: 3, y: 3 } }), {
      valid: true,
    });
  });

  await t.step(
    "should return valid when offset keeps grid exactly at bounds",
    () => {
      const outer = new Grid({ x: 10, y: 10 });
      const inner = new Grid({ x: 5, y: 5 });
      assertEquals(outer.contains({ inner: inner, offset: { x: 5, y: 5 } }), {
        valid: true,
      });
    },
  );
});

Deno.test("Grid.contains returns false", async (t) => {
  await t.step("should return invalid when grid is larger", () => {
    const smaller = new Grid({ x: 5, y: 5 });
    const larger = new Grid({ x: 10, y: 10 });
    assertEquals(smaller.contains({ inner: larger }), {
      valid: false,
      message: "Grid with bounds (10, 10) does not fit within (5, 5).",
    });
  });

  await t.step("should return invalid when only x exceeds bounds", () => {
    const outer = new Grid({ x: 5, y: 10 });
    const inner = new Grid({ x: 6, y: 10 });
    assertEquals(outer.contains({ inner: inner }), {
      valid: false,
      message: "Grid with bounds (6, 10) does not fit within (5, 10).",
    });
  });

  await t.step("should return invalid when only y exceeds bounds", () => {
    const outer = new Grid({ x: 10, y: 5 });
    const inner = new Grid({ x: 10, y: 6 });
    assertEquals(outer.contains({ inner: inner }), {
      valid: false,
      message: "Grid with bounds (10, 6) does not fit within (10, 5).",
    });
  });

  await t.step(
    "should return invalid when offset pushes grid out of bounds",
    () => {
      const outer = new Grid({ x: 10, y: 10 });
      const inner = new Grid({ x: 5, y: 5 });
      assertEquals(outer.contains({ inner: inner, offset: { x: 6, y: 6 } }), {
        valid: false,
        message: "Grid with bounds (11, 11) does not fit within (10, 10).",
      });
    },
  );
});

Deno.test("Grid.place throws", async (t) => {
  await t.step("should throw when inner grid does not fit", () => {
    const outer = new Grid({ x: 5, y: 5 });
    const inner = new Grid({ x: 6, y: 6 });
    assertThrows(
      () => outer.place({ inner }),
      Error,
      "Grid with bounds (6, 6) does not fit within (5, 5).",
    );
  });

  await t.step(
    "should throw when offset pushes inner grid out of bounds",
    () => {
      const outer = new Grid({ x: 10, y: 10 });
      const inner = new Grid({ x: 5, y: 5 });
      assertThrows(
        () => outer.place({ inner, offset: { x: 6, y: 6 } }),
        Error,
        "Grid with bounds (11, 11) does not fit within (10, 10).",
      );
    },
  );
});

Deno.test("Grid.place with Overwrite mode", async (t) => {
  await t.step(
    "should clear existing cells in the target region before placing",
    () => {
      const outer = Grid.fromString(
        { x: 5, y: 5 },
        `
        # . . . .
        . # . . .
        . . . . .
        . . . . .
        . . . . #
      `,
      );

      const innerCells: LiveCells = new Map();
      innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
      const inner = new Grid({ x: 2, y: 2 }, innerCells);

      outer.place({ inner });

      assertEquals(
        outer.toString(),
        normalizeSeed(`
          . # . . .
          . . . . .
          . . . . .
          . . . . .
          . . . . #
        `),
      );
    },
  );
  await t.step(
    "should overwrite with offset",
    () => {
      const outer = Grid.fromString(
        { x: 10, y: 10 },
        `
        # . . . . . . . . .
        . . . . . . . . . .
        . . . . . . . . . .
        . . . . . . . . . .
        . . . . . . . . . .
        . . . . . # . . . .
        . . . . . . # . . .
        . . . . . . . . . .
        . . . . . . . . . .
        . . . . . . . . . #
      `,
      );

      const innerCells: LiveCells = new Map();
      innerCells.set(pointToCellKey({ x: 0, y: 0 }), true);
      innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
      const inner = new Grid({ x: 2, y: 2 }, innerCells);

      outer.place({ inner, offset: { x: 5, y: 5 } });

      assertEquals(
        outer.toString(),
        normalizeSeed(`
          # . . . . . . . . .
          . . . . . . . . . .
          . . . . . . . . . .
          . . . . . . . . . .
          . . . . . . . . . .
          . . . . . # # . . .
          . . . . . . . . . .
          . . . . . . . . . .
          . . . . . . . . . .
          . . . . . . . . . #
        `),
      );
    },
  );
});

Deno.test("Grid.place with Merge mode", async (t) => {
  await t.step("should preserve existing cells in the target region", () => {
    const outer = Grid.fromString(
      { x: 5, y: 5 },
      `
      . . . . .
      . . # . .
      . . # . .
      . . # . .
      . . . . .
    `,
    );

    const innerCells: LiveCells = new Map();
    innerCells.set(pointToCellKey({ x: 2, y: 0 }), true);
    const inner = Grid.fromString(
      { x: 5, y: 5 },
      `
      . . . . .
      . . . . .
      . # # # .
      . . . . .
      . . . . .
    `,
    );

    outer.place({ inner, mode: PLACEMENT_MODES.MERGE });

    assertEquals(
      outer.toString(),
      normalizeSeed(`
        . . . . .
        . . # . .
        . # # # .
        . . # . .
        . . . . .
      `),
    );
  });

  await t.step("should merge with offset", () => {
    const outer = Grid.fromString(
      { x: 5, y: 5 },
      `
      . . . . .
      . . # . .
      . . # . .
      . . # . .
      . . . . .
    `,
    );

    const inner = Grid.fromString(
      { x: 3, y: 3 },
      `
      . . .
      # # #
      . . .
    `,
    );

    outer.place({ inner, offset: { x: 1, y: 1 }, mode: PLACEMENT_MODES.MERGE });

    assertEquals(
      outer.toString(),
      normalizeSeed(`
        . . . . .
        . . # . .
        . # # # .
        . . # . .
        . . . . .
      `),
    );
  });
});
