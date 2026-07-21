import type {
  GridMode,
  GridOptionsFromLiveCells,
  GridOptionsFromString,
  GridSize,
  IGrid,
  LiveCells,
  PlacementMode,
  Point,
} from "../types/types.ts";
import {
  cellKeyToPoint,
  normalizeSeed,
  pointToCellKey,
  splitSeed,
} from "../seed/seed.ts";
import {
  ALIVE_CHAR,
  DEAD_CHAR,
  GRID_MODES,
  NEWLINE_CHAR,
  PLACEMENT_MODES,
  SEED_PATTERN,
  SEPARATOR_CHAR,
} from "../constants.ts";
import {
  gridContainsCells,
  gridContainsGrid,
  isPointOnBorder,
  isPointOutsideBorder,
  isXOnBottomBorder,
  isXOnTopBorder,
  isYOnBottomBorder,
  isYOnTopBorder,
  validateMinGridSize,
} from "../geometry/geometry.ts";

export class Grid implements IGrid {
  #gridSize: GridSize;
  #liveCells: LiveCells;
  #mode: GridMode;

  constructor(
    { gridSize, liveCells, mode = GRID_MODES.FINITE }: GridOptionsFromLiveCells,
  ) {
    const minGridSizeResult = validateMinGridSize(gridSize);

    if (!minGridSizeResult.valid) {
      throw new Error(minGridSizeResult.message);
    }

    this.#gridSize = gridSize;

    if (liveCells) {
      const cellContainmentResult = gridContainsCells({
        outer: gridSize,
        inner: liveCells,
      });
      if (!cellContainmentResult.valid) {
        throw new Error(cellContainmentResult.message);
      }
      this.#liveCells = liveCells;
    } else {
      this.#liveCells = new Map();
    }

    this.#mode = mode;
  }

  get gridSize(): GridSize {
    return this.#gridSize;
  }

  get mode(): GridMode {
    return this.#mode;
  }

