# game-of-life-engine

## Introduction

Web standard compliant implementation of [Conway's Game of Life][cgol]. The game
rules have been extensively documented on the internet, including
[Wikipedia][cgol] so it won't be repeated here.

Contents include abstractions for managing cell patterns, initial game state
setup, simulation and output verification.

Intended traits include:

- Web development ready,
- TypeScript, ESM Module first,
- Browser runtime compatible,
- Deno runtime compatible,
- Quality assured, including:
  - code style formatting (Deno default)
  - linting (Deno default)
  - unit and integration testing
- well documented, including JSDoc and README.md for major entities

This library is part of a larger namespace of tools:

- This library (Engine)
- Text User Interface (TUI) for one-time and interactive simulations
- React component for rendering game state
- Next.js app for running interactive simulations in the browser

> [!NOTE]
> This library isn't intended to be used stand-alone. Instead, it's meant to be
> imported into other TypeScript programs that need a
> [Conway's Game of Life][cgol] renderer.

> [!WARNING]
> This library isn't stable yet. The API is expected to change, and features may
> be added or removed without notice. The first stable release will be `v1.0.0`.
> Until then, versions will be `v0.x.x`.

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

The following are the abstractions used in this library that enable easy game
setup, execution and verification. Each abstraction has a dedicated
documentation page with usage details. Here only the big picture of integration
is provided. Refer to the list below for overview and links to dedicated pages.

- [PatternLib][pattern-lib] — Abstracts the process of loading cell patterns
  represented as multi-line strings to instances of [Grid][grid]. Supports
  reading patterns stored in [YAML][yaml] files.
- [Grid][grid] — Bounded (has fixed dimensions) cell pattern that has a concrete
  coordinate system and exposes common operations such as reading cell state and
  merging patterns together.
- [Engine][engine] — Contains the simulation rules, evolves a Grid
  to produce a new generation. Manages generation history.

The most frictionless way to start is to use
[built-in patterns][built-in-patterns] that come bundled with this library
(including the blinker used in the [quick-start section](#quick-start)). For
that, use an instance of [PatternLib][pattern-lib]. It is able to retrieve a
concrete pattern by `key` and supports filtering by certain properties. Advanced
workflows are also available: a pattern can be loaded from a multi-line string,
or from a [YAML][yaml] file.

Operating on cell patterns represented as strings is suboptimal, because there
are certain common operations needed that strings just don't support. To solve
this issue, an abstraction called [Grid][grid] was introduced. Conveniently,
[PatternLib][pattern-lib] methods return instances of [Grid][grid]. It's useful
to combine grids: a smaller grid (inner) can be written into a larger grid
(outer), as long as the outer is able to contain the inner. This is useful when
building out the initial state of the simulation, which is also an instance of
[Grid][grid]. Grids retrieved from the [PatternLib][pattern-lib] are usually
small — for example, the blinker pattern size is 5 cells — while the game world
is usually larger, for example 1024x768 cells. In this case it would be fun to
create a blank grid of that size, then place several blinkers inside of it.

The [Engine][engine] is what keeps track of the simulation. It accepts a grid as
the initial game state. It applies simulation rules to produce a new generation.
Instead of modifying the current grid, each tick produces a new instance. This
way a history stack is produced, where each entry is a [Grid][grid] instance
treated as immutable.

Below is a concrete code example that loads a **Blinker** and a **Toad**, then
places them side by side, and finally simulates one tick:

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

A runnable version of this example is available in [`demo.ts`][demo]:

```sh
deno run demo.ts
```

## Development

Runs on [Deno][deno]. Tested with `deno --version` `2.9.x`.

> [!WARNING]
> Some tests require file read permission, because the [PatternLib][pattern-lib]
> can read patterns defined in [YAML][yaml] files.

```zsh
# run unit tests in watch mode
deno task test:watch
```

## Contribution

This library doesn't have a contribution guide yet. For now, its direction is
based on the subjective experience of a single maintainer, and there's no
guarantee that feedback will be accepted. The only way to leave feedback is
through the issues section of the related GitHub repo.

<!-- Internal -->

[built-in-patterns]: /data/patterns/patterns.yaml
[pattern-lib]: src/patterns/README.md
[grid]: src/grid/README.md
[engine]: src/engine/README.md
[demo]: demo.ts

<!-- External -->

[cgol]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
[deno]: https://deno.com/
[yaml]: https://yaml.org/
