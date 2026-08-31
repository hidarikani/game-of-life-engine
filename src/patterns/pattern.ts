import type { GridSize } from "../types/types.ts";
import type {
  IPatternLib,
  Pattern,
  PatternFilter,
  PatternsRaw,
} from "../types/patterns.ts";
import { Grid } from "../grid/grid.ts";
import { parse } from "@std/yaml";
import patternsJson from "../../data/patterns/patterns.json" with {
  type: "json",
};

/**
 * A searchable collection of Game of Life patterns whose generations are
 * parsed into ready-to-use grids. Load the bundled patterns with
 * `fromBuiltInData`, or your own with `fromYamlFile`.
 */
export class PatternLib implements IPatternLib {
  #patterns: Pattern[];

  /** Creates a library over already-parsed patterns. */
  constructor(patterns: Pattern[]) {
    this.#patterns = patterns;
  }

  /**
   * Returns the patterns matching `filter`, or every pattern when the
   * filter is `null`. A pattern must satisfy every non-null criterion.
   */
  getPatterns(filter: PatternFilter | null): Pattern[] {
    if (!filter) {
      return this.#patterns;
    }

    return this.#patterns.filter((pattern) => {
      if (filter.name && !filter.name.test(pattern.name)) {
        return false;
      }
      if (filter.patternType && pattern.type !== filter.patternType) {
        return false;
      }
      return true;
    });
  }

  /**
   * Returns the pattern with the given key, or `null` when none exists —
   * an unknown key is an expected lookup miss, not an error.
   */
  getPatternByKey(key: string): Pattern | null {
    return this.#patterns.find((pattern) => pattern.key === key) ?? null;
  }

  /**
   * Creates a library from the pattern data bundled with the package.
   * Requires no file system permissions.
   */
  static fromBuiltInData(): PatternLib {
    const { patterns: patternsRaw } = patternsJson as PatternsRaw;

    return new PatternLib(PatternLib.#parsePatterns(patternsRaw));
  }

  /**
   * Creates a library from a YAML file shaped like `PatternsRaw`.
   * Reads the file synchronously, so the Deno process needs read
   * permission for `filePath`.
   */
  static fromYamlFile(filePath: string): PatternLib {
    const fileContents = Deno.readTextFileSync(filePath);
    const { patterns: patternsRaw } = parse(fileContents) as PatternsRaw;

    return new PatternLib(PatternLib.#parsePatterns(patternsRaw));
  }

  static #parsePatterns(patternsRaw: PatternsRaw["patterns"]): Pattern[] {
    return patternsRaw.map((entry) => {
      const gridSize: GridSize = { w: entry.width, h: entry.height };

      return {
        name: entry.name,
        key: entry.key,
        type: entry.type,
        period: entry.period,
        generations: entry.generations.map(({ state }) =>
          Grid.fromString({ gridSize, seed: state })
        ),
      };
    });
  }
}
