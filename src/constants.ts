export enum GridMode {
  Finite,
  Toroidal,
}

export const MIN_WORLD_WIDTH = 3;
export const MIN_WORLD_HEIGHT = 3;

export const CELL_ALIVE_CHAR = "#";
export const CELL_DEAD_CHAR = ".";

export const CELL_CHAR_TO_BOOL: Record<string, boolean> = {
  [CELL_ALIVE_CHAR]: true,
  [CELL_DEAD_CHAR]: false,
};