  get liveCells(): { key: Point; value: boolean }[] {
    return Array.from(this.#liveCells, ([cellKey, value]) => ({
      key: cellKeyToPoint(cellKey),
      value,
    }));
  }

  readCell({ x, y }: Point): boolean {
    if (
      isPointOutsideBorder({ x, y }, {
        w: this.#gridSize.w,
        h: this.gridSize.h,
      })
    ) {
      throw new Error(`Cell (${x}, ${y}) is out of bounds`);
    }

    if (
      isPointOnBorder({ x, y }, this.#gridSize)
    ) {
      if (this.#mode === GRID_MODES.FINITE) {
        return false;
      }

      if (this.#mode === GRID_MODES.TOROIDAL) {
        let wrappedX = x;
        let wrappedY = y;

        if (isXOnTopBorder(x)) {
          wrappedX = this.#gridSize.w - 1;
        }

        if (isXOnBottomBorder(x, this.#gridSize.w)) {
          wrappedX = 0;
        }

        if (isYOnTopBorder(y)) {
          wrappedY = this.#gridSize.h - 1;
        }

        if (isYOnBottomBorder(y, this.#gridSize.h)) {
          wrappedY = 0;
        }

        const key = pointToCellKey({ x: wrappedX, y: wrappedY });

        if (this.#liveCells.has(key)) {
          return this.#liveCells.get(key)!;
        }

        return false;
      }
    }

    const key = pointToCellKey({ x, y });

    if (this.#liveCells.has(key)) {
      return this.#liveCells.get(key)!;
    }

    return false;
  }

  writeCell({ x, y }: Point, value: boolean): void {
    if (
      isPointOutsideBorder({ x, y }, {
        w: this.#gridSize.w,
        h: this.gridSize.h,
      })
    ) {
      throw new Error(`Cell (${x}, ${y}) is out of bounds`);
    }

    if (
      isPointOnBorder({ x, y }, { w: this.#gridSize.w, h: this.#gridSize.h })
    ) {
      if (this.#mode === GRID_MODES.FINITE) {
        return;
      }

      if (this.#mode === GRID_MODES.TOROIDAL) {
        let wrappedX: number;
        let wrappedY: number;

        if (x === -1) {
          wrappedX = this.#gridSize.w - 1;
        } else {
          wrappedX = 0;
        }

        if (y === -1) {
          wrappedY = this.#gridSize.h - 1;
        } else {
          wrappedY = 0;
        }

        const key = pointToCellKey({ x: wrappedX, y: wrappedY });

        if (value) {
          this.#liveCells.set(key, true);
        } else {
          this.#liveCells.delete(key);
        }

        return;
      }
    }

    const key = pointToCellKey({ x, y });

    if (value) {
      this.#liveCells.set(key, true);
    } else {
      this.#liveCells.delete(key);
    }
  }

  get population(): number {
    return this.#liveCells.size;
  }

  writeGrid(
    { offset = { x: 0, y: 0 }, inner, mode = PLACEMENT_MODES.OVERWRITE }: {
      inner: IGrid;
      offset?: Point;
      mode?: PlacementMode;
    },
  ): void {
    const contains = gridContainsGrid({
      outer: this.#gridSize,
      inner: inner.gridSize,
      offset,
    });

    if (!contains.valid) {
      throw new Error(contains.message);
    }

    if (mode === PLACEMENT_MODES.OVERWRITE) {
      for (let x = offset.x; x <= offset.x + inner.gridSize.w - 1; x++) {
        for (let y = offset.y; y <= offset.y + inner.gridSize.h - 1; y++) {
          this.#liveCells.delete(pointToCellKey({ x, y }));
        }
      }
    }

    for (const { key } of inner.liveCells) {
      const offsetKey = pointToCellKey({
        x: key.x + offset.x,
        y: key.y + offset.y,
      });
      this.#liveCells.set(offsetKey, true);
    }
  }

  static fromString(
    { gridSize, seed, mode = GRID_MODES.FINITE }: GridOptionsFromString,
  ): IGrid {
    if (!SEED_PATTERN.test(seed)) {
      throw new Error("Seed contains invalid characters");
    }

    const minGridSizeResult = validateMinGridSize(gridSize);

    if (!minGridSizeResult.valid) {
      throw new Error(minGridSizeResult.message);
    }

    const normalizedSeed = normalizeSeed(seed);

    const rows = splitSeed(normalizedSeed);

    if (rows.length !== gridSize.h) {
      throw new Error("Seed height does not match specified height");
    }

    for (const row of rows) {
      if (row.length !== gridSize.w) {
        throw new Error("Seed width does not match specified width");
      }
    }

    const liveCells: LiveCells = new Map();

    for (let y = 0; y < gridSize.h; y++) {
      for (let x = 0; x < gridSize.w; x++) {
        const cellState = rows[y][x];
        if (cellState) {
          const key = pointToCellKey({ x, y });
          liveCells.set(key, true);
        }
      }
    }

    return new Grid({ gridSize, liveCells, mode });
  }

  toString(): string {
    let res = "";
    for (let y = 0; y < this.#gridSize.h; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.#gridSize.w; x++) {
        const key = pointToCellKey({ x, y });
        const isAlive = this.#liveCells.get(key) ?? false;
        row.push(isAlive ? ALIVE_CHAR : DEAD_CHAR);
      }
      res += row.join(SEPARATOR_CHAR) + NEWLINE_CHAR;
    }
    return res.trim();
  }

  equals(other: IGrid): boolean {
    if (
      this.#gridSize.w !== other.gridSize.w ||
      this.#gridSize.h !== other.gridSize.h
    ) {
      return false;
    }

    if (this.population !== other.population) {
      return false;
    }

    for (const [cellKey, value] of this.#liveCells) {
      if (other.readCell(cellKeyToPoint(cellKey)) !== value) {
        return false;
      }
    }

    return true;
  }
}
