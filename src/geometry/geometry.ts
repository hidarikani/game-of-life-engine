import type { ValidationResult } from "../types/validation.ts";
import type { Point } from "../types/geometry.ts";
import type { LiveCells } from "../types/cell.ts";
import type { GridSize } from "../types/grid.ts";

import { MIN_GRID_SIZE } from "../constants.ts";
import { cellKeyToPoint } from "../seed/seed.ts";

/**
 * Checks that both grid dimensions meet `MIN_GRID_SIZE` — the smallest
 * grid in which a center cell has neighbors on all sides.
 */
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

/**
 * Whether a point lies beyond the grid's one-cell border ring — i.e.
 * outside even the addressable coordinates `-1` through `w`/`h`. Such
 * points are out of bounds for both reading and writing.
 */
export const isPointOutsideBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXOutsideBorder(x, w) || isYOutsideBorder(y, h);
};

/** Whether an x coordinate sits on the border column left of the grid (`-1`). */
export const isXOnLeftBorder = (x: number): boolean => x === -1;

/** Whether an x coordinate sits on the border column right of the grid (`w`). */
export const isXOnRightBorder = (x: number, worldWidth: number): boolean =>
  x === worldWidth;

const isXOnBorder = (x: number, worldWidth: number): boolean =>
  isXOnLeftBorder(x) || isXOnRightBorder(x, worldWidth);

/** Whether a y coordinate sits on the border row above the grid (`-1`). */
export const isYOnTopBorder = (y: number): boolean => y === -1;

/** Whether a y coordinate sits on the border row below the grid (`h`). */
export const isYOnBottomBorder = (y: number, worldHeight: number): boolean =>
  y === worldHeight;

const isYOnBorder = (y: number, worldHeight: number): boolean =>
  isYOnTopBorder(y) || isYOnBottomBorder(y, worldHeight);

/**
 * Whether a point lies on the grid's one-cell border ring (`-1` or
 * `w`/`h` on either axis) — addressable, but outside the playable area.
 */
export const isPointOnBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXOnBorder(x, w) || isYOnBorder(y, h);
};

/** Whether an x coordinate lies strictly inside the grid (`0` to `w - 1`). */
export const isXInsideBorder = (x: number, worldWidth: number): boolean => {
  return x > -1 && x < worldWidth;
};

/** Whether a y coordinate lies strictly inside the grid (`0` to `h - 1`). */
export const isYInsideBorder = (y: number, worldHeight: number): boolean => {
  return y > -1 && y < worldHeight;
};

/** Whether a point lies strictly inside the grid — the playable area. */
export const isPointInsideBorder = (
  { x, y }: Point,
  { w, h }: GridSize,
): boolean => {
  return isXInsideBorder(x, w) && isYInsideBorder(y, h);
};

/**
 * Checks that an inner grid, shifted by `offset` (default `(0, 0)`),
 * fits entirely within the outer grid. Negative offsets are not
 * rejected here; callers are expected to pass non-negative offsets.
 */
export const gridContainsGrid = (
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

/**
 * Checks that every cell in the sparse map lies strictly inside the
 * grid — border-ring coordinates are rejected. Reports the first
 * offending cell.
 */
export const gridContainsCells = (
  { outer, inner }: { outer: GridSize; inner: LiveCells },
): ValidationResult => {
  for (const key of inner.keys()) {
    const point = cellKeyToPoint(key);
    if (!isPointInsideBorder(point, outer)) {
      return {
        valid: false,
        message:
          `Cell at (${point.x}, ${point.y}) is outside the grid of size (${outer.w}, ${outer.h}).`,
      };
    }
  }
  return { valid: true };
};
