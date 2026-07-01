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

export type PlacementMode = "Overwrite" | "Merge";

export interface IGrid {
  readonly gridSize: GridSize;
  readonly mode: GridMode;
  readonly liveCells: { key: Point; value: boolean }[];
  readonly population: number;
  readCell({ x, y }: Point): boolean;
  writeGrid(params: {
    inner: IGrid;
    offset?: Point;
    mode?: PlacementMode;
  }): void;
  toString(): string;
}

export type GridOptionsFromLiveCells = {
  gridSize: GridSize;
  liveCells?: LiveCells;
  mode?: GridMode;
};

export type GridOptionsFromString = {
  gridSize: GridSize;
  seed: string;
  mode?: GridMode;
};

export interface IEngine {
  readonly historyLength: number;
  getGeneration(i: number): IGrid;
  readonly firstGeneration: IGrid;
  readonly presentGeneration: IGrid;
  readonly gridSize: GridSize;
  readonly mode: GridMode;
  readonly maxHistory: number;
}

export type EngineOptions = {
  firstGeneration: IGrid;
  maxHistory?: number;
};

export type PatternType = "still-life" | "oscillator" | "spaceship";

export type Pattern = {
  key: string;
  displayName: string;
  type: PatternType;
  period: number;
  generations: IGrid[];
};

export type PatternFilter = {
  name: RegExp | null;
  patternType: PatternType | null;
};

export interface IPatternLib {
  getPatterns(filter: PatternFilter | null): Pattern[];
  getPatternByKey(key: string): Pattern;
}

export type PatternsYaml = {
  patterns: {
    name: string;
    type: PatternType;
    period: number;
    width: number;
    height: number;
    generations: { state: string }[];
  }[];
};
