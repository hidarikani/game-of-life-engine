export type Point = {
  x: number;
  y: number;
};

export type Rectangle = {
  w: number;
  h: number;
};

export type CellChars = "#" | ".";

export type GridMode = "Finite" | "Toroidal";

export type WorldOptions = {
  gridSize: Rectangle;
  mode?: GridMode;
  seed?: string;
};

export type CellKey = `${number},${number}`;

export type LiveCells = Map<CellKey, boolean>;

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export interface IGrid {
  readonly bottomRightCorner: Point;
  readonly liveCells: LiveCells;
  contains(params: { inner: IGrid; offset?: Point }): ValidationResult;
  place(params: {
    inner: IGrid;
    offset?: Point;
    mode?: PlacementMode;
  }): void;
}

export type PlacementMode = "Overwrite" | "Merge";
