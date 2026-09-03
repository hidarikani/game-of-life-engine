import type { Point } from "../types/geometry.ts";
import type { LiveCells } from "../types/cell.ts";
import type { GridSize, IGrid } from "../types/grid.ts";

import { assertEquals, assertThrows } from "@std/assert";
import { beforeAll, describe, it } from "@std/testing/bdd";

import { Grid } from "./grid.ts";
import { normalizeSeed, pointToCellKey } from "../seed/seed.ts";
import { GRID_MODES, PLACEMENT_MODES } from "../constants.ts";

describe("Grid", () => {
  describe("constructor", () => {
    describe("Valid constructor params", () => {
      it("should instantiate dead Grid", () => {
        const gridSize: GridSize = { w: 10, h: 10 };
        const grid = new Grid({ gridSize });
        assertEquals(grid instanceof Grid, true);
      });

      it("should accept valid liveCells within bounds", () => {
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

    describe("Invalid constructor params", () => {
      it("should throw when width is below minimum", () => {
        const gridSize: GridSize = { w: 2, h: 3 };
        assertThrows(
          () => new Grid({ gridSize }),
          Error,
          "Grid must be at least 3 cells wide and 3 cells tall",
        );
      });

      it("should throw when height is below minimum", () => {
        const gridSize: GridSize = { w: 3, h: 2 };
        assertThrows(
          () => new Grid({ gridSize }),
          Error,
          "Grid must be at least 3 cells wide and 3 cells tall",
        );
      });

      it("should throw when cell y coordinate is out of bounds", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const liveCells: LiveCells = new Map();
        liveCells.set(pointToCellKey({ x: 3, y: 5 }), true);

        assertThrows(
          () => new Grid({ gridSize, liveCells }),
          Error,
          "Cell at (3, 5) is outside the grid of size (5, 5).",
        );
      });
    });
  });

  describe("fromString", () => {
    describe("Valid params", () => {
      const validSeed = `
        # . . #
        . # # .
        . . . #
        # # . .
      `;

      it("should create a grid from a valid seed string", () => {
        const gridSize: GridSize = { w: 4, h: 4 };
        const grid = Grid.fromString({ gridSize, seed: validSeed });
        assertEquals(grid.gridSize, gridSize);
      });

      it("should parse cells correctly", () => {
        const gridSize: GridSize = { w: 4, h: 4 };
        const grid = Grid.fromString({ gridSize, seed: validSeed });
        assertEquals(grid.toString(), normalizeSeed(validSeed));
      });

      it("should create a grid with no live cells from all-dead seed", () => {
        const deadSeed = `
          . . .
          . . .
          . . .
        `;
        const gridSize: GridSize = { w: 3, h: 3 };
        const grid = Grid.fromString({ gridSize, seed: deadSeed });
        assertEquals(grid.population, 0);
      });

      it("should create a grid with all live cells from all-alive seed", () => {
        const aliveSeed = `
          # # #
          # # #
          # # #
        `;
        const gridSize: GridSize = { w: 3, h: 3 };
        const grid = Grid.fromString({ gridSize, seed: aliveSeed });
        assertEquals(grid.population, 9);
      });
    });

    describe("Invalid params", () => {
      it("should throw when seed contains invalid character `O`", () => {
        const gridSize = { w: 4, h: 4 };
        const invalidSeed = `
          # . . O
          . # # .
          . . . #
          # # . .
        `;
        assertThrows(
          () => Grid.fromString({ gridSize, seed: invalidSeed }),
          Error,
          "Seed contains invalid characters",
        );
      });

      it("should throw when seed contains invalid character `,`", () => {
        const gridSize = { w: 4, h: 4 };
        const invalidSeed = `
          # . . ,
          . # # .
          . . . #
          # # . .
        `;
        assertThrows(
          () => Grid.fromString({ gridSize, seed: invalidSeed }),
          Error,
          "Seed contains invalid characters",
        );
      });

      it("should throw when width is below minimum", () => {
        const gridSize = { w: 2, h: 3 };
        const seed = `
          # .
          . #
          . .
        `;
        assertThrows(
          () => Grid.fromString({ gridSize, seed }),
          Error,
          "Grid must be at least 3 cells wide and 3 cells tall",
        );
      });

      it("should throw when height is below minimum", () => {
        const gridSize = { w: 3, h: 2 };
        const seed = `
          # . .
          . # .
        `;
        assertThrows(
          () => Grid.fromString({ gridSize, seed }),
          Error,
          "Grid must be at least 3 cells wide and 3 cells tall",
        );
      });

      it("should throw when seed height does not match", () => {
        const gridSize = { w: 4, h: 4 };
        const seed = `
          # . . #
          . # # .
          . . . #
        `; //missing row
        assertThrows(
          () => Grid.fromString({ gridSize, seed }),
          Error,
          "Seed height does not match specified height",
        );
      });

      it("should throw when seed width does not match", () => {
        const gridSize = { w: 4, h: 4 };
        const seed = `
          # . . #
          . # # .
          . . . #
          # #   .
        `; // last row missing `.`
        assertThrows(
          () => Grid.fromString({ gridSize, seed }),
          Error,
          "Seed width does not match specified width",
        );
      });
    });
  });

  describe("toString", () => {
    it("should return string representation of a grid with live and dead cells", () => {
      const gridSize = { w: 4, h: 4 };
      const seed = `
        # . . #
        . # # .
        . . . #
        # # . .
      `;
      const grid = Grid.fromString({ gridSize, seed });
      assertEquals(grid.toString(), normalizeSeed(seed));
    });

    it("should roundtrip through fromString and toString", () => {
      const gridSize = { w: 5, h: 3 };
      const seed = `
        . # . # .
        # . # . #
        . # . # .
      `;
      const grid = Grid.fromString({ gridSize, seed });
      const grid2 = Grid.fromString({ gridSize, seed: grid.toString() });
      assertEquals(grid.toString(), grid2.toString());
    });
  });

  describe("writeGrid", () => {
    describe("invalid params", () => {
      it("should throw when inner grid does not fit", () => {
        const gridSizeOuter: GridSize = { w: 5, h: 5 };
        const gridSizeInner: GridSize = { w: 6, h: 6 };
        const outer = new Grid({ gridSize: gridSizeOuter });
        const inner = new Grid({ gridSize: gridSizeInner });
        assertThrows(
          () => outer.writeGrid({ inner }),
          Error,
          "Inner grid of size (6, 6) offset by (0, 0) does not fit in outer grid of size (5, 5).",
        );
      });

      it("should throw when offset pushes inner grid out of bounds", () => {
        const gridSizeOuter: GridSize = { w: 10, h: 10 };
        const gridSizeInner: GridSize = { w: 5, h: 5 };
        const outer = new Grid({ gridSize: gridSizeOuter });
        const inner = new Grid({ gridSize: gridSizeInner });
        const offset: Point = { x: 6, y: 6 };
        assertThrows(
          () => outer.writeGrid({ inner, offset }),
          Error,
          "Inner grid of size (5, 5) offset by (6, 6) does not fit in outer grid of size (10, 10).",
        );
      });
    });

    // The cases below share one `outer` grid on purpose: each writes into the
    // grid left behind by the previous one, so placement is exercised against
    // a non-empty target.
    describe("overwrite mode", () => {
      let outer: IGrid;

      beforeAll(() => {
        outer = Grid.fromString({
          gridSize: { w: 5, h: 5 },
          seed: `
            # . . . .
            . # . . .
            . . . . .
            . . . . .
            . . . . #
          `,
        });
      });

      it("should clear existing cells in the target region before placing", () => {
        const innerCells: LiveCells = new Map();
        innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
        const inner = new Grid({
          gridSize: { w: 3, h: 3 },
          liveCells: innerCells,
        });

        outer.writeGrid({ inner });

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
      });

      it("should overwrite with offset", () => {
        const innerCells: LiveCells = new Map();
        innerCells.set(pointToCellKey({ x: 0, y: 0 }), true);
        innerCells.set(pointToCellKey({ x: 1, y: 0 }), true);
        const inner = new Grid({
          gridSize: { w: 3, h: 3 },
          liveCells: innerCells,
        });
        const offset: Point = { x: 2, y: 2 };

        outer.writeGrid({ inner, offset });

        assertEquals(
          outer.toString(),
          normalizeSeed(`
            . # . . .
            . . . . .
            . . # # .
            . . . . .
            . . . . .
          `),
        );
      });
    });

    describe("merge mode", () => {
      let outer: IGrid;

      beforeAll(() => {
        outer = Grid.fromString({
          gridSize: { w: 5, h: 5 },
          seed: `
            . . . . .
            . . # . .
            . . # . .
            . . # . .
            . . . . .
          `,
        });
      });

      it("should preserve existing cells in the target region", () => {
        const inner = Grid.fromString({
          gridSize: { w: 5, h: 5 },
          seed: `
            . . . . .
            . . . . .
            . # # # .
            . . . . .
            . . . . .
          `,
        });

        outer.writeGrid({ inner, mode: PLACEMENT_MODES.MERGE });

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

      it("should merge with offset", () => {
        const inner = Grid.fromString({
          gridSize: { w: 3, h: 3 },
          seed: `
            . . .
            # # #
            . . .
          `,
        });

        outer.writeGrid({
          inner,
          offset: { x: 1, y: 1 },
          mode: PLACEMENT_MODES.MERGE,
        });

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
  });

  describe("readCell", () => {
    describe("out of bounds throws", () => {
      it("left edge exceeded", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        assertThrows(
          () => grid.readCell({ x: -2, y: 0 }),
          Error,
          "Cell (-2, 0) is out of bounds",
        );
      });

      it("right edge exceeded", () => {
        const width = 5;
        const grid = new Grid({ gridSize: { w: width, h: 5 } });
        assertThrows(
          () => grid.readCell({ x: width + 1, y: 0 }),
          Error,
          `Cell (${width + 1}, 0) is out of bounds`,
        );
      });

      it("top edge exceeded", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        assertThrows(
          () => grid.readCell({ x: 0, y: -2 }),
          Error,
          "Cell (0, -2) is out of bounds",
        );
      });

      it("bottom edge exceeded", () => {
        const height = 5;
        const grid = new Grid({ gridSize: { w: 5, h: height } });
        assertThrows(
          () => grid.readCell({ x: 0, y: height + 1 }),
          Error,
          `Cell (0, ${height + 1}) is out of bounds`,
        );
      });
    });

    describe("toroidal border wrapping", () => {
      describe("corners", () => {
        let cornerGrid: IGrid;

        beforeAll(() => {
          cornerGrid = Grid.fromString({
            gridSize: { w: 3, h: 3 },
            mode: GRID_MODES.TOROIDAL,
            seed: `
              # . #
              . . .
              # . .
            `,
          });
        });

        it("cell { x: 2, y: 2 } right neighbor is alive", () => {
          const rightNeighborX = 3; // wraps to 0
          const rightNeighborY = 2;
          const isAlive = cornerGrid.readCell({
            x: rightNeighborX,
            y: rightNeighborY,
          });
          if (!isAlive) {
            throw new Error(
              `Expected cell (${rightNeighborX}, ${rightNeighborY}) to be alive due to wrapping, but it was dead.`,
            );
          }
        });

        it("cell { x: 2, y: 2 } bottom neighbor is alive", () => {
          const bottomNeighborX = 2;
          const bottomNeighborY = 3; // wraps to 0
          const isAlive = cornerGrid.readCell({
            x: bottomNeighborX,
            y: bottomNeighborY,
          });
          if (!isAlive) {
            throw new Error(
              `Expected cell (${bottomNeighborX}, ${bottomNeighborY}) to be alive due to wrapping, but it was dead.`,
            );
          }
        });

        it("cell { x: 2, y: 2 } bottom-right neighbor is alive", () => {
          const bottomRightNeighborX = 3; // wraps to 0
          const bottomRightNeighborY = 3; // wraps to 0
          const isAlive = cornerGrid.readCell({
            x: bottomRightNeighborX,
            y: bottomRightNeighborY,
          });
          if (!isAlive) {
            throw new Error(
              `Expected cell (${bottomRightNeighborX}, ${bottomRightNeighborY}) to be alive due to wrapping, but it was dead.`,
            );
          }
        });
      });

      describe("edges", () => {
        let midEdgeGrid: IGrid;

        beforeAll(() => {
          midEdgeGrid = Grid.fromString({
            gridSize: { w: 3, h: 3 },
            mode: GRID_MODES.TOROIDAL,
            seed: `
              . # .
              # . .
              . . .
            `,
          });
        });

        it("cell {x: 2, y: 1 } right neighbor is alive", () => {
          const rightNeighborX = 3;
          const rightNeighborY = 1;
          const isAlive = midEdgeGrid.readCell({
            x: rightNeighborX,
            y: rightNeighborY,
          });
          if (!isAlive) {
            throw new Error(
              `Expected cell (${rightNeighborX}, ${rightNeighborY}) to be alive due to wrapping, but it was dead.`,
            );
          }
        });

        it("cell { x: 1, y: 2 } bottom neighbor is alive", () => {
          const bottomNeighborX = 1;
          const bottomNeighborY = 3; // wraps to 0
          const isAlive = midEdgeGrid.readCell({
            x: bottomNeighborX,
            y: bottomNeighborY,
          });
          if (!isAlive) {
            throw new Error(
              `Expected cell (${bottomNeighborX}, ${bottomNeighborY}) to be alive due to wrapping, but it was dead.`,
            );
          }
        });
      });
    });
  });

  describe("writeCell", () => {
    describe("out of bounds throws", () => {
      it("left edge exceeded", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        assertThrows(
          () => grid.writeCell({ x: -2, y: 0 }, true),
          Error,
          "Cell (-2, 0) is out of bounds",
        );
      });

      it("right edge exceeded", () => {
        const width = 5;
        const grid = new Grid({ gridSize: { w: width, h: 5 } });
        assertThrows(
          () => grid.writeCell({ x: width + 1, y: 0 }, true),
          Error,
          `Cell (${width + 1}, 0) is out of bounds`,
        );
      });

      it("top edge exceeded", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        assertThrows(
          () => grid.writeCell({ x: 0, y: -2 }, true),
          Error,
          "Cell (0, -2) is out of bounds",
        );
      });

      it("bottom edge exceeded", () => {
        const height = 5;
        const grid = new Grid({ gridSize: { w: 5, h: height } });
        assertThrows(
          () => grid.writeCell({ x: 0, y: height + 1 }, true),
          Error,
          `Cell (0, ${height + 1}) is out of bounds`,
        );
      });
    });

    describe("finite border is a no-op", () => {
      it("writing alive to a border cell does not persist", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        grid.writeCell({ x: -1, y: 2 }, true);
        assertEquals(grid.readCell({ x: -1, y: 2 }), false);
        assertEquals(grid.population, 0);
      });

      it("writing dead to a border cell does not throw", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        grid.writeCell({ x: 5, y: 2 }, false);
        assertEquals(grid.readCell({ x: 5, y: 2 }), false);
      });
    });

    describe("toroidal border wrapping", () => {
      it("right-edge write wraps to (0, y), preserving y", () => {
        const grid = new Grid({
          gridSize: { w: 3, h: 3 },
          mode: GRID_MODES.TOROIDAL,
        });
        grid.writeCell({ x: 3, y: 2 }, true);
        assertEquals(grid.readCell({ x: 0, y: 2 }), true);
        assertEquals(grid.readCell({ x: 0, y: 0 }), false);
      });

      it("bottom-edge write wraps to (x, 0), preserving x", () => {
        const grid = new Grid({
          gridSize: { w: 3, h: 3 },
          mode: GRID_MODES.TOROIDAL,
        });
        grid.writeCell({ x: 2, y: 3 }, true);
        assertEquals(grid.readCell({ x: 2, y: 0 }), true);
        assertEquals(grid.readCell({ x: 0, y: 0 }), false);
      });

      it("bottom-right corner write wraps to (0, 0)", () => {
        const grid = new Grid({
          gridSize: { w: 3, h: 3 },
          mode: GRID_MODES.TOROIDAL,
        });
        grid.writeCell({ x: 3, y: 3 }, true);
        assertEquals(grid.readCell({ x: 0, y: 0 }), true);
      });

      it("left-edge write wraps to (w - 1, y), preserving y", () => {
        const grid = Grid.fromString({
          gridSize: { w: 3, h: 3 },
          mode: GRID_MODES.TOROIDAL,
          seed: `
            . . .
            . . #
            . . .
          `,
        });
        grid.writeCell({ x: -1, y: 1 }, false);
        assertEquals(grid.readCell({ x: 2, y: 1 }), false);
      });
    });

    describe("writes within bounds", () => {
      it("should bring a dead cell to life", () => {
        const grid = new Grid({ gridSize: { w: 5, h: 5 } });
        grid.writeCell({ x: 2, y: 2 }, true);
        assertEquals(grid.readCell({ x: 2, y: 2 }), true);
      });

      it("should kill a live cell", () => {
        const grid = Grid.fromString({
          gridSize: { w: 3, h: 3 },
          seed: `
            # . .
            . . .
            . . .
          `,
        });
        grid.writeCell({ x: 0, y: 0 }, false);
        assertEquals(grid.readCell({ x: 0, y: 0 }), false);
      });

      it("should be a no-op when killing an already-dead cell", () => {
        const grid = new Grid({ gridSize: { w: 5, h: 5 } });
        grid.writeCell({ x: 1, y: 1 }, false);
        assertEquals(grid.population, 0);
      });

      it("should not increase population when reviving twice", () => {
        const grid = new Grid({ gridSize: { w: 5, h: 5 } });
        grid.writeCell({ x: 1, y: 1 }, true);
        grid.writeCell({ x: 1, y: 1 }, true);
        assertEquals(grid.population, 1);
      });

      it("should allow writing at the top-left corner (0, 0)", () => {
        const grid = new Grid({ gridSize: { w: 5, h: 5 } });
        grid.writeCell({ x: 0, y: 0 }, true);
        assertEquals(grid.readCell({ x: 0, y: 0 }), true);
      });

      it("should allow writing at the bottom-right corner (w - 1, h - 1)", () => {
        const gridSize: GridSize = { w: 5, h: 5 };
        const grid = new Grid({ gridSize });
        grid.writeCell({ x: gridSize.w - 1, y: gridSize.h - 1 }, true);
        assertEquals(
          grid.readCell({ x: gridSize.w - 1, y: gridSize.h - 1 }),
          true,
        );
      });
    });
  });

  describe("equals", () => {
    it("should return false when grid sizes differ", () => {
      const a = new Grid({ gridSize: { w: 4, h: 4 } });
      const b = new Grid({ gridSize: { w: 5, h: 5 } });
      assertEquals(a.equals(b), false);
    });

    it("should return false when population differs", () => {
      const a = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed: `
          # . .
          . . .
          . . .
        `,
      });
      const b = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed: `
          # . .
          . # .
          . . .
        `,
      });
      assertEquals(a.equals(b), false);
    });

    it("should return false when population matches but live cell coordinates differ", () => {
      const a = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed: `
          # . .
          . . .
          . . .
        `,
      });
      const b = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed: `
          . . #
          . . .
          . . .
        `,
      });
      assertEquals(a.equals(b), false);
    });

    it("should return false when modes differ", () => {
      const seed = `
        # . .
        . # .
        . . .
      `;
      const a = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed,
        mode: GRID_MODES.FINITE,
      });
      const b = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed,
        mode: GRID_MODES.TOROIDAL,
      });
      assertEquals(a.equals(b), false);
    });

    it("should return true for two grids with identical cells", () => {
      const seed = `
        # . . #
        . # # .
        . . . #
        # # . .
      `;
      const a = Grid.fromString({ gridSize: { w: 4, h: 4 }, seed });
      const b = Grid.fromString({ gridSize: { w: 4, h: 4 }, seed });
      assertEquals(a.equals(b), true);
    });

    it("should return true for two empty grids of the same size", () => {
      const a = new Grid({ gridSize: { w: 5, h: 5 } });
      const b = new Grid({ gridSize: { w: 5, h: 5 } });
      assertEquals(a.equals(b), true);
    });

    it("should return true for a grid compared to itself", () => {
      const grid = Grid.fromString({
        gridSize: { w: 3, h: 3 },
        seed: `
          # . .
          . # .
          . . #
        `,
      });
      assertEquals(grid.equals(grid), true);
    });
  });
});
