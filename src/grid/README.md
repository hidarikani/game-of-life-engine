# Grid

`Grid` represents a two-dimensional cell space, used by the [Engine][engine] to
represent a single generation of the simulation. It exposes methods for managing
cells and can be instantiated empty, from a `Map` of live cells, or from a seed
string.

## Coordinates

Instantiating a `Grid` with the following params:

```ts
import { Grid, GRID_MODES, GridSize } from "../../mod.ts";

const gridSize: GridSize = { w: 8, h: 4 };
const finiteGrid = new Grid({
  gridSize,
  mode: GRID_MODES.FINITE,
});
finiteGrid.writeCell({ x: 2, y: 1 }, true);
```

Will result in the following coordinate space. Coordinates start from `0,0` and
and exend right and down. Dead cells are represented by `.` and live cells by
`#`.

```
    | -1 | 0 1 2 3 4 5 6 7 | 8 |
    +--------------------------> X axis
 -1 |  . | . . . . . . . . | . |
    +----+-----------------+---+
  0 |  . | . . . . . . . . | . |
  1 |  . | . . # . . . . . | . |
  2 |  . | . . . . . . . . | . |
  3 |  . | . . . . . . . . | . |
    +----+-----------------+---+
  4 |  . | . . . . . . . . | . |
    +----+-----------------+---+
    v
Y axis
```

Notice 1 cell border around the grid (`x = -1, x = 8, y = -1, y = 4`). The
behavior of border cells depends on `GridMode`.

- `GRID_MODES.FINITE` — border cells are treated as permanently dead. In this
  world, a glider that hits the bottom-right corner simply disintegrates. This
  is easy to implement, but philosophically a little brutal. The universe has
  edges, and they are lethal. For example, the top-left neighbor of cell
  `{ x: 0, y: 0 }` is at `{ x: -1, y: -1 }` and will always be dead (`false`)
- `GRID_MODES.TOROIDAL` — The left edge connects to the right, the top connects
  to the bottom. In that case, a spaceship exiting the bottom-right reappears at
  the top-left. This turns the universe into the surface of a donut. It’s
  mathematically tidy and popular for demos, but it introduces artificial
  interactions—your glider can collide with its own past if the grid is small.
  For example when trying to access cell at `{ x: 8, y: 4 }` (the bottom-right
  border corner for this grid) it shall be translated to `{ x: 0, y: 0 }`. Only
  the single-cell border ring wraps this way — coordinates further out (e.g.
  `{ x: 9, y: 5 }`) are out of bounds and throw.

## Empty grid

```ts
import { Grid, GridSize } from "../../mod.ts";

const gridSize: GridSize = { w: 10, h: 10 };
const grid = new Grid({ gridSize });
```

The minimum allowed size is 3×3. Passing a smaller value throws an error.

## Grid with live cells

Pass a `LiveCells` map (`Map<CellKey, boolean>`) to pre-populate cells. All
coordinates must be within `[0, w)` × `[0, h)` or the constructor throws.

```ts
import {
  Grid,
  GridSize,
  LiveCells,
  pointToCellKey,
} from "../../mod.ts";

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
import { Grid, GridSize } from "../../mod.ts";

const gridSize: GridSize = { w: 4, h: 4 };
const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
`;

const grid = Grid.fromString({ gridSize, seed });
console.log(grid.population); // 7
console.log(grid.toString());
```

## Placing one grid inside another

`writeGrid` copies cells from an inner grid into the outer one. The default mode
**overwrites** the target region; pass `PLACEMENT_MODES.MERGE` to union live
cells instead.

```ts
import { Grid, PLACEMENT_MODES, Point } from "../../mod.ts";

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
// . . . . .
// . . # . .
// . # # # .
// . . # . .
// . . . . .

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
// . . . . .
// . . # . .
// . # # # #
// . . # # #
// . . # # #
```

## Demo

[`grid.demo.ts`](./grid.demo.ts) runs every example above end-to-end and prints
the results to stdout so you can confirm the behavior for yourself:

```bash
deno run src/grid/grid.demo.ts
```

<!-- Internal -->

[engine]: ../engine/README.md
