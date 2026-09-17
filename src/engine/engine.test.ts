import type { GridMode, GridSize } from "../types/grid.ts";

import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { GRID_MODES } from "../constants/constants.ts";
import { maxHistoryTooSmallMessage } from "../constants/messages.ts";
import { Engine } from "./engine.ts";
import { normalizeSeed } from "../seed/seed.ts";
import { Grid } from "../grid/grid.ts";

describe("Engine", () => {
  describe("constructor", () => {
    it("maxHistory less than 1 throws", () => {
      const gridSize: GridSize = { w: 5, h: 5 };

      const seed = `
        . . . . .
        . . # . .
        . . # . .
        . . # . .
        . . . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });

      assertThrows(
        () => new Engine({ firstGeneration, maxHistory: 0 }),
        Error,
        maxHistoryTooSmallMessage(0),
      );
    });

    it("valid params", () => {
      const gridSize: GridSize = { w: 5, h: 5 };
      const mode: GridMode = GRID_MODES.TOROIDAL;
      const seed = `
        . . . . .
        . . # . .
        . . # . .
        . . # . .
        . . . . .
      `;

      const firstGeneration = Grid.fromString({ gridSize, seed, mode });

      const engine = new Engine({ firstGeneration });

      assertEquals(engine.gridSize, gridSize);
      assertEquals(engine.mode, mode);
      assertEquals(engine.presentGeneration.population, 3); // 3 alive cells in the seed
    });
  });

  describe("evolveCell: correctly evolves cell state", () => {
    it("live cell underpopulation 0 alive neighbors dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      . . .
      . # .
      . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });

      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell underpopulation 1 alive neighbor dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      . # .
      . # .
      . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell overpopulation (4 alive neighbors) dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # #
      . # .
      . # .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell overpopulation (5 alive neighbors) dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # #
      . # #
      . # .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell overpopulation (6 alive neighbors) dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # #
      # # #
      . # .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell overpopulation (7 alive neighbors) dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # #
      # # #
      # # .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell overpopulation (8 alive neighbors) dies", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # #
      # # #
      # # #
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), false);
    });

    it("live cell (2 alive neighbors) survives", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # .
      . # .
      . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), true);
    });

    it("live cell (3 alive neighbors) survives", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # .
      . # #
      . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), true);
    });

    it("dead cell (exactly 3 alive neighbors) becomes alive", () => {
      const gridSize = { w: 3, h: 3 };
      const seed = `
      # # .
      . . #
      . . .
      `;
      const firstGeneration = Grid.fromString({ gridSize, seed });
      const engine = new Engine({ firstGeneration });
      assertEquals(engine.evolveCell({ x: 1, y: 1 }), true);
    });
  });

  describe("evolveGrid: correctly evolves grid state", () => {
    it("Evolves blinker", () => {
      const seed = `
        . . . . .
        . . # . .
        . . # . .
        . . # . .
        . . . . .
      `;

      const gridSize: GridSize = { w: 5, h: 5 };
      const firstGeneration = Grid.fromString({ gridSize, seed });

      const engine = new Engine({ firstGeneration });
      engine.evolveGrid();
      const actual = engine.toString();
      const expected = `
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
      `;
      assertEquals(actual, normalizeSeed(expected));
    });
  });
});
