import type {
  IGrid,
  LiveCells,
  PlacementMode,
  Point,
  ValidationResult,
} from "../types.ts";
import { cellKeyToPoint, pointToCellKey } from "../seed/seed.ts";
import { PLACEMENT_MODES } from "../constants.ts";

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
    { inner: grid, offset = { x: 0, y: 0 } }: { inner: IGrid; offset?: Point },
  ): ValidationResult {
    const effectiveX = offset.x + grid.bottomRightCorner.x;
    const effectiveY = offset.y + grid.bottomRightCorner.y;

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
    { offset = { x: 0, y: 0 }, inner: grid, mode = PLACEMENT_MODES.OVERWRITE }:
      {
        inner: IGrid;
        offset?: Point;
        mode?: PlacementMode;
      },
  ): void {
    const contains = this.contains({ offset, inner: grid });

    if (!contains.valid) {
      throw new Error(contains.message);
    }

    if (mode === PLACEMENT_MODES.OVERWRITE) {
      for (let x = offset.x; x <= offset.x + grid.bottomRightCorner.x; x++) {
        for (let y = offset.y; y <= offset.y + grid.bottomRightCorner.y; y++) {
          this.#liveCells.delete(pointToCellKey({ x, y }));
        }
      }
    }

    for (const cellKey of grid.liveCells.keys()) {
      const point = cellKeyToPoint(cellKey);
      const offsetKey = pointToCellKey({
        x: point.x + offset.x,
        y: point.y + offset.y,
      });
      this.#liveCells.set(offsetKey, true);
    }
  }
}
