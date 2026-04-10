import { MIN_GRID_SIZE } from "../constants.ts";
import type { GridSize, Point, ValidationResult } from "../types.ts";

export const validateMinGridSize = (
  gridSize: GridSize,
): ValidationResult => {
  if (gridSize.w < MIN_GRID_SIZE || gridSize.h < MIN_GRID_SIZE) {
    return {
      valid: false,
      message:
        `Grid must be at least ${MIN_GRID_SIZE} cells wide and ${MIN_GRID_SIZE} cells tall`,
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

export const isXInsideBorder = (x: number, worldWidth: number): boolean => {
  return x > -1 && x < worldWidth;
};

export const isYInsideBorder = (y: number, worldHeight: number): boolean => {
  return y > -1 && y < worldHeight;
};

export const isPointInsideBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXInsideBorder(x, w) && isYInsideBorder(y, h);
};

export const gridContains = (
  { outer, inner, offset = { x: 0, y: 0 } }: {
    outer: GridSize;
    inner: GridSize;
    offset?: Point;
  },
): ValidationResult => {
  const effectiveW = offset.x + inner.w;
  const effectiveH = offset.y + inner.h;

  if (
    effectiveW <= outer.w &&
    effectiveH <= outer.h
  ) {
    return { valid: true };
  }

  return {
    valid: false,
    message:
      `Inner grid of size (${inner.w}, ${inner.h}) offset by (${offset.x}, ${offset.y}) does not fit in outer grid of size (${outer.w}, ${outer.h}).`,
  };
};
