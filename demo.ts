import { Engine, Grid, PatternLib } from "./mod.ts";
import type { GridSize } from "./mod.ts";

const lib = PatternLib.fromBuiltInData();
const blinker = lib.getPatternByKey("blinker");
const toad = lib.getPatternByKey("toad");
if (!blinker || !toad) {
  throw new Error("built-in patterns not found");
}

// A blank 20x10 world, big enough to fit both patterns side by side
const gridSize: GridSize = { w: 20, h: 10 };
const firstGeneration = new Grid({ gridSize });

firstGeneration.writeGrid({
  inner: blinker.generations[0],
  offset: { x: 1, y: 2 },
});
firstGeneration.writeGrid({
  inner: toad.generations[0],
  offset: { x: 8, y: 2 },
});

const engine = new Engine({ firstGeneration });

console.log("Generation 0:");
console.log(engine.toString());

engine.evolveGrid();

console.log("Generation 1:");
console.log(engine.toString());
