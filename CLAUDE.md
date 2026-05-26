# CLAUDE.md

## Project Overview

Conway's Game of Life simulation engine published as a JSR package (`@hidarikani/game-of-life-engine`). Written in TypeScript, runs on Deno. The library lets consumers programmatically simulate cellular automaton evolution with configurable grid sizes and boundary conditions.

## Commands

```bash
# Run tests once (for agents — run this after every code change)
deno task test:agent

# Run tests (watch mode, for human developers)
deno task test:watch

# Publish (CI handles this automatically on push to main)
npx jsr publish
```

## Architecture

```
src/
├── engine/       # Core Engine class (simulation runner)
├── grid/         # Grid class implementing IGrid
├── geometry/     # Border detection utilities
├── seed/         # Seed string parsing/generation
├── types.ts      # All shared TypeScript types
└── constants.ts  # MIN_WORLD_WIDTH, GRID_MODES, etc.
mod.ts            # Public package exports
patterns.yaml     # Named Game of Life patterns (e.g., Blinker)
```

**Key classes:**
- `Engine` — main entry point; holds grid state and generation history; `evolveGrid()` advances one generation, `evolveCell(point)` applies GoL rules to one cell
- `Grid` (implements `IGrid`) — grid operations: `place()`, `contains()`, `fromString()`; composite/merge support

**Grid modes:**
- `Finite` — border cells are permanently dead
- `Toroidal` — edges wrap (donut topology)

**Cell storage:** `Map<CellKey, boolean>` where `CellKey = "x,y"`. Only live cells are stored.

**Minimum grid size:** 3×3 (needed to check all 8 neighbors of a center cell).

## Code Conventions

- Classes: `PascalCase` (Engine, Grid)
- Functions/methods: `camelCase` (evolveCell, getCell)
- Constants: `UPPER_SNAKE_CASE` (MIN_WORLD_WIDTH, GRID_MODES)
- Types/interfaces: `PascalCase` (Point, Rectangle, GridMode, EngineOptions)
- Private fields use `#` syntax (e.g., `#liveCells`, `#bottomRightCorner`)
- One main class per file; tests colocated as `*.test.ts`

## Testing

Uses Deno's built-in test runner with `@std/assert`. Tests are hierarchical — `Deno.test()` with nested `t.step()`.

```bash
deno task test:watch
```

Test files live alongside source: `engine.test.ts`, `grid.test.ts`, `geometry.test.ts`, `seed.test.ts`.

When adding features, add tests in the colocated `.test.ts` file. Validate with real behavior — no mocking of core data structures.

## Dependencies

- **Runtime:** none (self-contained)
- **Test:** `@std/assert@1.0.16`
- **Toolchain:** Deno 2.5.x, JSR for publishing

## Publishing

CI (`.github/workflows/publish.yml`) auto-publishes to JSR on push to `main` using `npx jsr publish`. Version is set in `deno.json`.

## Git / GitHub

`origin/main` is protected: linear history only, **squash merge only** (no regular merge commits).

- Always merge PRs with `gh pr merge <number> --squash`
- After a squash merge, all branch commits are folded into one commit on main. Do not rebase the working branch onto main — reset directly instead: `git reset --hard origin/main`
- After resetting a working branch, the remote will be out of sync — force push with `git push --force-with-lease`
