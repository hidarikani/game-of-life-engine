import { Grid } from "./grid.ts";
import { normalizeSeed, pointToCellKey } from "../seed/seed.ts";
import type { GridSize, LiveCells, Point } from "../types.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { PLACEMENT_MODES } from "../constants.ts";

Deno.test("Grid.constructor", async (t) => {
  await t.step("Valid constructor params", async (t) => {
    await t.step("should instantiate dead Grid", () => {
      const gridSize: GridSize = { w: 10, h: 10 };
      const grid = new Grid({ gridSize });
      assertEquals(grid instanceof Grid, true);
    });

    await t.step("should accept valid liveCells within bounds", () => {
      const gridSize: GridSize = { w: 5, h: 5 };
      const liveCells: LiveCells = new Map();

      // Add cells within bounds
      liveCells.set(pointToCellKey({ x: 0, y: 0 }), true);
      liveCells.set(pointToCellKey({ x: 4, y: 4 }), true);
      liveCells.set(pointToCellKey({ x: 2, y: 3 }), true);

      const grid = new Grid({ gridSize, liveCells });
      assertEquals(grid instanceof Grid, true);
    });
  });

  await t.step("Invalid constructor params", async (t) => {
    await t.step("should throw when width is below minimum", () => {
      const gridSize: GridSize = { w: 2, h: 3 };
      assertThrows(
        () => new Grid({ gridSize }),
        Error,
        "Grid must be at least 3 cells wide and 3 cells tall",
      );
    });
    await t.step("should throw when height is below minimum", () => {
      const gridSize: GridSize = { w: 3, h: 2 };
      assertThrows(
        () => new Grid({ gridSize }),
        Error,
        "Grid must be at least 3 cells wide and 3 cells tall",
      );
    });

    await t.step(
      "should throw when cell y coordinate is out of bounds",
      () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const liveCells: LiveCells = new Map();
        liveCells.set(pointToCellKey({ x: 3, y: 5 }), true);

        assertThrows(
          () => new Grid({ gridSize, liveCells }),
          Error,
          "Cell at (3, 5) is outside the grid of size (5, 5).",
        );
      },
    );
  });
});

Deno.test("Grid.fromString", async (t) => {
  await t.step("Valid params", async (t) => {
    const validSeed = `
      # . . #
      . # # .
      . . . #
      # # . .
  `;

    await t.step("should create a grid from a valid seed string", () => {
      const gridSize: GridSize = { w: 4, h: 4 };
      const grid = Grid.fromString(gridSize, validSeed);
      assertEquals(grid.gridSize, gridSize);
    });

    await t.step("should parse cells correctly", () => {
      const gridSize: GridSize = { w: 4, h: 4 };
      const grid = Grid.fromString(gridSize, validSeed);
      assertEquals(grid.toString(), normalizeSeed(validSeed));
    });

    await t.step(
      "should create a grid with no live cells from all-dead seed",
      () => {
        const deadSeed = `
          . . .
          . . .
          . . .
    `;
        const gridSize: GridSize = { w: 3, h: 3 };
        const grid = Grid.fromString(gridSize, deadSeed);
        assertEquals(grid.population(), 0);
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
        const gridSize: GridSize = { w: 3, h: 3 };
        const grid = Grid.fromString(gridSize, aliveSeed);
        assertEquals(grid.population(), 9);
      },
    );
  });
  await t.step("Invalid params", async (t) => {
    await t.step(
      "should throw when seed contains invalid character `O`",
      () => {
        const gridSize = { w: 4, h: 4 };
        const invalidSeed = `
          # . . O
          . # # .
          . . . #
          # # . .
    `;
        assertThrows(
          () => Grid.fromString(gridSize, invalidSeed),
          Error,
          "Seed contains invalid characters",
        );
      },
    );

    await t.step(
      "should throw when seed contains invalid character `,`",
      () => {
        const gridSize = { w: 4, h: 4 };
        const invalidSeed = `
          # . . ,
          . # # .
          . . . #
          # # . .
    `;
        assertThrows(
          () => Grid.fromString(gridSize, invalidSeed),
          Error,
          "Seed contains invalid characters",
        );
      },
    );

    await t.step("should throw when width is below minimum", () => {
      const gridSize = { w: 2, h: 3 };
      const seed = `
        # .
        . #
        . .
    `;
      assertThrows(
        () => Grid.fromString(gridSize, seed),
        Error,
        "Grid must be at least 3 cells wide and 3 cells tall",
      );
    });

    await t.step("should throw when height is below minimum", () => {
      const gridSize = { w: 3, h: 2 };
      const seed = `
        # . .
        . # .
    `;
      assertThrows(
        () => Grid.fromString(gridSize, seed),
        Error,
        "Grid must be at least 3 cells wide and 3 cells tall",
      );
    });

    await t.step("should throw when seed height does not match", () => {
      const gridSize = { w: 4, h: 4 };
      const seed = `
        # . . #
        . # # .
        . . . #
    `; //missing row
      assertThrows(
        () => Grid.fromString(gridSize, seed),
        Error,
        "Seed height does not match specified height",
      );
    });

    await t.step("should throw when seed width does not match", () => {
      const gridSize = { w: 4, h: 4 };
      const seed = `
        # . . #
        . # # .
        . . . #
        # #   .
    `; // last row missing `.`
      assertThrows(
        () => Grid.fromString(gridSize, seed),
        Error,
        "Seed width does not match specified width",
      );
    });
  });
});

