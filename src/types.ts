export type Point = {
  x: number;
  y: number;
};

export type GridSize = {
  w: number;
  h: number;
};

export type CellChars = "#" | ".";

export type GridMode = "Finite" | "Toroidal";

export type CellKey = `${number},${number}`;

export type LiveCells = Map<CellKey, boolean>;

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export interface IGrid {
  readonly bottomRightCorner: Point;
  readonly liveCells: { key: Point; value: boolean }[];
  readCell({ x, y }: Point): boolean;
  population(): number;
  contains(params: { inner: IGrid; offset?: Point }): ValidationResult;
  writeCell(params: {
    inner: IGrid;
    offset?: Point;
    mode?: PlacementMode;
  }): void;
  toString(): string;
}

export type GridOptions = {
  gridSize: GridSize;
  liveCells?: LiveCells;
  mode?: GridMode;
};

export type EngineOptions = {
  gridSize: Point;
  mode?: GridMode;
  seed?: IGrid;
};

export type PlacementMode = "Overwrite" | "Merge";
