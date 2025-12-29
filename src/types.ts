export type Point = {
  x: number;
  y: number;
};

export type GridMode = "Finite" | "Toroidal";

export type WorldOptions = {
  width: number;
  height: number;
  mode?: GridMode;
  seed?: string;
};

export type Generation = Map<string, boolean>;
