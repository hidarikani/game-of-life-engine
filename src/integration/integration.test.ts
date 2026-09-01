import { assert } from "@std/assert";
import { Engine, PatternLib } from "../../mod.ts";
import type { Pattern } from "../../mod.ts";

Deno.test("built-in patterns evolve to their recorded generations", async (t) => {
  const patterns: Pattern[] = PatternLib.fromBuiltInData().getPatterns(null);

  for (const pattern of patterns) {
    await t.step(pattern.name, async (t) => {
      if (pattern.period !== null && pattern.period > 1) {
        const engine = new Engine({ firstGeneration: pattern.generations[0] });

        for (let i = 1; i < pattern.generations.length; i++) {
          await t.step(`generation ${i}`, () => {
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
