import type { CellChars } from "./types/types.ts";

/**
 * Smallest allowed grid dimension. Checking whether a cell lives or dies
 * only makes sense when it has neighbors on all sides, which requires at
 * least a 3-by-3 grid with the center cell being checked:
 *
 * ```
 * . . .
 * . # .
 * . . .
 * ```
 */
export const MIN_GRID_SIZE = 3 as const;

/** Character that marks a living cell in seed strings. */
export const ALIVE_CHAR = "#" as const;

/** Character that marks a dead cell in seed strings. */
export const DEAD_CHAR = "." as const;

/** Character that separates cells within a row of a seed string. */
export const SEPARATOR_CHAR = " " as const;

/** Character that separates rows of a seed string. */
export const NEWLINE_CHAR = "\n" as const;

/**
 * Matches seed strings composed only of the allowed characters.
 * Used to reject malformed seeds before parsing.
 */
export const SEED_PATTERN = new RegExp(
  `^[${ALIVE_CHAR}${DEAD_CHAR}${SEPARATOR_CHAR}${NEWLINE_CHAR}]*$`,
);

/** Maps a seed string character to the cell state it represents. */
export const CELL_CHAR_TO_BOOL = {
  [ALIVE_CHAR]: true,
  [DEAD_CHAR]: false,
} as const satisfies Record<CellChars, boolean>;

/**
 * The available border behaviors, as named constants. Prefer these over
 * string literals when constructing a grid — see `GridMode` for what
 * each mode means.
 */
export const GRID_MODES = {
  FINITE: "Finite",
  TOROIDAL: "Toroidal",
} as const;

/** Separator between the coordinates in a serialized cell key (`"x,y"`). */
export const CELL_KEY_SEPARATOR = ",";

/**
 * The available placement behaviors for writing one grid onto another,
 * as named constants. Prefer these over string literals — see
 * `PlacementMode` for what each mode means.
 */
export const PLACEMENT_MODES = {
  OVERWRITE: "Overwrite",
  MERGE: "Merge",
} as const;

/**
 * The available pattern classifications, as named constants. Prefer
 * these over string literals — see `PatternType` for what each
 * classification means.
 */
export const PATTERN_TYPES = {
  STILL_LIFE: "still-life",
  OSCILLATOR: "oscillator",
  SPACESHIP: "spaceship",
} as const;
