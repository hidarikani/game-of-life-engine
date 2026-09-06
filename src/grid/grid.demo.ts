/**
 * Runnable walkthrough of the examples in README.md.
 *
 * Run with:
 *   deno run src/grid/grid.demo.ts
 */
import {
  Grid,
  GRID_MODES,
  type GridSize,
  type LiveCells,
  PLACEMENT_MODES,
  type Point,
  pointToCellKey,
} from "../../mod.ts";

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

// --- Coordinates & border behavior -----------------------------------

section("Coordinates: FINITE border cells are always dead");

const gridSize: GridSize = { w: 8, h: 4 };
const finiteGrid = new Grid({
  gridSize,
  mode: GRID_MODES.FINITE,
});
finiteGrid.writeCell({ x: 2, y: 1 }, true);

console.log(finiteGrid.toString());
console.log(
  "readCell(-1, -1) [top-left border]:",
  finiteGrid.readCell({ x: -1, y: -1 }),
);
console.log(
  "readCell(8, 4) [bottom-right border]:",
  finiteGrid.readCell({ x: 8, y: 4 }),
);
// writeCell on a FINITE border is a no-op: the cell stays dead
finiteGrid.writeCell({ x: -1, y: -1 }, true);
console.log(
  "after writeCell(-1, -1, true), still dead:",
  finiteGrid.readCell({ x: -1, y: -1 }) === false,
);

section("Coordinates: TOROIDAL border cells wrap around");

const toroidalGrid = new Grid({ gridSize, mode: GRID_MODES.TOROIDAL });
toroidalGrid.writeCell({ x: 0, y: 0 }, true);
console.log(
  "readCell(8, 4) wraps to (0, 0), which is alive:",
  toroidalGrid.readCell({ x: 8, y: 4 }),
);

try {
  finiteGrid.readCell({ x: 9, y: 5 });
} catch (error) {
  console.log(
    "readCell(9, 5) is out of bounds and throws:",
    (error as Error).message,
  );
}

// --- Empty grid --------------------------------------------------------

section("Empty grid");

const emptyGridSize: GridSize = { w: 10, h: 10 };
const emptyGrid = new Grid({ gridSize: emptyGridSize });
console.log("population:", emptyGrid.population);

try {
  new Grid({ gridSize: { w: 2, h: 2 } });
} catch (error) {
  console.log(
    "grid smaller than 3x3 throws:",
    (error as Error).message,
  );
}

// --- Grid with live cells ----------------------------------------------

section("Grid with live cells");

const liveCellsGridSize: GridSize = { w: 5, h: 5 };
const liveCells: LiveCells = new Set();
liveCells.add(pointToCellKey({ x: 0, y: 0 }));
liveCells.add(pointToCellKey({ x: 4, y: 4 }));

const liveCellsGrid = new Grid({ gridSize: liveCellsGridSize, liveCells });
console.log(liveCellsGrid.toString());
console.log("population:", liveCellsGrid.population);

// --- Grid from a seed string -------------------------------------------

section("Grid from a seed string");

const seedGridSize: GridSize = { w: 4, h: 4 };
const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
`;

const seedGrid = Grid.fromString({ gridSize: seedGridSize, seed });
console.log("population:", seedGrid.population);
console.log(seedGrid.toString());

// --- Placing one grid inside another ------------------------------------

section("Placing one grid inside another: MERGE");

const outer = Grid.fromString({
  gridSize: { w: 5, h: 5 },
  seed: `
    . . . . .
    . . # . .
    . . # . .
    . . # . .
    . . . . .
  `,
});

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

// Merge: keeps existing live cells and adds inner's live cells.
// outer's vertical bar and inner's horizontal bar combine into a plus shape.
outer.writeGrid({ inner, mode: PLACEMENT_MODES.MERGE });
console.log(outer.toString());

section("Placing one grid inside another: OVERWRITE with offset");

// Overwrite (the default mode) with an offset: the inner grid's top-left
// corner lands at { x: 2, y: 2 }, clearing and replacing that region.
const block = Grid.fromString({
  gridSize: { w: 3, h: 3 },
  seed: `
    # # #
    # # #
    # # #
  `,
});
const offset: Point = { x: 2, y: 2 };
outer.writeGrid({ inner: block, offset });
console.log(outer.toString());
