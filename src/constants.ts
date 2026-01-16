import type { CellChars } from "./types.ts";

export const MIN_WORLD_WIDTH = 3 as const;
export const MIN_WORLD_HEIGHT = 3 as const;

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
