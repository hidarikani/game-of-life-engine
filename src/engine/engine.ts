import type { Point } from "../types/geometry.ts";
import type {
  EngineOptions,
  GridMode,
  GridSize,
  IEngine,
  IGrid,
  LiveCells,
} from "../types/types.ts";
import { pointToCellKey } from "../seed/seed.ts";
import { Grid } from "../grid/grid.ts";

/**
 * Runs a Conway's Game of Life simulation over immutable generations.
 * Each `evolveGrid` call derives a new grid from the present one and
 * appends it to a bounded history; once `maxHistory` is exceeded the
 * oldest generation is dropped, so index `0` slides forward over time.
 */
export class Engine implements IEngine {
  #generations: IGrid[];
  #maxHistory: number;

  /**
   * Creates an engine seeded with `firstGeneration`.
   *
   * @throws If `maxHistory` is less than 1.
   */
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

  /** Maximum number of generations retained before the oldest is dropped. */
  get maxHistory(): number {
    return this.#maxHistory;
  }

  /** Number of generations currently retained, including the present one. */
  get historyLength(): number {
    return this.#generations.length;
  }

  /**
   * Returns the retained generation at index `i`, where `0` is the oldest
   * retained generation — not necessarily the original seed once history
   * has been trimmed. Indices outside `[0, historyLength)` return
   * `undefined` at runtime.
   */
  getGeneration(i: number): IGrid {
    return this.#generations[i];
  }

  /** The oldest retained generation. */
  get firstGeneration(): IGrid {
    return this.#generations[0];
  }

  /** The most recent generation. */
  get presentGeneration(): IGrid {
    return this.getGeneration(this.historyLength - 1);
  }

  /** Dimensions shared by every generation. */
  get gridSize(): GridSize {
    return this.firstGeneration.gridSize;
  }

  /** Border behavior shared by every generation. */
  get mode(): GridMode {
    return this.firstGeneration.mode;
  }

  /** Reads a cell's state in the present generation. */
  readCell(point: Point): boolean {
    return this.presentGeneration.readCell(point);
  }

  /**
   * Computes what a cell's state will be in the next generation by
   * applying Conway's rules (B3/S23) to its eight neighbors in the
   * present generation: a live cell survives with 2 or 3 live neighbors,
   * a dead cell is born with exactly 3. The present generation is not
   * modified.
   */
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

  /**
   * Advances the simulation one step: evolves every cell, appends the
   * resulting grid as the new present generation, and drops the oldest
   * generation when the history exceeds `maxHistory`.
   */
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

  /** Renders the present generation in the seed string format (`#`/`.`). */
  toString(): string {
    return this.presentGeneration.toString();
  }
}
