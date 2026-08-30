/**
 * Runnable walkthrough of the examples in ENGINE.md.
 *
 * Run with:
 *   deno run src/engine/engine.demo.ts
 */
import { Engine, Grid, GRID_MODES } from "../../mod.ts";
import type { GridSize } from "../../mod.ts";

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

// --- Instantiation ------------------------------------------------------

section("Instantiation");

const gridSize: GridSize = { w: 5, h: 5 };

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
console.log(engine.toString());

// --- Grid mode ----------------------------------------------------------

section("Grid mode");

const toroidalGeneration = Grid.fromString({
  gridSize,
  seed: `
    . . . . .
    . . # . .
    . . # . .
    . . # . .
    . . . . .
  `,
  mode: GRID_MODES.TOROIDAL,
});

const toroidalEngine = new Engine({ firstGeneration: toroidalGeneration });
console.log(toroidalEngine.mode); // GRID_MODES.TOROIDAL

// --- Generation history --------------------------------------------------

section("Generation history");

const historyEngine = new Engine({ firstGeneration, maxHistory: 10 });
console.log("maxHistory:", historyEngine.maxHistory);

try {
  new Engine({ firstGeneration, maxHistory: 0 });
} catch (error) {
  console.log(
    "maxHistory less than 1 throws:",
    (error as Error).message,
  );
}

// --- Running a simulation ------------------------------------------------

section("Running a simulation");

// Blinker: vertical bar oscillates to horizontal bar after one step
const blinkerEngine = new Engine({ firstGeneration });

blinkerEngine.evolveGrid();

console.log(blinkerEngine.toString());

section("Running multiple generations in a loop");

for (let i = 0; i < 10; i++) {
  blinkerEngine.evolveGrid();
  console.log(`Generation ${i + 1}:`);
  console.log(blinkerEngine.toString());
}

// --- Inspecting state ----------------------------------------------------

section("Inspecting state");

console.log("gridSize:", engine.gridSize); // { w: 5, h: 5 }
console.log("mode:", engine.mode); // GRID_MODES.FINITE or GRID_MODES.TOROIDAL
console.log("presentGeneration:\n" + engine.presentGeneration.toString());
console.log("firstGeneration:\n" + engine.firstGeneration.toString());
console.log("historyLength:", engine.historyLength);
console.log("maxHistory:", engine.maxHistory);

console.log("readCell(2, 2):", engine.readCell({ x: 2, y: 2 }));

// --- Checking a single cell's next state ---------------------------------

section("Checking a single cell's next state");

const willBeAlive = engine.evolveCell({ x: 2, y: 2 }); // boolean
console.log("evolveCell(2, 2):", willBeAlive);
