import { MIN_WORLD_HEIGHT, MIN_WORLD_WIDTH } from "../constants.ts";
import type { GridSize, Point, ValidationResult } from "../types.ts";

export const validateMinGridSize = (
  gridSize: GridSize,
): ValidationResult => {
  if (gridSize.w - 1 < MIN_WORLD_WIDTH) {
    return {
      valid: false,
      message: `Width must be at least ${MIN_WORLD_WIDTH}`,
    };
  }
  if (gridSize.h < MIN_WORLD_HEIGHT) {
    return {
      valid: false,
      message: `Height must be at least ${MIN_WORLD_HEIGHT}`,
    };
  }
  return { valid: true };
};

const isXOutsideBorder = (x: number, worldWidth: number): boolean => {
  return x < -1 || x > worldWidth;
};

const isYOutsideBorder = (y: number, worldHeight: number): boolean => {
  return y < -1 || y > worldHeight;
};

export const isPointOutsideBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXOutsideBorder(x, w) || isYOutsideBorder(y, h);
};

const isXOnBorder = (x: number, worldWidth: number): boolean => {
  return x === -1 || x === worldWidth;
};

const isYOnBorder = (y: number, worldHeight: number): boolean => {
  return y === -1 || y === worldHeight;
};

export const isPointOnBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXOnBorder(x, w) || isYOnBorder(y, h);
};
