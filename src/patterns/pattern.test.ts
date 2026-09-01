import { assertEquals, assertExists, assertThrows } from "@std/assert";
import { join } from "@std/path";
import { PatternLib } from "./pattern.ts";
import { PATTERN_TYPES } from "../constants.ts";

const YAML_FILE_PATH = join(
  import.meta.dirname!,
  "../../data/patterns/patterns.yaml",
);

Deno.test("PatternLib.fromBuiltInData", async (t) => {
  await t.step("returns a PatternLib instance with patterns loaded", () => {
    const lib = PatternLib.fromBuiltInData();
    assertEquals(lib.getPatterns(null).length > 0, true);
  });
});

Deno.test("PatternLib.fromYamlFile", async (t) => {
  await t.step("returns a PatternLib instance with patterns loaded", () => {
    const lib = PatternLib.fromYamlFile(YAML_FILE_PATH);
    assertEquals(lib.getPatterns(null).length > 0, true);
  });

  await t.step("throws for a missing file", () => {
    assertThrows(
      () => PatternLib.fromYamlFile("./does-not-exist.yaml"),
      Deno.errors.NotFound,
    );
  });
});

Deno.test("PatternLib.getPatterns", async (t) => {
  const lib = PatternLib.fromBuiltInData();

  await t.step("returns all patterns when filter is null", () => {
    const patterns = lib.getPatterns(null);
    assertEquals(patterns.length, 6);
  });

  await t.step("filters by name regex", () => {
    const patterns = lib.getPatterns({ name: /blink/i, patternType: null });
    assertEquals(patterns.every((p) => /blink/i.test(p.name)), true);
  });

  await t.step("filters by name regex with no matches", () => {
    const patterns = lib.getPatterns({
      name: /nonexistent/i,
      patternType: null,
    });
    assertEquals(patterns, []);
  });

  await t.step("finds type 'oscillator'", () => {
    const patterns = lib.getPatterns({
      name: null,
      patternType: PATTERN_TYPES.OSCILLATOR,
    });
    assertEquals(
      patterns.every((p) => p.type === PATTERN_TYPES.OSCILLATOR),
      true,
    );
  });

  await t.step("finds type 'spaceship'", () => {
    const patterns = lib.getPatterns({
      name: null,
      patternType: PATTERN_TYPES.SPACESHIP,
    });
    assertEquals(
      patterns.every((p) => p.type === PATTERN_TYPES.SPACESHIP),
      true,
    );
  });
  await t.step("finds type 'char'", () => {
    const patterns = lib.getPatterns({
      name: null,
      patternType: PATTERN_TYPES.CHARACTER,
    });
    assertEquals(
      patterns.every((p) => p.type === PATTERN_TYPES.CHARACTER),
      true,
    );
  });
});

Deno.test("PatternLib.getPatternByKey", async (t) => {
  const lib = PatternLib.fromBuiltInData();

  await t.step("returns the pattern for a known key", () => {
    const pattern = lib.getPatternByKey("blinker");
    assertExists(pattern);
    assertEquals(pattern.key, "blinker");
    assertEquals(pattern.name, "Blinker");
    assertEquals(pattern.type, PATTERN_TYPES.OSCILLATOR);
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

  await t.step("returns null for an unknown key", () => {
    assertEquals(lib.getPatternByKey("nonexistent"), null);
  });
});
