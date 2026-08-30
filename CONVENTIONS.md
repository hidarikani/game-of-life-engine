# Conventions

## Language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**,
**SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this
document are to be interpreted as defined in [RFC 2119][rfc-2119]. In brief:
**MUST** (or **REQUIRED**) denotes an absolute requirement — for example,
"implementations MUST validate the signature before processing the payload."
**MUST NOT** denotes an absolute prohibition — for example, "a client MUST NOT
retry a request that has already succeeded." **SHOULD** indicates a strong
recommendation that may be set aside only when the implications are fully
understood, while **SHOULD NOT** indicates the inverse. **MAY** (or
**OPTIONAL**) indicates a feature is genuinely optional and left to the
implementer's discretion. These terms carry their defined meaning only when
capitalized as shown; in lowercase they are ordinary English words without
normative force.

## Deno and JSR

Some conventions stem from the decision to base the project on [Deno][deno] and
publish it to [JSR][jsr]. Publishing settings are defined in
[deno.json][deno-config].

## Markdown Docs

- GitHub Flavored Markdown SHALL be used. This allows for the use of emojis and
  alerts.
- Reference-style links SHALL be used. References SHALL be grouped into
  "internal" and "external" sections. See the example at the end of this file.

- [README.md][readme] — first thing the user reads. Contains installation and
  quick-start guide. Links to advanced topics. MUST NOT repeat information
  already defined in other docs; it should reference them instead.
- [AGENTS.md][agents] — vendor-agnostic agentic instructions. Instead of
  repeating information from other files, it should use references.
- [CONVENTIONS.md][conventions] — project organization conventions (this file).
- [DEVELOPMENT.md][dev] — information on coding, quality assurance and
  publishing.
- [CONTRIBUTING.md][contrib] — explains how contributions are handled
- [LICENSE][license]

Each major entity (`Grid`, `Engine`, etc.) has its own colocated doc file and
`*.demo.ts` file (e.g. `src/grid/GRID.md`, `src/grid/grid.demo.ts`).

- The doc file's code examples MUST match the demo file line for line — the demo
  is runnable proof that the doc file's examples actually work.
- The demo file imports from `mod.ts` (not individual `src/` files) to simulate
  how a real consumer of the published package interacts with the library.

## JSDoc

Major code symbols SHALL be documented with [JSDoc][js-doc]. Since the project
is TypeScript-first, JSDoc comments SHALL NOT duplicate type information already
enforced by the TypeScript compiler (e.g. `@param {string}` on an already-typed
parameter). Instead, use JSDoc to explain intent, constraints, and edge cases
the type signature can't convey — this includes documenting `type` and
`interface` definitions, and their individual members.

It's worth mentioning that packages documented with [JSDoc][js-doc] receive a
higher score from [JSR][jsr].

## Code Conventions

- Classes: `PascalCase` (Engine, Grid)
- Functions/methods: `camelCase` (evolveCell, getCell)
- Constants: `UPPER_SNAKE_CASE` (MIN_WORLD_WIDTH, GRID_MODES)
- Types/interfaces: `PascalCase` (Point, Rectangle, GridMode, EngineOptions)
- Private fields use `#` syntax (e.g., `#liveCells`, `#bottomRightCorner`)
- One main class per file; tests colocated as `*.test.ts`

## Other

> [!TIP]
> Use the following symbols for drawing folder trees: `├──`, `└──`, `│`.

<!-- Internal -->

[deno-config]: ./deno.json
[readme]: ./README.md
[agents]: ./AGENTS.md
[dev]: ./DEVELOPMENT.md
[conventions]: ./CONVENTIONS.md
[contrib]: ./CONTRIBUTING.md
[license]: ./LICENSE

<!-- External -->

[deno]: https://deno.com/
[jsr]: https://jsr.io
[js-doc]: https://jsdoc.app/
[rfc-2119]: https://www.rfc-editor.org/rfc/rfc2119.html
