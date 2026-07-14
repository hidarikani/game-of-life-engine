import type { CellChars } from "./types/types.ts";

// Checking if a cell is alive makes sense only if it has neighbours on all around
// which means minimum dimensions are a 3 by 3 when the center cell is checked for life:
// . . .
// . # .
// . . .
export const MIN_GRID_SIZE = 3 as const;

export const ALIVE_CHAR = "#" as const;
export const DEAD_CHAR = "." as const;
export const SEPARATOR_CHAR = " " as const;
export const NEWLINE_CHAR = "\n" as const;

export const SEED_PATTERN = new RegExp(
  `^[${ALIVE_CHAR}${DEAD_CHAR}${SEPARATOR_CHAR}${NEWLINE_CHAR}]*$`,
);

export const CELL_CHAR_TO_BOOL = {
  [ALIVE_CHAR]: true,
  [DEAD_CHAR]: false,
} as const satisfies Record<CellChars, boolean>;

export const GRID_MODES = {
  FINITE: "Finite",
  TOROIDAL: "Toroidal",
} as const;

export const CELL_KEY_SEPARATOR = ",";

export const PLACEMENT_MODES = {
  OVERWRITE: "Overwrite",
  MERGE: "Merge",
} as const;
