import type { GRID_MODES, PLACEMENT_MODES } from "../constants.ts";

/**
 * A coordinate on a grid. The origin `(0, 0)` is the top-left cell;
 * `x` grows rightward and `y` grows downward.
 */
export type Point = {
  /** Zero-based column index. */
  x: number;
  /** Zero-based row index. */
  y: number;
};

/**
 * Dimensions of a grid, measured in cells. Both dimensions must be at
 * least `MIN_GRID_SIZE` for a grid to be constructible.
 */
export type GridSize = {
  /** Width in cells. */
  w: number;
  /** Height in cells. */
  h: number;
};

/** The two characters a seed string may use for a cell: alive or dead. */
export type CellChars = "#" | ".";

/**
 * Determines how a grid treats its border.
 *
 * - `"Finite"` — cells beyond the edge are permanently dead.
 * - `"Toroidal"` — the edges wrap around, so the left border is the
 *   right column's neighbor and the top border is the bottom row's neighbor.
 *
 * Derived from `GRID_MODES` so the type and the constants cannot drift apart.
 */
export type GridMode = (typeof GRID_MODES)[keyof typeof GRID_MODES];

/**
 * A `Point` serialized as `"x,y"`, used as a `Map` key because object
 * identity would make two equal points distinct keys.
 */
export type CellKey = `${number},${number}`;

/**
 * Sparse storage of a grid's living cells. Only live cells are present;
 * absence of a key means the cell is dead.
 */
export type LiveCells = Map<CellKey, boolean>;

/**
 * Outcome of a validation check. When `valid` is `false`, `message`
 * explains the failure in human-readable form.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Determines how an inner grid is placed onto an outer grid.
 *
 * - `"Overwrite"` — the target rectangle is cleared first, so dead cells
 *   in the inner grid erase live cells underneath.
 * - `"Merge"` — only the inner grid's live cells are copied; existing
 *   live cells outside them survive.
 *
 * Derived from `PLACEMENT_MODES` so the type and the constants cannot
 * drift apart.
 */
export type PlacementMode =
  (typeof PLACEMENT_MODES)[keyof typeof PLACEMENT_MODES];

/**
 * A two-dimensional collection of cells. Coordinates just outside the
 * grid (the one-cell border ring) are readable so a simulation can count
 * the neighbors of edge cells; how the border behaves depends on `mode`.
 */
export interface IGrid {
  /** Dimensions of the grid in cells. */
  readonly gridSize: GridSize;
  /** Border behavior of the grid. */
  readonly mode: GridMode;
  /** Coordinates of every living cell, in no guaranteed order. */
  readonly liveCells: readonly Point[];
  /** Number of living cells. */
  readonly population: number;
  /**
   * Reads a cell's state. Border coordinates resolve according to `mode`;
   * coordinates beyond the border ring throw.
   */
  readCell({ x, y }: Point): boolean;
  /**
   * Sets a cell's state. Writes to the border are ignored in `"Finite"`
   * mode and wrap around in `"Toroidal"` mode; coordinates beyond the
   * border ring throw.
   */
  writeCell({ x, y }: Point, value: boolean): void;
  /**
   * Places `inner` onto this grid at `offset`, using the given placement
   * `mode`. Throws when the inner grid does not fit.
   */
  writeGrid(params: {
    inner: IGrid;
    offset?: Point;
    mode?: PlacementMode;
  }): void;
  /** Renders the grid in the seed string format (`#`/`.`). */
  toString(): string;
  /**
   * Compares dimensions, border behavior (`mode`), population, and every
   * live cell's state.
   */
  equals(other: IGrid): boolean;
}

/**
 * Options for constructing a grid from a sparse map of live cells.
 * Every cell must lie inside the grid; `mode` defaults to `"Finite"`.
 */
export type GridOptionsFromLiveCells = {
  /** Dimensions of the new grid. */
  gridSize: GridSize;
  /** Initial living cells; omit for an empty grid. */
  liveCells?: LiveCells;
  /** Border behavior; defaults to `"Finite"`. */
  mode?: GridMode;
};

/**
 * Options for constructing a grid from a seed string. The seed's rows
 * and columns must match `gridSize` exactly.
 */
export type GridOptionsFromString = {
  /** Dimensions of the new grid. */
  gridSize: GridSize;
  /**
   * Cell rows as text: `#` for alive, `.` for dead, cells separated by
   * spaces and rows by newlines. Surrounding whitespace is tolerated.
   */
  seed: string;
  /** Border behavior; defaults to `"Finite"`. */
  mode?: GridMode;
};

/**
 * Runs a Game of Life simulation, keeping a bounded history of the most
 * recent generations.
 */
export interface IEngine {
  /** Number of generations currently retained, including the present one. */
  readonly historyLength: number;
  /**
   * Returns the retained generation at index `i`, where `0` is the oldest
   * retained generation — not necessarily the original seed once history
   * has been trimmed.
   */
  getGeneration(i: number): IGrid;
  /** The oldest retained generation. */
  readonly firstGeneration: IGrid;
  /** The most recent generation. */
  readonly presentGeneration: IGrid;
  /** Dimensions shared by every generation. */
  readonly gridSize: GridSize;
  /** Border behavior shared by every generation. */
  readonly mode: GridMode;
  /** Maximum number of generations retained before the oldest is dropped. */
  readonly maxHistory: number;
}

/** Options for constructing an engine. */
export type EngineOptions = {
  /** The seed grid the simulation evolves from. */
  firstGeneration: IGrid;
  /**
   * Maximum number of generations to retain; must be at least 1.
   * Defaults to 3.
   */
  maxHistory?: number;
};
