/**
 * Runnable walkthrough of the examples in README.md.
 *
 * Run with:
 *   deno run src/patterns/pattern.demo.ts
 */
import { Engine, PatternLib } from "../../mod.ts";
import type { PatternFilter } from "../../mod.ts";

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

// --- Built-in patterns vs. your own file --------------------------------

section("Built-in patterns vs. your own file");

// No --allow-read needed
const builtIn = PatternLib.fromBuiltInData();

// Requires --allow-read (or --allow-read=./my-patterns.yaml)
// const custom = PatternLib.fromYamlFile("./my-patterns.yaml");

console.log("built-in pattern count:", builtIn.getPatterns(null).length);

// --- Looking up patterns -------------------------------------------------

section("Looking up patterns");

const lib = PatternLib.fromBuiltInData();

const blinker = lib.getPatternByKey("blinker");
console.log(blinker.name); // "Blinker"
console.log(blinker.generations[0].toString());

const all = lib.getPatterns(null);
console.log("all patterns:", all.length);

const filter: PatternFilter = { name: /^b/i, patternType: null };
const startingWithB = lib.getPatterns(filter);
console.log("starting with b:", startingWithB.map((p) => p.name));

const oscillators = lib.getPatterns({ name: null, patternType: "oscillator" });
console.log("oscillators:", oscillators.map((p) => p.name));

// --- Using a pattern with Engine -----------------------------------------

section("Using a pattern with Engine");

const engine = new Engine({ firstGeneration: blinker.generations[0] });
engine.evolveGrid();

console.log(engine.toString()); // matches blinker.generations[1]
