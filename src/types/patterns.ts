import type { IGrid } from "./types.ts";

export type PatternType = "still-life" | "oscillator" | "spaceship";

type BasePattern = {
  name: string;
  key: string;
  type: PatternType;
  period: number;
};

type Generation = { state: string };

type PatternRaw = BasePattern & {
  width: number;
  height: number;
  generations: Generation[];
};

export type PatternsYaml = {
  patterns: PatternRaw[];
};

export type Pattern = BasePattern & {
  generations: IGrid[];
};

export type PatternFilter = {
  name: RegExp | null;
  patternType: PatternType | null;
};

export interface IPatternLib {
  getPatterns(filter: PatternFilter | null): Pattern[];
  getPatternByKey(key: string): Pattern;
}
