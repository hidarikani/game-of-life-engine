/**
 * Error messages thrown by the engine. They live here rather than at
 * their throw sites so that a message used in more than one place —
 * `Grid.fromString` and `stringToGeneration` reject the same malformed
 * seeds, for example — is written once, and so tests can assert against
 * the same text the code throws instead of a hand-copied duplicate.
 *
 * Messages that need runtime values are built by functions taking those
 * values as arguments; the rest are plain string constants.
 *
 * @module
 */

import type { Point } from "../types/geometry.ts";
import type { GridSize } from "../types/grid.ts";

import { MIN_GRID_SIZE } from "./constants.ts";

/** Rejects a seed containing characters outside `SEED_PATTERN`. */
export const SEED_INVALID_CHARACTERS_MESSAGE =
  "Seed contains invalid characters" as const;

/** Rejects a seed whose row count differs from the requested height. */
export const SEED_HEIGHT_MISMATCH_MESSAGE =
  "Seed height does not match specified height" as const;

/** Rejects a seed whose row length differs from the requested width. */
export const SEED_WIDTH_MISMATCH_MESSAGE =
  "Seed width does not match specified width" as const;

/** Rejects a `biasTowardLife` outside the exclusive `(0, 1)` range. */
export const INVALID_BIAS_TOWARD_LIFE_MESSAGE =
  "biasTowardLife must be larger than 0 and less than 1" as const;

/** Rejects a grid with either dimension below `MIN_GRID_SIZE`. */
export const MIN_GRID_SIZE_MESSAGE =
  `Grid must be at least ${MIN_GRID_SIZE} cells wide and ${MIN_GRID_SIZE} cells tall` as const;

/**
 * Rejects a history limit below 1 — an engine always retains at least
 * the present generation.
 */
export function maxHistoryTooSmallMessage(maxHistory: number): string {
  return `maxHistory must be at least 1, got ${maxHistory}`;
}

/** Rejects a point lying beyond the grid's one-cell border ring. */
export function cellOutOfBoundsMessage({ x, y }: Point): string {
  return `Cell (${x}, ${y}) is out of bounds`;
}

/** Rejects a live cell that does not sit strictly inside the grid. */
export function cellOutsideGridMessage(
  { x, y }: Point,
  { w, h }: GridSize,
): string {
  return `Cell at (${x}, ${y}) is outside the grid of size (${w}, ${h}).`;
}

/** Rejects an inner grid that does not fit into the outer grid. */
export function gridDoesNotFitMessage(
  { outer, inner, offset }: {
    outer: GridSize;
    inner: GridSize;
    offset: Point;
  },
): string {
  return `Inner grid of size (${inner.w}, ${inner.h}) offset by (${offset.x}, ${offset.y}) does not fit in outer grid of size (${outer.w}, ${outer.h}).`;
}
