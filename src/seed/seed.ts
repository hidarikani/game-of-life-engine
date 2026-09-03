import type { Point } from "../types/geometry.ts";
import type {
  CellChars,
  CellKey,
  GridSize,
  LiveCells,
} from "../types/types.ts";
import {
  ALIVE_CHAR,
  CELL_CHAR_TO_BOOL,
  CELL_KEY_SEPARATOR,
  DEAD_CHAR,
  NEWLINE_CHAR,
  SEED_PATTERN,
  SEPARATOR_CHAR,
} from "../constants.ts";

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
export const normalizeSeed = (seed: string): string =>
  seed
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

/**
 * Splits a normalized seed string into rows of cell states. Expects
 * input that has already passed `SEED_PATTERN` validation and
 * `normalizeSeed`; unexpected characters yield `undefined` entries.
 */
export const splitSeed = (normalizedSeed: string): boolean[][] =>
  normalizedSeed.split(NEWLINE_CHAR).map((row) =>
    row.split(SEPARATOR_CHAR).map((char) =>
      CELL_CHAR_TO_BOOL[char as CellChars]
    )
  );

/**
 * Parses a seed string into sparse live-cell storage. Inverse of
 * `generationToString`.
 *
 * @throws If the seed contains invalid characters or its dimensions
 * don't match `width` and `height`.
 */
export const stringToGeneration = (
  seed: string,
  width: number,
  height: number,
): LiveCells => {
  if (!SEED_PATTERN.test(seed)) {
    throw new Error("Seed contains invalid characters");
  }

  const normalizedSeed = normalizeSeed(seed);

  const rows = normalizedSeed.split("\n").map((row) =>
    row.split(SEPARATOR_CHAR).map((char) =>
      CELL_CHAR_TO_BOOL[char as CellChars]
    )
  );

  if (rows.length !== height) {
    throw new Error("Seed height does not match specified height");
  }

  for (const row of rows) {
    if (row.length !== width) {
      throw new Error("Seed width does not match specified width");
    }
  }

  const aliveCells: LiveCells = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellState = rows[y][x];
      if (cellState) {
        const key = pointToCellKey({ x, y });
        aliveCells.set(key, true);
      }
    }
  }

  return aliveCells;
};

/**
 * Renders sparse live-cell storage as a seed string. Inverse of
 * `stringToGeneration`.
 */
export const generationToString = (
  generation: LiveCells,
  size: GridSize,
): string => {
  let res = "";
  for (let y = 0; y < size.h; y++) {
    const row: string[] = [];
    for (let x = 0; x < size.w; x++) {
      const key = pointToCellKey({ x, y });
      const isAlive = generation.get(key) ?? false;
      row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
    }
    res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
  }
  return res.trim();
};
