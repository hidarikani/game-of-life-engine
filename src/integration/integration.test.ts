import type { Pattern } from "../../mod.ts";

import { assert } from "@std/assert";
import { beforeAll, describe, it } from "@std/testing/bdd";

import { Engine, PatternLib } from "../../mod.ts";

describe("built-in patterns evolve to their recorded generations", () => {
  const patterns: Pattern[] = PatternLib.fromBuiltInData().getPatterns(null);

  for (const pattern of patterns) {
    describe(pattern.name, () => {
      if (pattern.period !== null && pattern.period > 1) {
        let engine: Engine;

        beforeAll(() => {
          engine = new Engine({ firstGeneration: pattern.generations[0] });
        });

        for (let i = 1; i < pattern.generations.length; i++) {
          it(`generation ${i}`, () => {
            engine.evolveGrid();
            assert(
              engine.presentGeneration.equals(pattern.generations[i]),
            );
          });
        }
      }
    });
  }
});
