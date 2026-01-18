import type { CellChars, Generation, Rectangle } from "../types.ts";
import {
  ALIVE_CHAR,
  CELL_CHAR_TO_BOOL,
  DEAD_CHAR,
  NEWLINE_CHAR,
  SEED_PATTERN,
  SEPARATOR_CHAR,
} from "../constants.ts";

export const createCellKey = (x: number, y: number): string => {
  return `${x},${y}`;
};

export const normalizeSeed = (seed: string): string =>
  seed
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

export const stringToGeneration = (
  seed: string,
  width: number,
  height: number,
): Map<string, boolean> => {
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

  const aliveCells: Generation = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellState = rows[y][x];
      if (cellState) {
        const key = createCellKey(x, y);
        aliveCells.set(key, true);
      }
    }
  }

  return aliveCells;
};

export const generationToString = (
  generation: Generation,
  size: Rectangle,
): string => {
  let res = "";
  for (let y = 0; y < size.h; y++) {
    const row: string[] = [];
    for (let x = 0; x < size.w; x++) {
      const key = createCellKey(x, y);
      const isAlive = generation.get(key) ?? false;
      row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
    }
    res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
  }
  return res.trim();
};
