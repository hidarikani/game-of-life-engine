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
  isXOnLeftBorder,
  isXOnRightBorder,
  isYOnBottomBorder,
  isYOnTopBorder,
  validateMinGridSize,
} from "../geometry/geometry.ts";

/**
 * A two-dimensional collection of cells backed by sparse storage — only
 * living cells are kept in memory, so large, mostly-empty grids stay cheap.
 *
 * Coordinates one step outside the grid (the border ring at `-1` and
 * `w`/`h`) are addressable so a simulation can count the neighbors of edge
 * cells. In `"Finite"` mode the border always reads dead and writes to it
 * are silently ignored; in `"Toroidal"` mode border coordinates wrap to
 * the opposite edge. Anything beyond the border ring is out of bounds.
 */
export class Grid implements IGrid {
  #gridSize: GridSize;
  #liveCells: LiveCells;
  #mode: GridMode;

  /**
   * Creates a grid from a sparse map of live cells (empty when omitted).
   *
   * @throws If either dimension is below the minimum grid size, or a
   * live cell lies outside the grid.
   */
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

  /** Dimensions of the grid in cells. */
  get gridSize(): GridSize {
    return this.#gridSize;
  }

  /** Border behavior of the grid. */
  get mode(): GridMode {
    return this.#mode;
  }

  /**
   * Coordinates of every living cell, in no guaranteed order. Built
   * fresh on each access, so cache the result when iterating repeatedly.
   */
  get liveCells(): readonly Point[] {
    return Array.from(this.#liveCells.keys(), cellKeyToPoint);
  }

  /**
   * Reads a cell's state. Border coordinates read dead in `"Finite"` mode
   * and wrap to the opposite edge in `"Toroidal"` mode.
   *
   * @throws If the point lies beyond the border ring.
   */
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

        if (isXOnLeftBorder(x)) {
          wrappedX = this.#gridSize.w - 1;
        }

        if (isXOnRightBorder(x, this.#gridSize.w)) {
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

  /**
   * Sets a cell's state. Border writes are silently ignored in `"Finite"`
   * mode and wrap to the opposite edge in `"Toroidal"` mode.
   *
   * @throws If the point lies beyond the border ring.
   */
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
      isPointOnBorder({ x, y }, this.#gridSize)
    ) {
      if (this.#mode === GRID_MODES.FINITE) {
        return;
      }

      if (this.#mode === GRID_MODES.TOROIDAL) {
        let wrappedX = x;
        let wrappedY = y;

        if (isXOnLeftBorder(x)) {
          wrappedX = this.#gridSize.w - 1;
        }

        if (isXOnRightBorder(x, this.#gridSize.w)) {
          wrappedX = 0;
        }

        if (isYOnTopBorder(y)) {
          wrappedY = this.#gridSize.h - 1;
        }

        if (isYOnBottomBorder(y, this.#gridSize.h)) {
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

  /** Number of living cells. */
  get population(): number {
    return this.#liveCells.size;
  }

  /**
   * Places `inner` onto this grid with its top-left corner at `offset`
   * (default `(0, 0)`). In `"Overwrite"` mode (the default) the target
   * rectangle is cleared first, so the inner grid's dead cells erase
   * whatever was underneath; in `"Merge"` mode only the inner grid's
   * live cells are copied and surrounding live cells survive.
   *
   * @throws If the inner grid, once offset, does not fit inside this grid.
   */
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

    for (const point of inner.liveCells) {
      const offsetKey = pointToCellKey({
        x: point.x + offset.x,
        y: point.y + offset.y,
      });
      this.#liveCells.set(offsetKey, true);
    }
  }

  /**
   * Creates a grid from a seed string: `#` for alive, `.` for dead, cells
   * separated by spaces and rows by newlines. Leading and trailing
   * whitespace around the seed and each row is tolerated.
   *
   * @throws If the seed contains other characters, its dimensions don't
   * match `gridSize`, or either dimension is below the minimum grid size.
   */
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

  /**
   * Renders the grid in the same seed string format `fromString` accepts,
   * making the two functions round-trip.
   */
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

  /**
   * Compares dimensions, border behavior (`mode`), population, and every
   * live cell's state.
   */
  equals(other: IGrid): boolean {
    if (
      this.#gridSize.w !== other.gridSize.w ||
      this.#gridSize.h !== other.gridSize.h
    ) {
      return false;
    }

    if (this.#mode !== other.mode) {
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
