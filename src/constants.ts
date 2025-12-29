import type { CellChars } from "./types.ts";

export const MIN_WORLD_WIDTH = 3 as const;
export const MIN_WORLD_HEIGHT = 3 as const;

export const ALIVE_CHAR = "#" as const;
export const DEAD_CHAR = "." as const;
export const SPACE_CHAR = " " as const;
export const NEWLINE_CHAR = "\n" as const;

export const SEED_PATTERN = new RegExp(
  `^[${ALIVE_CHAR}${DEAD_CHAR}${SPACE_CHAR}${NEWLINE_CHAR}]*$`,
);

export const CELL_CHAR_TO_BOOL: Record<CellChars, boolean> = {
  [ALIVE_CHAR]: true,
  [DEAD_CHAR]: false,
};

export const GRID_MODES = {
  FINITE: "Finite",
  TOROIDAL: "Toroidal",
} as const;