Deno.test("Grid.toString", async (t) => {
  await t.step(
    "should return string representation of a grid with live and dead cells",
    () => {
      const gridSize = { w: 4, h: 4 };
      const seed = `
        # . . #
        . # # .
        . . . #
        # # . .
    `;
      const grid = Grid.fromString(gridSize, seed);
      assertEquals(grid.toString(), normalizeSeed(seed));
    },
  );

  await t.step("should roundtrip through fromString and toString", () => {
    const gridSize = { w: 5, h: 3 };
    const seed = `
      . # . # .
      # . # . #
      . # . # .
    `;
    const grid = Grid.fromString(gridSize, seed);
    const grid2 = Grid.fromString(gridSize, grid.toString());
    assertEquals(grid.toString(), grid2.toString());
  });
});

// Deno.test("Grid.contains returns true", async (t) => {
//   await t.step("should return valid when grid contains a smaller grid", () => {
//     const outer = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//     const inner = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     assertEquals(outer.contains({ inner: inner }), { valid: true });
//   });

//   await t.step("should return valid when grids are the same size", () => {
//     const a = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     const b = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     assertEquals(a.contains({ inner: b }), { valid: true });
//   });

//   await t.step("should return valid when grid fits with offset", () => {
//     const outer = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//     const inner = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     assertEquals(outer.contains({ inner: inner, offset: { x: 3, y: 3 } }), {
//       valid: true,
//     });
//   });

//   await t.step(
//     "should return valid when offset keeps grid exactly at bounds",
//     () => {
//       const outer = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//       const inner = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//       assertEquals(outer.contains({ inner: inner, offset: { x: 5, y: 5 } }), {
//         valid: true,
//       });
//     },
//   );
// });

// Deno.test("Grid.contains returns false", async (t) => {
//   await t.step("should return invalid when grid is larger", () => {
//     const smaller = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     const larger = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//     assertEquals(smaller.contains({ inner: larger }), {
//       valid: false,
//       message: "Grid with bounds (10, 10) does not fit within (5, 5).",
//     });
//   });

//   await t.step("should return invalid when only x exceeds bounds", () => {
//     const outer = new Grid({ bottomRightCorner: { x: 5, y: 10 } });
//     const inner = new Grid({ bottomRightCorner: { x: 6, y: 10 } });
//     assertEquals(outer.contains({ inner: inner }), {
//       valid: false,
//       message: "Grid with bounds (6, 10) does not fit within (5, 10).",
//     });
//   });

//   await t.step("should return invalid when only y exceeds bounds", () => {
//     const outer = new Grid({ bottomRightCorner: { x: 10, y: 5 } });
//     const inner = new Grid({ bottomRightCorner: { x: 10, y: 6 } });
//     assertEquals(outer.contains({ inner: inner }), {
//       valid: false,
//       message: "Grid with bounds (10, 6) does not fit within (10, 5).",
//     });
//   });

//   await t.step(
//     "should return invalid when offset pushes grid out of bounds",
//     () => {
//       const outer = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//       const inner = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//       assertEquals(outer.contains({ inner: inner, offset: { x: 6, y: 6 } }), {
//         valid: false,
//         message: "Grid with bounds (11, 11) does not fit within (10, 10).",
//       });
//     },
//   );
// });

