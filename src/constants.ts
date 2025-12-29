export const MIN_WORLD_WIDTH = 3 as const;
export const MIN_WORLD_HEIGHT = 3 as const;

export const CELL_ALIVE_CHAR = "#" as const;
export const CELL_DEAD_CHAR = "." as const;

export const CELL_CHAR_TO_BOOL: Record<string, boolean> = {
  [CELL_ALIVE_CHAR]: true,
  [CELL_DEAD_CHAR]: false,
};

export const GRID_MODES = {
  FINITE: "Finite",
  TOROIDAL: "Toroidal",
} as const;
