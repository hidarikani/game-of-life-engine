/**
 * - Finite — Cells outside the array are treated as permanently dead.
 *   In this world, a glider that hits the bottom-right corner simply disintegrates.
 *   This is easy to implement, but philosophically a little brutal. The universe has edges, and they are lethal.
 * - Toroidal - The left edge connects to the right, the top connects to the bottom.
 *   In that case, yes: a spaceship exiting the bottom-right reappears at the top-left.
 *   This turns the universe into the surface of a donut.
 *   It’s mathematically tidy and popular for demos,
 *   but it introduces artificial interactions—your glider can collide with its own past if the grid is small.
 */
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

export const isXInBounds = (x: number, worldWidth: number): boolean => {
  return x >= -1 && x <= worldWidth;
};

export const isYInBounds = (y: number, worldHeight: number): boolean => {
  return y >= -1 && y <= worldHeight;
};

export const isCellInBounds = (
  x: number,
  y: number,
  worldWidth: number,
  worldHeight: number,
): boolean => {
  return isXInBounds(x, worldWidth) && isYInBounds(y, worldHeight);
};

export const createCellKey = (x: number, y: number): string => {
  return `${x},${y}`;
};

export class World {
  width: number;
  height: number;
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
    this.liveCells = new Map();
  }

  getCell(x: number, y: number): boolean {
    if (!isCellInBounds(x, y, this.width, this.height)) {
      throw new Error(`Cell (${x}, ${y}) is out of bounds`);
    }

    const key = createCellKey(x, y);

    if (this.liveCells.has(key)) {
      return this.liveCells.get(key)!;
    }

    return false;
  }
}
