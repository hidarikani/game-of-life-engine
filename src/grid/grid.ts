import type {
  CellChars,
  IGrid,
  LiveCells,
  PlacementMode,
  Point,
  ValidationResult,
} from "../types.ts";
import { cellKeyToPoint, normalizeSeed, pointToCellKey } from "../seed/seed.ts";
import {
  ALIVE_CHAR,
  CELL_CHAR_TO_BOOL,
  DEAD_CHAR,
  NEWLINE_CHAR,
  PLACEMENT_MODES,
  SEED_PATTERN,
  SEPARATOR_CHAR,
} from "../constants.ts";
import { validateMinGridSize } from "../geometry/geometry.ts";

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

  static fromString(
    bottomRightCorner: Point,
    seed: string,
  ): IGrid {
    if (!SEED_PATTERN.test(seed)) {
      throw new Error("Seed contains invalid characters");
    }

    const minGridSizeResult = validateMinGridSize(bottomRightCorner);

    if (!minGridSizeResult.valid) {
      throw new Error(minGridSizeResult.message);
    }

    const normalizedSeed = normalizeSeed(seed);

    const rows = normalizedSeed.split("\n").map((row) =>
      row.split(SEPARATOR_CHAR).map((char) =>
        CELL_CHAR_TO_BOOL[char as CellChars]
      )
    );

    if (rows.length !== bottomRightCorner.y) {
      throw new Error("Seed height does not match specified height");
    }

    for (const row of rows) {
      if (row.length !== bottomRightCorner.x) {
        throw new Error("Seed width does not match specified width");
      }
    }

    const liveCells: LiveCells = new Map();

    for (let y = 0; y < bottomRightCorner.y; y++) {
      for (let x = 0; x < bottomRightCorner.x; x++) {
        const cellState = rows[y][x];
        if (cellState) {
          const key = pointToCellKey({ x, y });
          liveCells.set(key, true);
        }
      }
    }

    return new Grid(bottomRightCorner, liveCells);
  }

  toString(): string {
    let res = "";
    for (let y = 0; y < this.#bottomRightCorner.y; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.#bottomRightCorner.x; x++) {
        const key = pointToCellKey({ x, y });
        const isAlive = this.#liveCells.get(key) ?? false;
        row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
      }
      res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
    }
    return res.trim();
  }
}
