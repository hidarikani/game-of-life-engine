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
- Named top-level functions MUST be written as `function` declarations, not as
  arrow functions assigned to `const`. Declarations are hoisted (so files can be
  organized public-API-first and they stay safe under circular imports), read as
  named API surface, and their braced bodies give the debugger real statements
  to break on.
- Arrow functions SHALL be reserved for nested and anonymous callbacks (e.g.
  `map`/`filter` lambdas), where their lexical `this` and terseness are the
  point. A non-trivial callback SHOULD be extracted into a named `function`
  declaration so it appears by name in stack traces and profiles.

### Testing

- Tests SHALL be written in the BDD style, using `describe` to group cases and
  `it` to declare them, as described in the [Deno BDD tutorial][bdd-tutorial]
  and provided by [`@std/testing/bdd`][std-bdd].
- The outermost `describe` SHALL name the unit under test (e.g. `Grid`, `seed`),
  with nested `describe` blocks naming the method or behaviour being exercised.
  This keeps the `deno test` output readable as a specification.
- Assertions SHALL come from [`@std/assert`][std-assert].
- Fixtures shared by several cases SHOULD be created in a `beforeEach` hook
  rather than repeated inline. `beforeAll` SHALL be reserved for fixtures that
  are either read-only or deliberately mutated in sequence by successive cases;
  where a group relies on that sequencing, it MUST say so in a comment.

### Import Order

As of Deno 2.9.x, `deno fmt` does not enforce import ordering, so we follow this
convention manually:

1. Type imports (`import type`)
2. Deno standard library imports
3. Third-party / other-directory imports
4. Same-directory (relative) imports

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
[std-assert]: https://jsr.io/@std/assert
[std-bdd]: https://jsr.io/@std/testing/doc/bdd
[bdd-tutorial]: https://docs.deno.com/examples/bdd_tutorial/
[rfc-2119]: https://www.rfc-editor.org/rfc/rfc2119.html
