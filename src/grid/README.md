# Grid

`Grid` is the lower-level building block that `Engine` uses internally. You can
instantiate one directly when you need to compose or inspect grids outside the
simulation loop.

## Coordinates

Instantiating a `Grid` with the following params:

```ts
const liveCells: LiveCells = new Map();
liveCells.set(pointToCellKey({ x: 2, y: 1 }), true);
const gridSize: GridSize = { w: 8, h: 4 };
const firstGeneration = new Grid({
  gridSize,
  liveCells,
  mode: GRID_MODES.FINITE,
});
```

Will result in the following coordinate space. Dead cells are represented by `.`
and live cells by `#`.

```
    | -1 | 0 1 2 3 4 5 6 7 8 | 9 |
    +----------------------------> X axis
 -1 |  . | . . . . . . . . . | . |
    +----+-------------------+---+
  0 |  . | . . . . . . . . . | . |
  1 |  . | . . # . . . . . . | . |
  2 |  . | . . . . . . . . . | . |
  3 |  . | . . . . . . . . . | . |
  4 |  . | . . . . . . . . . | . |
    +----+-------------------+---+
  5 |  . | . . . . . . . . . | . |
    +----+-------------------+---+ 
    v
Y axis
```

Notice 1 cell border around the grid (`x = -1, x = 9, y = -1, y = 5`). The
behavior of border cells depends on `GridMode`.

- `GridMode.Finite` — border cells are treated as permanently dead. In this
  world, a glider that hits the bottom-right corner simply disintegrates. This
  is easy to implement, but philosophically a little brutal. The universe has
  edges, and they are lethal. For example, the top-left neighbor of cell
  `{ x: 0, y: 0 }` is at `{ x: -1, y: -1 }` and will always be dead (`false`)
- `GridMode.Toroidal` — The left edge connects to the right, the top connects to
  the bottom. In that case, a spaceship exiting the bottom-right reappears at
  the top-left. This turns the universe into the surface of a donut. It’s
  mathematically tidy and popular for demos, but it introduces artificial
  interactions—your glider can collide with its own past if the grid is small.
  For example when trying to access cell at `{ x: 9, y: 5}` it shall be
  translated to `{ x: 0, y: 0 }`.

## Empty grid

```ts
import { Grid, GridSize } from "@hidarikani/game-of-life-engine";

const gridSize: GridSize = { w: 10, h: 10 };
const grid = new Grid({ gridSize });
```

The minimum allowed size is 3×3. Passing a smaller value throws an error.

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
`#` is a live cell. The number of rows and columns must match `gridSize`
exactly.

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
