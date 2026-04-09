export type Point = {
  x: number;
  y: number;
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
  cell({ x, y }: Point): boolean;
  population(): number;
  contains(params: { inner: IGrid; offset?: Point }): ValidationResult;
  place(params: {
    inner: IGrid;
    offset?: Point;
    mode?: PlacementMode;
  }): void;
  toString(): string;
}

export type GridOptions = {
  bottomRightCorner: Point;
  liveCells?: LiveCells;
  mode?: GridMode;
};

export type EngineOptions = {
  gridSize: Point;
  mode?: GridMode;
  seed?: IGrid;
};

export type PlacementMode = "Overwrite" | "Merge";
