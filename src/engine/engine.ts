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
  #gridSize: GridSize;
  #mode: GridMode;
  #generations: IGrid[];
  #maxHistory: number;

  constructor(
    { firstGeneration, maxHistory = 3 }: EngineOptions,
  ) {
    this.#gridSize = firstGeneration.gridSize;
    this.#mode = firstGeneration.mode;
    this.#generations = [];
    this.#generations.push(firstGeneration);
    this.#maxHistory = maxHistory;
  }

  get gridSize(): GridSize {
    return this.#gridSize;
  }

  get mode(): GridMode {
    return this.#mode;
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

  get presentGeneration(): IGrid {
    return this.getGeneration(this.historyLength - 1);
  }

  // evolveCell({ x, y }: Point): boolean {
  //   // declaration clockwise from top
  //   const top = { x, y: y - 1 };
  //   const topRight = { x: x + 1, y: y - 1 };
  //   const right = { x: x + 1, y };
  //   const bottomRight = { x: x + 1, y: y + 1 };
  //   const bottom = { x, y: y + 1 };
  //   const bottomLeft = { x: x - 1, y: y + 1 };
  //   const left = { x: x - 1, y };
  //   const topLeft = { x: x - 1, y: y - 1 };

  //   const topAlive = this.getCell({ x: top.x, y: top.y }) ? 1 : 0;
  //   const topRightAlive = this.getCell({ x: topRight.x, y: topRight.y })
  //     ? 1
  //     : 0;
  //   const rightAlive = this.getCell({ x: right.x, y: right.y }) ? 1 : 0;
  //   const bottomRightAlive =
  //     this.getCell({ x: bottomRight.x, y: bottomRight.y }) ? 1 : 0;
  //   const bottomAlive = this.getCell({ x: bottom.x, y: bottom.y }) ? 1 : 0;
  //   const bottomLeftAlive = this.getCell({ x: bottomLeft.x, y: bottomLeft.y })
  //     ? 1
  //     : 0;
  //   const leftAlive = this.getCell({ x: left.x, y: left.y }) ? 1 : 0;
  //   const topLeftAlive = this.getCell({ x: topLeft.x, y: topLeft.y }) ? 1 : 0;
  //   const totalAliveNeighbors = topAlive +
  //     topRightAlive +
  //     rightAlive +
  //     bottomRightAlive +
  //     bottomAlive +
  //     bottomLeftAlive +
  //     leftAlive +
  //     topLeftAlive;

  //   const centerAlive = this.getCell({ x, y });

  //   if (centerAlive) {
  //     if (totalAliveNeighbors === 2 || totalAliveNeighbors === 3) {
  //       return centerAlive;
  //     }
  //     return false;
  //   }

  //   if (totalAliveNeighbors === 3) return true;
  //   return centerAlive;
  // }

  // evolveGrid(): void {
  //   const newGeneration: LiveCells = new Map();

  //   for (let y = 0; y < this.gridSize.h; y++) {
  //     for (let x = 0; x < this.gridSize.w; x++) {
  //       const nextCell = this.evolveCell({ x, y });
  //       if (nextCell) {
  //         const key = pointToCellKey({ x, y });
  //         newGeneration.set(key, true);
  //       }
  //     }
  //   }
  //   this.generations.push(newGeneration);
  // }

  // toString(): string {
  //   const generation = this.getPresentGeneration();
  //   return generation.toString();
  // }
}
