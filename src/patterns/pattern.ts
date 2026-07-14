import type { GridSize } from "../types/types.ts";
import type {
  IPatternLib,
  PatternFilter,
  Pattern,
  PatternsYaml,
} from "../types/patterns.ts";
import { Grid } from "../grid/grid.ts";
import { parse } from "@std/yaml";
import patternsYaml from "../../data/patterns/patterns.yaml" with {
  type: "text",
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
    const { patterns: patternsRaw } = parse(patternsYaml) as PatternsYaml;

    const patternsParsed = patternsRaw.map((entry) => {
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

    return new PatternLib(patternsParsed);
  }

  // static fromYamlFile(): PatternLib {
  //   // TBD
  // }
}
