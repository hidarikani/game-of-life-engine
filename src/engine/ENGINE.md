# Engine

`Engine` is the main entry point for running a Game of Life simulation. It owns
the grid state and advances it one generation at a time.

## Instantiation

`Engine` does not accept a seed string directly. You first create a `Grid` (see
[`src/grid/GRID.md`][grid]), then pass it as `firstGeneration`.

```ts
import { Engine, Grid, GRID_MODES } from "@hidarikani/game-of-life-engine";
import type { GridSize } from "@hidarikani/game-of-life-engine";

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
```

### Grid mode

The grid mode (`Finite` or `Toroidal`) is set on the `Grid`, not the `Engine`.
The engine inherits it from `firstGeneration`.

```ts
const firstGeneration = Grid.fromString({
  gridSize,
  seed: `...`,
  mode: GRID_MODES.TOROIDAL,
});

const engine = new Engine({ firstGeneration });
console.log(engine.mode); // GRID_MODES.TOROIDAL
```

### Generation history

`Engine` keeps a rolling window of past generations in memory. The default is 3.
You can configure it with `maxHistory` — passing a value less than 1 throws an error.

```ts
const engine = new Engine({ firstGeneration, maxHistory: 10 });
```

## Running a simulation

Call `evolveGrid()` to advance one generation. The result is stored internally
and accessible via `presentGeneration` or `toString()`.

```ts
// Blinker: vertical bar oscillates to horizontal bar after one step
const firstGeneration = Grid.fromString({
  gridSize: { w: 5, h: 5 },
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
```

To run multiple generations in a loop:

```ts
for (let i = 0; i < 10; i++) {
  engine.evolveGrid();
  console.log(`Generation ${i + 1}:`);
  console.log(engine.toString());
}
```

## Inspecting state

```ts
engine.gridSize           // { w: 5, h: 5 }
engine.mode               // GRID_MODES.FINITE or GRID_MODES.TOROIDAL
engine.presentGeneration  // the current Grid
engine.firstGeneration    // the initial Grid
engine.historyLength      // number of generations currently stored
engine.maxHistory         // rolling window size

engine.readCell({ x: 2, y: 2 })  // true if cell is alive, false if dead
```

## Checking a single cell's next state

`evolveCell(point)` applies the Game of Life rules to one cell and returns its
next state, without mutating any grid state. Useful for inspection or custom
rendering logic.

```ts
const willBeAlive = engine.evolveCell({ x: 2, y: 2 }); // boolean
```

<!-- Internal -->

[grid]: ../grid/GRID.md
