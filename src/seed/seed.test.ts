import { assertThrows } from "@std/assert";
import { parseWorldSeed } from "./seed.ts";

Deno.test("parseWorldSeed: valid seed passes", () => {
  const validSeed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  parseWorldSeed(validSeed, 4, 4);
});

Deno.test("parseWorldSeed: invalid characters throw", async (t) => {
  await t.step("Seed containing `O` throws", () => {
    const invalidSeed = `
    # . . O
    . # # .
    . . . #
    # # . .
    `;
    assertThrows(
      () => parseWorldSeed(invalidSeed, 4, 4),
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
      () => parseWorldSeed(invalidSeed, 4, 4),
      Error,
      "Seed contains invalid characters",
    );
  });
});

Deno.test("parseWorldSeed: incorrect height throws", () => {
  const invalidSeed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  assertThrows(
    () => parseWorldSeed(invalidSeed, 4, 5),
    Error,
    "Seed height does not match specified height",
  );
});

Deno.test("parseWorldSeed: incorrect width throws", () => {
  const invalidSeed = `
  # . . #
  . # # .
  . . . #
  # #   . 
  `;
  assertThrows(
    () => parseWorldSeed(invalidSeed, 4, 4),
    Error,
    "Seed width does not match specified width",
  );
});

Deno.test("parseWorldSeed: alive cells are correctly identified", () => {
  const seed = `
  # . . #
  . # # .
  . . . #
  # # . .
  `;
  const aliveCells = parseWorldSeed(seed, 4, 4);
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
