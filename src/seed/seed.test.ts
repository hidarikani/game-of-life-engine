import type { CellChars, Generation, Rectangle } from "../types.ts";
import { assertEquals, assertThrows } from "@std/assert";
import {
  createCellKey,
  generationToString,
  stringToGeneration,
} from "./seed.ts";

Deno.test("stringToGeneration: valid seed passes", () => {
  const validSeed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  stringToGeneration(validSeed, 4, 4);
});

Deno.test("stringToGeneration: invalid characters throw", async (t) => {
  await t.step("Seed containing `O` throws", () => {
    const invalidSeed = `
    # . . O
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => stringToGeneration(invalidSeed, 4, 4),
      Error,
      "Seed contains invalid characters",
    );
  });
  await t.step("Seed containing `,` throws", () => {
    const invalidSeed = `
    # . . ,
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => stringToGeneration(invalidSeed, 4, 4),
      Error,
      "Seed contains invalid characters",
    );
  });
});

Deno.test("stringToGeneration: incorrect height throws", () => {
  const invalidSeed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  assertThrows(
    () => stringToGeneration(invalidSeed, 4, 5),
    Error,
    "Seed height does not match specified height",
  );
});

Deno.test("stringToGeneration: incorrect width throws", () => {
  const invalidSeed = `
  # . . #
  . # # .
  . . . #
  # #   . 
  `;
  assertThrows(
    () => stringToGeneration(invalidSeed, 4, 4),
    Error,
    "Seed width does not match specified width",
  );
});

Deno.test("stringToGeneration: alive cells are correctly identified", () => {
  const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  const aliveCells = stringToGeneration(seed, 4, 4);
  const expectedAliveCellKeys = [
    "0,0",
    "3,0",
    "1,1",
    "2,1",
    "3,2",
    "0,3",
    "1,3",
  ];

  for (const key of expectedAliveCellKeys) {
    if (!aliveCells.has(key)) {
      throw new Error(`Expected alive cell at ${key} not found`);
    }
  }

  const unexpectedAliveCellKeys = [
    "0,1",
    "0,2",
    "0,1",
    "3,1",
    "0,2",
    "1,2",
    "1,2",
    "2,3",
    "4,3",
  ];

  for (const key of unexpectedAliveCellKeys) {
    if (aliveCells.has(key)) {
      throw new Error(`Unexpected alive cell at ${key} found`);
    }
  }
});

Deno.test("generationToString: empty generation returns all dead cells", () => {
  const generation: Generation = new Map();
  const size: Rectangle = { w: 3, h: 3 };
  const result = generationToString(generation, size);
  const expected = ". . .\n. . .\n. . .";
  assertEquals(result, expected);
});

Deno.test("generationToString: reproduces original seed string", () => {
  const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  const size = { w: 4, h: 4 };
  const generation = stringToGeneration(seed, size.w, size.h);
  const result = generationToString(generation, size);
  const expected = "# . . #\n. # # .\n. . . #\n# # . .";
  assertEquals(result, expected);
});
