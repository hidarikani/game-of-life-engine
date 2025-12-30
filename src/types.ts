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
  width: number;
  height: number;
  mode?: GridMode;
  seed?: string;
};

export type Generation = Map<string, boolean>;
