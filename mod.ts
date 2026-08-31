/**
 * A Conway's Game of Life engine with pluggable border behavior
 * (finite or toroidal), a bounded generation history, and a built-in
 * library of well-known patterns.
 *
 * @example
 * ```ts
 * import { Engine, Grid } from "@hidarikani/game-of-life-engine";
 *
 * const firstGeneration = Grid.fromString({
 *   gridSize: { w: 5, h: 5 },
 *   seed: `. . . . .
 *          . . # . .
 *          . . # . .
 *          . . # . .
 *          . . . . .`,
 * });
 *
 * const engine = new Engine({ firstGeneration });
 * engine.evolveGrid();
 * console.log(engine.toString());
 * ```
 *
 * @module
 */
export { Grid } from "./src/grid/grid.ts";
export { Engine } from "./src/engine/engine.ts";
export { PatternLib } from "./src/patterns/pattern.ts";
export { GRID_MODES, PATTERN_TYPES, PLACEMENT_MODES } from "./src/constants.ts";
export { pointToCellKey } from "./src/seed/seed.ts";
export type {
  EngineOptions,
  GridMode,
  GridOptionsFromLiveCells,
  GridOptionsFromString,
  GridSize,
  IEngine,
  IGrid,
  LiveCells,
  PlacementMode,
  Point,
} from "./src/types/types.ts";
export type {
  IPatternLib,
  Pattern,
  PatternFilter,
  PatternType,
} from "./src/types/patterns.ts";
