import { GridMode, MIN_WORLD_HEIGHT, MIN_WORLD_WIDTH } from "./constants.ts";

import { createCellKey, parseWorldSeed } from "./seed/seed.ts";

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
  return isXOnBorder(x, worldWidth) || isYOnBorder(y, worldHeight);
};

type WorldOptions = {
  width: number;
  height: number;
  mode?: GridMode;
  seed?: string;
};

type Generation = Map<string, boolean>;

export class World {
  width: number;
  height: number;
  mode: GridMode;
  generations: Generation[];

  constructor(
    { width, height, mode = GridMode.Finite, seed }: WorldOptions,
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

    this.generations = [];

    if (seed === undefined) {
      this.generations.push(new Map());
    } else {
      const firstGeneration = parseWorldSeed(seed, width, height);
      this.generations.push(firstGeneration);
    }
  }

  getGeneration(i: number): Generation {
    return this.generations[i];
  }

  getPresentGeneration(): Generation {
    return this.getGeneration(this.generations.length - 1);
  }

  getCell(x: number, y: number): boolean {
    if (isCellOutsideBorder(x, y, this.width, this.height)) {
      throw new Error(`Cell (${x}, ${y}) is out of bounds`);
    }

    const presentGeneration = this.getPresentGeneration();

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

        if (presentGeneration.has(key)) {
          return presentGeneration.get(key)!;
        }

        return false;
      }
    }

    const key = createCellKey(x, y);

    if (presentGeneration.has(key)) {
      return presentGeneration.get(key)!;
    }

    return false;
  }
}
