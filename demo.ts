import { Engine, Grid } from "./mod.ts";
import type { GridSize } from "./mod.ts";

const gridSize: GridSize = { w: 5, h: 5 };

// A vertical blinker
const firstGeneration = Grid.fromString({
  gridSize,
  seed: `
    . . . . .
    . . # . .
    . . # . .
    . . # . .
    . . . . .
  `,
});

const engine = new Engine({ firstGeneration });

engine.evolveGrid();
console.log(engine.toString());
// . . . . .
// . . . . .
// . # # # .
// . . . . .
// . . . . .
