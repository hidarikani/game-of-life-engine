import type { LiveCells, Point, ValidationResult } from "../types.ts";
import { cellKeyToPoint } from "../seed/seed.ts";

export class Grid {
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

  contains(grid: Grid): ValidationResult {
    if (
      grid.#bottomRightCorner.x <= this.#bottomRightCorner.x &&
      grid.#bottomRightCorner.y <= this.#bottomRightCorner.y
    ) {
      return { valid: true };
    }

    return {
      valid: false,
      message: `Grid with bounds (${grid.#bottomRightCorner.x}, ${grid.#bottomRightCorner.y}) does not fit within (${this.#bottomRightCorner.x}, ${this.#bottomRightCorner.y}).`,
    };
  }

  place(grid: Grid): void {
    const contains  = this.contains(grid)

    if (!contains.valid) {
      throw new Error(contains.message);
    }
  }
}
