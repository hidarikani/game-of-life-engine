# Development

## Dependencies

Runs on [Deno][deno]. Tested with `2.9.x`.

> [!TIP]
> To check local deno version `deno --version`. To check package dependendies
> see [deno.json][deno-json].

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

- `Engine` — main entry point; holds grid state and generation history;
  `evolveGrid()` advances one generation, `evolveCell(point)` applies GoL rules
  to one cell
- `Grid` (implements `IGrid`) — grid operations: `place()`, `contains()`,
  `fromString()`; composite/merge support

**Grid modes:**

- `Finite` — border cells are permanently dead
- `Toroidal` — edges wrap (donut topology)

**Cell storage:** `Map<CellKey, boolean>` where `CellKey = "x,y"`. Only live
cells are stored.

**Minimum grid size:** 3×3 (needed to check all 8 neighbors of a center cell).

## Quality Assurance

> [!WARNING]
> Some tests require file read permission, because the [PatternLib][pattern-lib]
> can read patterns defined in [YAML][yaml] files.

Deno native quality assurance tools SHALL be executed after making changes:

- [deno fmt][deno-fmt]
- [deno check][deno-check]
- [deno lint][deno-lint]
- [deno test][deno-test]

Automated test suite SHALL be executed before commiting:

```bash
# run unit tests in watch mode, human oriented
deno task test:watch
deno task test:watch:geometry # subset shortcut
# automation, agentic coding oriented
test:once
deno task test:once:geometry # subset shortcut
```

Uses Deno's built-in test runner with `@std/assert`. Tests are hierarchical —
`Deno.test()` with nested `t.step()`.

Test files SHALL be colocated with source files, for example:

```
src/
└── engine/       
    ├─ engine.ts
    └── engine.test.ts
```

## Version Control

Repository SHALL be versioned using `git` then pushet to GitHub. Repo `main`
branch is protected with "Require linear history" which means pull requests MUST
be squashed:

```bash
gh pr merge <number> --squash
```

### Publishing

This package SHALL be published to [JSR][jsr] on PUSH to `origin/main` via the
[publish workflow][publish-workflow] on every push to `orign/main`.

> [!TIP]
> The package version is set in [`deno.json`][deno-json]. The continuous
> integration is implemented with GitHub Actions.

JSR doesn't resolve raw text imports (`with { type: "text" }`), so the ˝built-in
patterns can't be inlined straight from [`patterns.yaml`][patterns-yaml].
Instead, [`PatternLib.fromBuiltInData()`][pattern-lib] imports a generated
[`patterns.json`][patterns-json] (via a stable `with { type: "json" }` import).
The following task SHALL be executed after editing
[`patterns.yaml`][patterns-yaml] to keep the JSON in sync. The resulting JSON
MUST be commited.

```bash
deno task patterns:build
```

The publish workflow also runs this task before publishing, so CI's copy is
always regenerated fresh from `patterns.yaml` — but a stale, uncommitted
`patterns.json` will still fail a local dry run, since `deno publish` refuses to
publish with uncommitted changes.

Because CI publishes on a version that's already merged to `main`, publish-time
issues (like an unresolvable import) are otherwise only caught after the fact.
To catch these earlier, dry-run a publish locally before merging:

```bash
deno publish --dry-run
```

This runs the same checks as CI (types, slow types, file resolution) without
uploading anything. If it succeeds locally, `deno publish` (the command CI runs)
should succeed too.

To publish for real from a local machine — for example to hotfix a release
without waiting on CI — regenerate `patterns.json` first (if `patterns.yaml`
changed), then run:

```bash
deno publish
```

<!-- Internal -->

[publish-workflow]: .github/workflows/publish.yml
[deno-json]: deno.json
[pattern-lib]: ./src/patterns/pattern.ts
[patterns-yaml]: ./data/patterns/patterns.yaml
[patterns-json]: ./data/patterns/patterns.json

<!-- External -->

[deno]: https://deno.com/
[deno-check]: https://docs.deno.com/runtime/reference/cli/check/
[deno-lint]: https://docs.deno.com/runtime/reference/cli/lint/
[deno-fmt]: https://docs.deno.com/runtime/reference/cli/fmt/
[deno-test]: https://docs.deno.com/runtime/reference/cli/test/
[yaml]: https://yaml.org/
