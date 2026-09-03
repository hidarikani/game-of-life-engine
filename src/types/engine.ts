import type { GridMode, GridSize, IGrid } from "./grid.ts";

/**
 * Runs a Game of Life simulation, keeping a bounded history of the most
 * recent generations.
 */
export interface IEngine {
  /** Number of generations currently retained, including the present one. */
  readonly historyLength: number;
  /**
   * Returns the retained generation at index `i`, where `0` is the oldest
   * retained generation — not necessarily the original seed once history
   * has been trimmed.
   */
  getGeneration(i: number): IGrid;
  /** The oldest retained generation. */
  readonly firstGeneration: IGrid;
  /** The most recent generation. */
  readonly presentGeneration: IGrid;
  /** Dimensions shared by every generation. */
  readonly gridSize: GridSize;
  /** Border behavior shared by every generation. */
  readonly mode: GridMode;
  /** Maximum number of generations retained before the oldest is dropped. */
  readonly maxHistory: number;
}

/** Options for constructing an engine. */
export type EngineOptions = {
  /** The seed grid the simulation evolves from. */
  firstGeneration: IGrid;
  /**
   * Maximum number of generations to retain; must be at least 1.
   * Defaults to 3.
   */
  maxHistory?: number;
};
