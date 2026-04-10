import type {
  EngineOptions,
  GridMode,
  GridSize,
  IEngine,
  IGrid,
  LiveCells,
  Point,
} from "../types.ts";
import { GRID_MODES, MIN_GRID_SIZE } from "../constants.ts";
import { pointToCellKey } from "../seed/seed.ts";
import { isPointOnBorder, isPointOutsideBorder } from "../geometry/geometry.ts";
import { Grid } from "../grid/grid.ts";

export class Engine implements IEngine {
  #generations: IGrid[];
  #maxHistory: number;

  constructor(
    { firstGeneration, maxHistory = 3 }: EngineOptions,
  ) {
    if (maxHistory < 1) {
      throw new Error(`maxHistory must be at least 1, got ${maxHistory}`);
    }
    this.#generations = [];
    this.#generations.push(firstGeneration);
    this.#maxHistory = maxHistory;
  }

  get maxHistory(): number {
    return this.#maxHistory;
  }

  get historyLength(): number {
    return this.#generations.length;
  }

  getGeneration(i: number): IGrid {
    return this.#generations[i];
  }

  get firstGeneration(): IGrid {
    return this.#generations[0];
  }

  get presentGeneration(): IGrid {
    return this.getGeneration(this.historyLength - 1);
  }

  get gridSize(): GridSize {
    return this.firstGeneration.gridSize;
  }

  get mode(): GridMode {
    return this.firstGeneration.mode;
  }

  readCell(point: Point): boolean {
    return this.presentGeneration.readCell(point);
  }

  evolveCell({ x, y }: Point): boolean {
    // declaration clockwise from top
    const top = { x, y: y - 1 };
    const topRight = { x: x + 1, y: y - 1 };
    const right = { x: x + 1, y };
    const bottomRight = { x: x + 1, y: y + 1 };
    const bottom = { x, y: y + 1 };
    const bottomLeft = { x: x - 1, y: y + 1 };
    const left = { x: x - 1, y };
    const topLeft = { x: x - 1, y: y - 1 };

    const topAlive = this.readCell({ x: top.x, y: top.y }) ? 1 : 0;
    const topRightAlive = this.readCell({ x: topRight.x, y: topRight.y })
      ? 1
      : 0;
    const rightAlive = this.readCell({ x: right.x, y: right.y }) ? 1 : 0;
    const bottomRightAlive =
      this.readCell({ x: bottomRight.x, y: bottomRight.y }) ? 1 : 0;
    const bottomAlive = this.readCell({ x: bottom.x, y: bottom.y }) ? 1 : 0;
    const bottomLeftAlive = this.readCell({ x: bottomLeft.x, y: bottomLeft.y })
      ? 1
      : 0;
    const leftAlive = this.readCell({ x: left.x, y: left.y }) ? 1 : 0;
    const topLeftAlive = this.readCell({ x: topLeft.x, y: topLeft.y }) ? 1 : 0;
    const totalAliveNeighbors = topAlive +
      topRightAlive +
      rightAlive +
      bottomRightAlive +
      bottomAlive +
      bottomLeftAlive +
      leftAlive +
      topLeftAlive;

    const centerAlive = this.readCell({ x, y });

    if (centerAlive) {
      if (totalAliveNeighbors === 2 || totalAliveNeighbors === 3) {
        return centerAlive;
      }
      return false;
    }

    if (totalAliveNeighbors === 3) return true;
    return centerAlive;
  }

  evolveGrid(): void {
    const liveCells: LiveCells = new Map();

    for (let y = 0; y < this.gridSize.h; y++) {
      for (let x = 0; x < this.gridSize.w; x++) {
        const nextCell = this.evolveCell({ x, y });
        if (nextCell) {
          const key = pointToCellKey({ x, y });
          liveCells.set(key, true);
        }
      }
    }

    const newGeneration: IGrid = new Grid({
      gridSize: this.gridSize,
      mode: this.mode,
      liveCells,
    });

    this.#generations.push(newGeneration);

    if (this.#generations.length > this.#maxHistory) {
      this.#generations.shift();
    }
  }

  toString(): string {
    return this.presentGeneration.toString();
  }
}
