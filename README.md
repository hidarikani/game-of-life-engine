# game-of-life-engine

## Introduction

This library isn't intended to be used stand-alone. Instead, it's meant to be
imported into other TypeScript programs that need a Game of Life renderer —
`game-of-life-engine` handles the simulation logic (grid state, evolution
rules, boundary conditions), while your program handles rendering and
interaction.

> [!WARNING]
> This library isn't stable yet. The API is expected to change, and features
> may be added or removed without notice. The first stable release will be
> `v1.0.0`. Until then, versions will be `v0.x.x`.

> [!WARNING]
> This library doesn't have a contribution guide yet. For now, its direction
> is based on the subjective experience of a single maintainer, and there's
> no guarantee that feedback will be accepted. The only way to leave feedback
> is through the issues section of the related GitHub repo.

## Quick Start

Install:

```sh
deno add jsr:@hidarikani/game-of-life-engine
```

```ts
import { Engine, PatternLib } from "@hidarikani/game-of-life-engine";

const lib = PatternLib.fromBuiltInData();
const blinker = lib.getPatternByKey("blinker");

const engine = new Engine({ firstGeneration: blinker.generations[0] });

engine.evolveGrid();
console.log(engine.toString());
// . . . . .
// . . . . .
// . # # # .
// . . . . .
// . . . . .
```

## Usage

Most consumers won't hand-write seed strings — `PatternLib` comes bundled
with common still lifes, oscillators, and spaceships (including the blinker
used above), and can also load patterns from your own YAML file. See
[src/patterns/README.md](src/patterns/README.md) for the full `PatternLib`
API, built-in vs. custom pattern sources, and the YAML schema.

Patterns can also be placed onto a larger, otherwise blank `Grid` with
`writeGrid`, which is how you build a custom world out of known life forms
instead of evolving a single pattern in isolation. Here, a blinker and a toad
are placed side by side on a 20×10 grid, then passed to `Engine`:

```ts
import { Engine, Grid, PatternLib } from "@hidarikani/game-of-life-engine";
import type { GridSize } from "@hidarikani/game-of-life-engine";

const lib = PatternLib.fromBuiltInData();
const blinker = lib.getPatternByKey("blinker");
const toad = lib.getPatternByKey("toad");

// A blank 20x10 world, big enough to fit both patterns side by side
const gridSize: GridSize = { w: 20, h: 10 };
const firstGeneration = new Grid({ gridSize });

firstGeneration.writeGrid({
  inner: blinker.generations[0],
  offset: { x: 1, y: 2 },
});
firstGeneration.writeGrid({
  inner: toad.generations[0],
  offset: { x: 8, y: 2 },
});

const engine = new Engine({ firstGeneration });

engine.evolveGrid();
console.log(engine.toString());
```

See [src/grid/README.md](src/grid/README.md#placing-one-grid-inside-another)
for more on `writeGrid`, including overwrite vs. merge placement.

A runnable version of this example is available in [`demo.ts`](demo.ts):

```sh
deno run demo.ts
```

### Engine

See [src/engine/README.md](src/engine/README.md) for full `Engine` API documentation
and usage examples.

### Grid

See [src/grid/README.md](src/grid/README.md) for full `Grid` API documentation
and usage examples.

## Coordinates

Instantiating an engine with the following params:

```js
const engine = new Engine({ width: 8, height: 4 });
```

Will result in the following grid. Dead cells are represented by `.` and live
cells by `#`. The coordinates of the only live cell on the grid below is
`{x: 2, y: 1}`.

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

## Development

Runs on [Deno][deno]. Tested with `deno --version` `2.5.x`.

```zsh
# run unit tests in watch mode
deno run test:watch
```

---

[deno]: https://deno.com/
