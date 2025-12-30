import { GRID_MODES, MIN_WORLD_HEIGHT, MIN_WORLD_WIDTH } from "./constants.ts";

import { createCellKey, parseWorldSeed } from "./seed/seed.ts";

import type { Generation, GridMode, Point, WorldOptions } from "./types.ts";

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

export class World {
  width: number;
  height: number;
  mode: GridMode;
  generations: Generation[];

  constructor(
    { width, height, mode = GRID_MODES.FINITE, seed }: WorldOptions,
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
      if (this.mode === GRID_MODES.FINITE) {
        return false;
      }

      if (this.mode === GRID_MODES.TOROIDAL) {
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

  evolveCell({ x, y }: Point): boolean {
    // declaration clockwise from top
    const topPoint = { x, y: y - 1 };
    const topRightPoint = { x: x + 1, y: y - 1 };
    const rightPoint = { x: x + 1, y };
    const bottomRightPoint = { x: x + 1, y: y + 1 };
    const bottomPoint = { x, y: y + 1 };
    const bottomLeftPoint = { x: x - 1, y: y + 1 };
    const leftPoint = { x: x - 1, y };
    const topLeftPoint = { x: x - 1, y: y - 1 };

    const topAlive = this.getCell(topPoint.x, topPoint.y) ? 1 : 0;
    const topRightAlive = this.getCell(topRightPoint.x, topRightPoint.y)
      ? 1
      : 0;
    const rightAlive = this.getCell(rightPoint.x, rightPoint.y) ? 1 : 0;
    const bottomRightAlive =
      this.getCell(bottomRightPoint.x, bottomRightPoint.y) ? 1 : 0;
    const bottomAlive = this.getCell(bottomPoint.x, bottomPoint.y) ? 1 : 0;
    const bottomLeftAlive = this.getCell(bottomLeftPoint.x, bottomLeftPoint.y)
      ? 1
      : 0;
    const leftAlive = this.getCell(leftPoint.x, leftPoint.y) ? 1 : 0;
    const topLeftAlive = this.getCell(topLeftPoint.x, topLeftPoint.y) ? 1 : 0;
    const totalAliveNeighbors = topAlive +
      topRightAlive +
      rightAlive +
      bottomRightAlive +
      bottomAlive +
      bottomLeftAlive +
      leftAlive +
      topLeftAlive;

    const centerAlive = this.getCell(x, y);

    if (centerAlive) {
      if (totalAliveNeighbors === 2 || totalAliveNeighbors === 3) {
        return centerAlive;
      }
      return false;
    }

    if (totalAliveNeighbors === 3) return true;
    return centerAlive;
  }
}
