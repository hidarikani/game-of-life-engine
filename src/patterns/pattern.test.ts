import { assertEquals, assertThrows } from "@std/assert";
import { join } from "@std/path";
import { PatternLib } from "./pattern.ts";

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
    assertEquals(patterns.length, 3);
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

  await t.step("filters by pattern type", () => {
    const patterns = lib.getPatterns({
      name: null,
      patternType: "oscillator",
    });
    assertEquals(patterns.every((p) => p.type === "oscillator"), true);
  });

  await t.step("filters by pattern type with no matches", () => {
    const patterns = lib.getPatterns({
      name: null,
      patternType: "spaceship",
    });
    assertEquals(patterns, []);
  });
});

Deno.test("PatternLib.getPatternByKey", async (t) => {
  const lib = PatternLib.fromBuiltInData();

  await t.step("returns the pattern for a known key", () => {
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

  await t.step("throws for an unknown key", () => {
    assertThrows(
      () => lib.getPatternByKey("nonexistent"),
      Error,
      'No pattern found with key "nonexistent"',
    );
  });
});
