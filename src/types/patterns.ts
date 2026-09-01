import type { IGrid } from "./types.ts";
import type { PATTERN_TYPES } from "../constants.ts";

/**
 * Classification of a pattern by its long-term behavior:
 * still lifes never change, oscillators repeat with a period greater
 * than one, and spaceships translate across the grid as they repeat.
 *
 * Derived from `PATTERN_TYPES` so the type and the constants cannot
 * drift apart.
 */
export type PatternType = (typeof PATTERN_TYPES)[keyof typeof PATTERN_TYPES];

/** Metadata shared by the raw and parsed representations of a pattern. */
type BasePattern = {
  /** Human-readable display name (e.g. `"Glider"`). */
  name: string;
  /** Unique identifier used to look the pattern up in a library. */
  key: string;
  /** Behavioral classification of the pattern. */
  type: PatternType;
  /**
   * Number of generations after which the pattern repeats its shape.
   * Still life has a period of 1.
   * Patterns that don't have a known cycle have a null period.
   */
  period: number | null;
};

/** One generation of a raw pattern, as a seed string. */
type Generation = {
  /** Cell rows in the seed string format (`#`/`.`). */
  state: string;
};

/**
 * A pattern as stored on disk, with generations as seed strings and
 * explicit dimensions used to parse them.
 */
type PatternRaw = BasePattern & {
  /** Width in cells of every generation's seed string. */
  width: number;
  /** Height in cells of every generation's seed string. */
  height: number;
  /** One seed string per generation of the pattern's period. */
  generations: Generation[];
};

/** Shape of the pattern data files (JSON or YAML) before parsing. */
export type PatternsRaw = {
  /** Every pattern the data file defines. */
  patterns: PatternRaw[];
};

/**
 * A fully parsed pattern whose generations are ready-to-use grids,
 * one per step of the pattern's period.
 */
export type Pattern = BasePattern & {
  /** One grid per generation of the pattern's period. */
  generations: IGrid[];
};

/**
 * Criteria for narrowing a pattern search. Each criterion is ignored
 * when `null`; when both are set, a pattern must satisfy both.
 */
export type PatternFilter = {
  /** Regular expression matched against the pattern's display name. */
  name: RegExp | null;
  /** Required behavioral classification. */
  patternType: PatternType | null;
};

/** A searchable collection of Game of Life patterns. */
export interface IPatternLib {
  /**
   * Returns the patterns matching `filter`, or every pattern when the
   * filter is `null`.
   */
  getPatterns(filter: PatternFilter | null): Pattern[];
  /**
   * Returns the pattern with the given key, or `null` when none exists —
   * an unknown key is an expected lookup miss, not an error.
   */
  getPatternByKey(key: string): Pattern | null;
}
