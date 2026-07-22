# PatternLib

`PatternLib` is a lookup library for named Game of Life patterns (still lifes,
oscillators, spaceships). Each pattern carries one or more generations as
`Grid` instances, so they can be dropped straight into an `Engine` or another
`Grid` via `writeGrid` (see [`src/grid/README.md`][grid]).

## Built-in patterns vs. your own file

`PatternLib` has two constructors:

- `PatternLib.fromBuiltInData()` — loads the patterns bundled with this
  package (`data/patterns/patterns.yaml`). The YAML is inlined into the
  package at build time, so **no file system access is required**. This is
  the one to reach for under Deno's default permission model, or if you've
  locked your process down with `--allow-read` restricted to specific paths.
- `PatternLib.fromYamlFile(filePath)` — reads and parses a YAML file from
  disk at the given path. Because this calls `Deno.readTextFileSync`
  internally, **your process needs read permission for that file** (e.g. run
  with `--allow-read` or `--allow-read=<path-to-your-file>`), or Deno will
  throw a `PermissionDenied` error.

```ts
import { PatternLib } from "../../mod.ts";

// No --allow-read needed
const builtIn = PatternLib.fromBuiltInData();

// Requires --allow-read (or --allow-read=./my-patterns.yaml)
const custom = PatternLib.fromYamlFile("./my-patterns.yaml");
```

## Looking up patterns

`getPatternByKey` returns a single pattern, or throws if the key doesn't exist.

```ts
import { PatternLib } from "../../mod.ts";

const lib = PatternLib.fromBuiltInData();

const blinker = lib.getPatternByKey("blinker");
console.log(blinker.name); // "Blinker"
console.log(blinker.generations[0].toString());
```

`getPatterns` returns all patterns, or filters by name (`RegExp`) and/or
`patternType`. Pass `null` for no filtering.

```ts
import type { PatternFilter } from "../../mod.ts";

const all = lib.getPatterns(null);

const filter: PatternFilter = { name: /^b/i, patternType: null };
const startingWithB = lib.getPatterns(filter);

const oscillators = lib.getPatterns({ name: null, patternType: "oscillator" });
```

## Using a pattern with `Engine`

Each generation on a `Pattern` is already a `Grid`, so the first one can be
passed directly as `firstGeneration`:

```ts
import { Engine, PatternLib } from "../../mod.ts";

const lib = PatternLib.fromBuiltInData();
const blinker = lib.getPatternByKey("blinker");

const engine = new Engine({ firstGeneration: blinker.generations[0] });
engine.evolveGrid();

console.log(engine.toString()); // matches blinker.generations[1]
```

## YAML schema

Both constructors expect the same shape: a top-level `patterns` list. Each
entry declares its metadata plus one `state` seed string (see
[`src/grid/README.md`][grid-seed-format] for the
`.`/`#` seed format) per generation in its period. `width`/`height` must match
every `state` string's dimensions exactly.

```yaml
patterns:
  - name: Blinker
    key: blinker
    type: oscillator # "still-life" | "oscillator" | "spaceship"
    period: 2
    width: 5
    height: 5
    generations:
      - state: |
          . . . . .
          . . # . .
          . . # . .
          . . # . .
          . . . . .
      - state: |
          . . . . .
          . . . . .
          . # # # .
          . . . . .
          . . . . .
```

A `still-life` pattern never changes, so it only needs one entry under
`generations` and a `period` of `1`.

## Demo

[`pattern.demo.ts`](./pattern.demo.ts) runs every example above end-to-end and
prints the results to stdout so you can confirm the behavior for yourself:

```bash
deno run src/patterns/pattern.demo.ts
```

The `fromYamlFile` call needs read access to the file it's loading. This demo
doesn't ship its own `my-patterns.yaml`, so without a grant it prints the
resulting permission error instead of crashing; pass `--allow-read` (or
`--allow-read=./my-patterns.yaml`) to load a real file of your own.

---

<!-- Internal -->

[grid]: ../grid/README.md
[grid-seed-format]: ../grid/README.md#grid-from-a-seed-string
