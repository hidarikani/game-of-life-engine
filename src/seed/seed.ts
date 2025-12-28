import { CELL_CHAR_TO_BOOL } from "../constants.ts";

export const createCellKey = (x: number, y: number): string => {
  return `${x},${y}`;
};

export const parseWorldSeed = (
  seed: string,
  width: number,
  height: number,
): Map<string, boolean> => {
  const validCharsRegexp = /^[#. \n]*$/;
  if (!validCharsRegexp.test(seed)) {
    throw new Error("Seed contains invalid characters");
  }
  const rows = seed.trim().split("\n").map((row) =>
    row.trim().split(" ").map((char) => CELL_CHAR_TO_BOOL[char])
  );

  if (rows.length !== height) {
    throw new Error("Seed height does not match specified height");
  }

  for (const row of rows) {
    if (row.length !== width) {
      throw new Error("Seed width does not match specified width");
    }
  }

  const aliveCells = new Map<string, boolean>();

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
