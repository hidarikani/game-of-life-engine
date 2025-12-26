import { assertEquals, assertThrows } from "@std/assert";
import { evolve } from "./rules.ts";

Deno.test("rules: live cell underpopulation dies", async (t) => {
  for (const count of [0, 1]) {
    await t.step(`Live cell with ${count} live neighbors dies`, () => {
      const neighbors = { count };
      const actual = evolve(1, neighbors);
      assertEquals(actual, 0);
    });
  }
});

Deno.test("rules: live cell survival", async (t) => {
  for (const count of [2, 3]) {
    await t.step(`Live cell with ${count} live neighbors survives`, () => {
      const neighbors = { count };
      const actual = evolve(1, neighbors);
      assertEquals(actual, 1);
    });
  }
});

Deno.test("rules: live cell overpopulation dies", async (t) => {
  for (const count of [4, 5, 6, 7, 8]) {
    await t.step(`Live cell with ${count} live neighbors dies`, () => {
      const neighbors = { count };
      const actual = evolve(1, neighbors);
      assertEquals(actual, 0);
    });
  }
});

Deno.test("rules: dead cell with exactly 3 neighbors becomes live", () => {
  const neighbors = { count: 3 };
  const actual = evolve(0, neighbors);
  assertEquals(actual, 1);
});

Deno.test("rules: dead cell with other counts stays dead", async (t) => {
  for (const count of [0, 1, 2, 4, 5, 6, 7, 8]) {
    await t.step(`Dead cell with ${count} live neighbors stays dead`, () => {
      const neighbors = { count };
      const actual = evolve(0, neighbors);
      assertEquals(actual, 0);
    });
  }
});

Deno.test("rules: invalid target cell state throws", async (t) => {
  for (const state of [-128, -1, 2, 256]) {
    await t.step(`Invalid target cell state ${state} throws`, () => {
      const neighbors = { count: 0 };
      assertThrows(() => evolve(state, neighbors));
    });
  }
});

Deno.test("rules: invalid neighbor count throws", async (t) => {
  for (const count of [-128, -1, 9, 256]) {
    await t.step(`Invalid neighbor count ${count} throws`, () => {
      const neighbors = { count };
      assertThrows(() => evolve(1, neighbors));
    });
  }
});
