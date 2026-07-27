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

export class PatternLib implements IPatternLib {
  #patterns: Pattern[];

  constructor(patterns: Pattern[]) {
    this.#patterns = patterns;
  }

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

  getPatternByKey(key: string): Pattern {
    const pattern = this.#patterns.find((pattern) => pattern.key === key);
    if (!pattern) {
      throw new Error(`No pattern found with key "${key}"`);
    }
    return pattern;
  }

  static fromBuiltInData(): PatternLib {
    const { patterns: patternsRaw } = patternsJson as PatternsRaw;

    return new PatternLib(PatternLib.#parsePatterns(patternsRaw));
  }

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
