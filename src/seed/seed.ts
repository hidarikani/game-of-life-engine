import type { Point } from "../types/geometry.ts";
import type { CellChars, CellKey, LiveCells } from "../types/cell.ts";
import type { GridSize } from "../types/grid.ts";

import {
  ALIVE_CHAR,
  CELL_CHAR_TO_BOOL,
  CELL_KEY_SEPARATOR,
  DEAD_CHAR,
  NEWLINE_CHAR,
  SEED_PATTERN,
  SEPARATOR_CHAR,
} from "../constants/constants.ts";
import {
  INVALID_BIAS_TOWARD_LIFE_MESSAGE,
  SEED_HEIGHT_MISMATCH_MESSAGE,
  SEED_INVALID_CHARACTERS_MESSAGE,
  SEED_WIDTH_MISMATCH_MESSAGE,
} from "../constants/messages.ts";

/**
 * Serializes a point as an `"x,y"` string so it can be used as a `Map`
 * key — two equal points would otherwise be distinct keys by object
 * identity. Inverse of `cellKeyToPoint`.
 */
export function pointToCellKey({ x, y }: Point): CellKey {
  return `${x}${CELL_KEY_SEPARATOR}${y}`;
}

/** Parses an `"x,y"` cell key back into a point. Inverse of `pointToCellKey`. */
export function cellKeyToPoint(key: CellKey): Point {
  const [x, y] = key.split(CELL_KEY_SEPARATOR).map(Number);
  return { x, y };
}

/**
 * Strips leading/trailing whitespace from a seed string and from each of
 * its rows, so seeds written as indented template literals parse cleanly.
 */
export function normalizeSeed(seed: string): string {
  return seed
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

/**
 * Splits a normalized seed string into rows of cell states. Expects
 * input that has already passed `SEED_PATTERN` validation and
 * `normalizeSeed`; unexpected characters yield `undefined` entries.
 */
export function splitSeed(normalizedSeed: string): boolean[][] {
  return normalizedSeed.split(NEWLINE_CHAR).map((row) =>
    row.split(SEPARATOR_CHAR).map((char) =>
      CELL_CHAR_TO_BOOL[char as CellChars]
    )
  );
}

/**
 * Parses a seed string into sparse live-cell storage. Inverse of
 * `generationToString`.
 *
 * @throws If the seed contains invalid characters or its dimensions
 * don't match `width` and `height`.
 */
export function stringToGeneration(
  seed: string,
  width: number,
  height: number,
): LiveCells {
  if (!SEED_PATTERN.test(seed)) {
    throw new Error(SEED_INVALID_CHARACTERS_MESSAGE);
  }

  const normalizedSeed = normalizeSeed(seed);

  const rows = normalizedSeed.split("\n").map((row) =>
    row.split(SEPARATOR_CHAR).map((char) =>
      CELL_CHAR_TO_BOOL[char as CellChars]
    )
  );

  if (rows.length !== height) {
    throw new Error(SEED_HEIGHT_MISMATCH_MESSAGE);
  }

  for (const row of rows) {
    if (row.length !== width) {
      throw new Error(SEED_WIDTH_MISMATCH_MESSAGE);
    }
  }

  const aliveCells: LiveCells = new Set();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellState = rows[y][x];
      if (cellState) {
        const key = pointToCellKey({ x, y });
        aliveCells.add(key);
      }
    }
  }

  return aliveCells;
}

/**
 * Renders sparse live-cell storage as a seed string. Inverse of
 * `stringToGeneration`.
 */
export function generationToString(
  generation: LiveCells,
  size: GridSize,
): string {
  let res = "";
  for (let y = 0; y < size.h; y++) {
    const row: string[] = [];
    for (let x = 0; x < size.w; x++) {
      const key = pointToCellKey({ x, y });
      const isAlive = generation.has(key);
      row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
    }
    res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
  }
  return res.trim();
}

/**
 * Generates a random seed string for a grid of the given size.
 *
 * @param size Dimensions of the seed to generate.
 * @param biasTowardLife Probability that any given cell starts alive.
 * A cell is alive if a random `[0, 1)` draw is less than this value, so
 * higher values yield more alive cells and lower values more dead ones.
 * Defaults to `0.5` (even split).
 * @throws If `biasTowardLife` is not strictly between 0 and 1.
 */
export function randomizeSeed(
  size: GridSize,
  biasTowardLife: number = 0.5,
): string {
  if (biasTowardLife <= 0 || biasTowardLife >= 1) {
    throw new Error(INVALID_BIAS_TOWARD_LIFE_MESSAGE);
  }

  let res = "";
  for (let y = 0; y < size.h; y++) {
    const row: string[] = [];
    for (let x = 0; x < size.w; x++) {
      const isAlive = Math.random() < biasTowardLife;
      row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
    }
    res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
  }
  return res.trim();
}
