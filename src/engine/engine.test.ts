import { assertEquals, assertThrows } from "@std/assert";
import { GRID_MODES } from "../constants.ts";
import { Engine } from "./engine.ts";
import type { GridMode, GridSize } from "../types.ts";
import { normalizeSeed } from "../seed/seed.ts";
import { Grid } from "../grid/grid.ts";

Deno.test("Constructor", async (t) => {
  await t.step("maxHistory less than 1 throws", () => {
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
      "maxHistory must be at least 1",
    );
  });

  await t.step("valid params", () => {
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

Deno.test("Engine.evolveCell: correctly evolves cell state", async (t) => {
  await t.step("live cell underpopulation 0 alive neighbors dies", () => {
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
  await t.step("live cell underpopulation 1 alive neighbor dies", () => {
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
  await t.step("live cell overpopulation (4 alive neighbors) dies", () => {
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
  await t.step("live cell overpopulation (5 alive neighbors) dies", () => {
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
  await t.step("live cell overpopulation (6 alive neighbors) dies", () => {
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
  await t.step("live cell overpopulation (7 alive neighbors) dies", () => {
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
  await t.step("live cell overpopulation (8 alive neighbors) dies", () => {
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
  await t.step("live cell (2 alive neighbors) survives", () => {
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
  await t.step("live cell (3 alive neighbors) survives", () => {
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
  await t.step("dead cell (exactly 3 alive neighbors) becomes alive", () => {
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

Deno.test("Engine.evolveGrid: correctly evolves grid state", async (t) => {
  await t.step("Evolves blinker", () => {
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
