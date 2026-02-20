import type { IGrid, LiveCells, Point, ValidationResult } from "../types.ts";
import { cellKeyToPoint, pointToCellKey } from "../seed/seed.ts";

export class Grid implements IGrid {
  #bottomRightCorner: Point;
  #liveCells: LiveCells;

  constructor(bottomRightCorner: Point, liveCells?: LiveCells) {
    this.#bottomRightCorner = bottomRightCorner;

    if (liveCells) {
      // Validate that all live cells are within bounds
      for (const cellKey of liveCells.keys()) {
        const point = cellKeyToPoint(cellKey);
        if (
          point.x < 0 ||
          point.x > bottomRightCorner.x ||
          point.y < 0 ||
          point.y > bottomRightCorner.y
        ) {
          throw new Error(
            `Cell at (${point.x}, ${point.y}) is out of bounds. Grid bounds are (0, 0) to (${bottomRightCorner.x}, ${bottomRightCorner.y}).`,
          );
        }
      }
      this.#liveCells = liveCells;
    } else {
      this.#liveCells = new Map();
    }
  }

  get bottomRightCorner(): Point {
    return this.#bottomRightCorner;
  }

  get liveCells(): LiveCells {
    return this.#liveCells;
  }

  contains(
    { topLeftCorner = { x: 0, y: 0 }, grid }: {
      topLeftCorner?: Point;
      grid: IGrid;
    },
  ): ValidationResult {
    const effectiveX = topLeftCorner.x + grid.bottomRightCorner.x;
    const effectiveY = topLeftCorner.y + grid.bottomRightCorner.y;

    if (
      effectiveX <= this.#bottomRightCorner.x &&
      effectiveY <= this.#bottomRightCorner.y
    ) {
      return { valid: true };
    }

    return {
      valid: false,
      message:
        `Grid with bounds (${effectiveX}, ${effectiveY}) does not fit within (${this.#bottomRightCorner.x}, ${this.#bottomRightCorner.y}).`,
    };
  }

  place(
    { topLeftCorner = { x: 0, y: 0 }, grid }: {
      topLeftCorner?: Point;
      grid: IGrid;
    },
  ): void {
    const contains = this.contains({ topLeftCorner, grid });

    if (!contains.valid) {
      throw new Error(contains.message);
    }

    for (const cellKey of grid.liveCells.keys()) {
      const point = cellKeyToPoint(cellKey);
      const offsetKey = pointToCellKey({
        x: point.x + topLeftCorner.x,
        y: point.y + topLeftCorner.y,
      });
      this.#liveCells.set(offsetKey, true);
    }
  }
}
