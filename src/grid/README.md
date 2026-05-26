# Grid

`Grid` is the lower-level building block that `Engine` uses internally. You can
instantiate one directly when you need to compose or inspect grids outside the
simulation loop.

## Empty grid

```ts
import { Grid, GridSize } from "@hidarikani/game-of-life-engine";

const gridSize: GridSize = { w: 10, h: 10 };
const grid = new Grid({ gridSize });
```

The minimum allowed size is 3×3. Passing a smaller value throws:

```
Error: Grid must be at least 3 cells wide and 3 cells tall
```

## Grid with live cells

Pass a `LiveCells` map (`Map<CellKey, boolean>`) to pre-populate cells. All
coordinates must be within `[0, w)` × `[0, h)` or the constructor throws.

```ts
import { Grid, GridSize, LiveCells } from "@hidarikani/game-of-life-engine";
import { pointToCellKey } from "@hidarikani/game-of-life-engine";

const gridSize: GridSize = { w: 5, h: 5 };
const liveCells: LiveCells = new Map();
liveCells.set(pointToCellKey({ x: 0, y: 0 }), true);
liveCells.set(pointToCellKey({ x: 4, y: 4 }), true);

const grid = new Grid({ gridSize, liveCells });
```

## Grid from a seed string

`Grid.fromString` parses a multiline seed string where `.` is a dead cell and
`#` is a live cell. The number of rows and columns must match `gridSize` exactly.

```ts
import { Grid, GridSize } from "@hidarikani/game-of-life-engine";

const gridSize: GridSize = { w: 4, h: 4 };
const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
`;

const grid = Grid.fromString({ gridSize, seed });
console.log(grid.population); // 8
console.log(grid.toString());
```

## Placing one grid inside another

`writeGrid` copies cells from an inner grid into the outer one. The default mode
**overwrites** the target region; pass `PLACEMENT_MODES.MERGE` to union live
cells instead.

```ts
import { Grid, PLACEMENT_MODES, Point } from "@hidarikani/game-of-life-engine";

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

// Merge: keeps existing live cells and adds inner's live cells
outer.writeGrid({ inner, mode: PLACEMENT_MODES.MERGE });

// Place with an offset (top-left corner of inner at x:2, y:2)
const offset: Point = { x: 2, y: 2 };
outer.writeGrid({ inner: new Grid({ gridSize: { w: 3, h: 3 } }), offset });
```
