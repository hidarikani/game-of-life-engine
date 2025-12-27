export enum GridMode {
  Finite,
  Toroidal,
}

const MIN_WORLD_WIDTH = 3;
const MIN_WORLD_HEIGHT = 3;

type WorldOptions = {
  width: number;
  height: number;
  mode?: GridMode;
};

export const validateWorldSeed = (
  seed: string,
  width: number,
  height: number,
): void => {
  // regexp to match valid characters: #, ., whitespace, and newlines
  const validCharsRegexp = /^[#. \n]*$/;
  if (!validCharsRegexp.test(seed)) {
    throw new Error("Seed contains invalid characters");
  }
};

const isXOutsideBorder = (x: number, worldWidth: number): boolean => {
  return x < -1 || x > worldWidth;
};

const isYOutsideBorder = (y: number, worldHeight: number): boolean => {
  return y < -1 || y > worldHeight;
};

const isCellOutsideBorder = (
  x: number,
  y: number,
  worldWidth: number,
  worldHeight: number,
): boolean => {
  return isXOutsideBorder(x, worldWidth) || isYOutsideBorder(y, worldHeight);
};

const isXOnBorder = (x: number, worldWidth: number): boolean => {
  return x === -1 || x === worldWidth;
};

const isYOnBorder = (y: number, worldHeight: number): boolean => {
  return y === -1 || y === worldHeight;
};

export const isCellOnBorder = (
  x: number,
  y: number,
  worldWidth: number,
  worldHeight: number,
): boolean => {
  return isXOnBorder(x, worldWidth) && isYOnBorder(y, worldHeight);
};

export const createCellKey = (x: number, y: number): string => {
  return `${x},${y}`;
};

export class World {
  width: number;
  height: number;
  mode: GridMode;
  liveCells: Map<string, boolean>;

  constructor(
    { width, height, mode = GridMode.Finite }: WorldOptions,
  ) {
    if (width < MIN_WORLD_WIDTH) {
      throw new Error(`Width must be at least ${MIN_WORLD_WIDTH}`);
    }

    if (height < MIN_WORLD_HEIGHT) {
      throw new Error(`Height must be at least ${MIN_WORLD_HEIGHT}`);
    }

    this.width = width;
    this.height = height;
    this.mode = mode;
    this.liveCells = new Map();
  }

  getCell(x: number, y: number): boolean {
    if (isCellOutsideBorder(x, y, this.width, this.height)) {
      throw new Error(`Cell (${x}, ${y}) is out of bounds`);
    }

    if (isCellOnBorder(x, y, this.width, this.height)) {
      if (this.mode === GridMode.Finite) {
        return false;
      }

      if (this.mode === GridMode.Toroidal) {
        let wrappedX: number;
        let wrappedY: number;

        if (x === -1) {
          wrappedX = this.width - 1;
        } else {
          wrappedX = 0;
        }

        if (y === -1) {
          wrappedY = this.height - 1;
        } else {
          wrappedY = 0;
        }

        const key = createCellKey(wrappedX, wrappedY);

        if (this.liveCells.has(key)) {
          return this.liveCells.get(key)!;
        }

        return false;
      }
    }

    const key = createCellKey(x, y);

    if (this.liveCells.has(key)) {
      return this.liveCells.get(key)!;
    }

    return false;
  }
}