// Deno.test("Grid.place throws", async (t) => {
//   await t.step("should throw when inner grid does not fit", () => {
//     const outer = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//     const inner = new Grid({ bottomRightCorner: { x: 6, y: 6 } });
//     assertThrows(
//       () => outer.writeGrid({ inner }),
//       Error,
//       "Grid with bounds (6, 6) does not fit within (5, 5).",
//     );
//   });

//   await t.step(
//     "should throw when offset pushes inner grid out of bounds",
//     () => {
//       const outer = new Grid({ bottomRightCorner: { x: 10, y: 10 } });
//       const inner = new Grid({ bottomRightCorner: { x: 5, y: 5 } });
//       assertThrows(
//         () => outer.writeGrid({ inner, offset: { x: 6, y: 6 } }),
//         Error,
//         "Grid with bounds (11, 11) does not fit within (10, 10).",
//       );
//     },
//   );
// });

// Deno.test("Grid.place with Overwrite mode", async (t) => {
//   await t.step(
//     "should clear existing cells in the target region before placing",
//     () => {
//       const outer = Grid.fromString(
//         { x: 5, y: 5 },
//         `
//         # . . . .
//         . # . . .
//         . . . . .
//         . . . . .
//         . . . . #
//       `,
//       );

//       const innerCells: LiveCells = new Map();
//       innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
//       const inner = new Grid({ bottomRightCorner: { x: 3, y: 3 }, liveCells: innerCells });

//       outer.writeGrid({ inner });

//       assertEquals(
//         outer.toString(),
//         normalizeSeed(`
//           . # . . .
//           . . . . .
//           . . . . .
//           . . . . .
//           . . . . #
//         `),
//       );
//     },
//   );
//   await t.step(
//     "should overwrite with offset",
//     () => {
//       const outer = Grid.fromString(
//         { x: 10, y: 10 },
//         `
//         # . . . . . . . . .
//         . . . . . . . . . .
//         . . . . . . . . . .
//         . . . . . . . . . .
//         . . . . . . . . . .
//         . . . . . # . . . .
//         . . . . . . # . . .
//         . . . . . . . . . .
//         . . . . . . . . . .
//         . . . . . . . . . #
//       `,
//       );

//       const innerCells: LiveCells = new Map();
//       innerCells.set(pointToCellKey({ x: 0, y: 0 }), true);
//       innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
//       const inner = new Grid({ bottomRightCorner: { x: 3, y: 3 }, liveCells: innerCells });

//       outer.writeGrid({ inner, offset: { x: 5, y: 5 } });

//       assertEquals(
//         outer.toString(),
//         normalizeSeed(`
//           # . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . # # . . .
//           . . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . . . . . .
//           . . . . . . . . . #
//         `),
//       );
//     },
//   );
// });

// Deno.test("Grid.place with Merge mode", async (t) => {
//   await t.step("should preserve existing cells in the target region", () => {
//     const outer = Grid.fromString(
//       { x: 5, y: 5 },
//       `
//       . . . . .
//       . . # . .
//       . . # . .
//       . . # . .
//       . . . . .
//     `,
//     );

//     const innerCells: LiveCells = new Map();
//     innerCells.set(pointToCellKey({ x: 2, y: 0 }), true);
//     const inner = Grid.fromString(
//       { x: 5, y: 5 },
//       `
//       . . . . .
//       . . . . .
//       . # # # .
//       . . . . .
//       . . . . .
//     `,
//     );

//     outer.writeGrid({ inner, mode: PLACEMENT_MODES.MERGE });

//     assertEquals(
//       outer.toString(),
//       normalizeSeed(`
//         . . . . .
//         . . # . .
//         . # # # .
//         . . # . .
//         . . . . .
//       `),
//     );
//   });

//   await t.step("should merge with offset", () => {
//     const outer = Grid.fromString(
//       { x: 5, y: 5 },
//       `
//       . . . . .
//       . . # . .
//       . . # . .
//       . . # . .
//       . . . . .
//     `,
//     );

//     const inner = Grid.fromString(
//       { x: 3, y: 3 },
//       `
//       . . .
//       # # #
//       . . .
//     `,
//     );

//     outer.writeGrid({ inner, offset: { x: 1, y: 1 }, mode: PLACEMENT_MODES.MERGE });

//     assertEquals(
//       outer.toString(),
//       normalizeSeed(`
//         . . . . .
//         . . # . .
//         . # # # .
//         . . # . .
//         . . . . .
//       `),
//     );
//   });
// });
