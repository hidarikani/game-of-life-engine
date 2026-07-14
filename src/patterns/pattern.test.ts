import { assertEquals, assertThrows } from "@std/assert";
import { PatternLib } from "./pattern.ts";

Deno.test("PatternLib.getPatterns", async (t) => {
  await t.step("returns all patterns when filter is null", () => {
    const lib = PatternLib.fromBuiltInData();
    const patterns = lib.getPatterns(null);
    assertEquals(patterns.length > 0, true);
  });

  await t.step("filters by name regex", () => {
    const lib = PatternLib.fromBuiltInData();
    const patterns = lib.getPatterns({ name: /blink/i, patternType: null });
    assertEquals(patterns.every((p) => /blink/i.test(p.name)), true);
  });

  await t.step("filters by name regex with no matches", () => {
    const lib = PatternLib.fromBuiltInData();
    const patterns = lib.getPatterns({
      name: /nonexistent/i,
      patternType: null,
    });
    assertEquals(patterns, []);
  });

  await t.step("filters by pattern type", () => {
    const lib = PatternLib.fromBuiltInData();
    const patterns = lib.getPatterns({
      name: null,
      patternType: "oscillator",
    });
    assertEquals(patterns.every((p) => p.type === "oscillator"), true);
  });

  await t.step("filters by pattern type with no matches", () => {
    const lib = PatternLib.fromBuiltInData();
    const patterns = lib.getPatterns({
      name: null,
      patternType: "spaceship",
    });
    assertEquals(patterns, []);
  });
});

Deno.test("PatternLib.getPatternByKey", async (t) => {
  await t.step("returns the pattern for a known key", () => {
    const lib = PatternLib.fromBuiltInData();
    const pattern = lib.getPatternByKey("blinker");
    assertEquals(pattern.key, "blinker");
    assertEquals(pattern.name, "Blinker");
    assertEquals(pattern.type, "oscillator");
    assertEquals(pattern.period, 2);
    assertEquals(pattern.generations.length, 2);
    assertEquals(
      pattern.generations[0].toString(),
      ". . . . .\n. . # . .\n. . # . .\n. . # . .\n. . . . .",
    );
    assertEquals(
      pattern.generations[1].toString(),
      ". . . . .\n. . . . .\n. # # # .\n. . . . .\n. . . . .",
    );
  });

  await t.step("returns independent grid instances across PatternLib instances", () => {
    const first = PatternLib.fromBuiltInData().getPatternByKey("blinker");
    const second = PatternLib.fromBuiltInData().getPatternByKey("blinker");
    assertEquals(first.generations[0] === second.generations[0], false);
  });

  await t.step("throws for an unknown key", () => {
    const lib = PatternLib.fromBuiltInData();
    assertThrows(
      () => lib.getPatternByKey("nonexistent"),
      Error,
      'No pattern found with key "nonexistent"',
    );
  });
});
