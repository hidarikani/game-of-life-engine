import type { CellKey, LiveCells } from "../types/cell.ts";
import type { GridSize } from "../types/grid.ts";

import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  generationToString,
  normalizeSeed,
  stringToGeneration,
} from "./seed.ts";

describe("seed", () => {
  describe("stringToGeneration", () => {
    it("valid seed passes", () => {
      const validSeed = `
      # . . #
      . # # .
      . . . #
      # # . .
      `;
      stringToGeneration(validSeed, 4, 4);
    });

    describe("invalid characters throw", () => {
      it("Seed containing `O` throws", () => {
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

      it("Seed containing `,` throws", () => {
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

    it("incorrect height throws", () => {
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

    it("incorrect width throws", () => {
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

    it("alive cells are correctly identified", () => {
      const seed = `
      # . . #
      . # # .
      . . . #
      # # . .
      `;
      const aliveCells = stringToGeneration(seed, 4, 4);
      const expectedAliveCellKeys: CellKey[] = [
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

      const unexpectedAliveCellKeys: CellKey[] = [
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
  });

  describe("generationToString", () => {
    it("empty generation returns all dead cells", () => {
      const generation: LiveCells = new Map();
      const size: GridSize = { w: 3, h: 3 };
      const result = generationToString(generation, size);
      const expected = ". . .\n. . .\n. . .";
      assertEquals(result, expected);
    });

    it("reproduces original seed string", () => {
      const seed = `
      # . . #
      . # # .
      . . . #
      # # . .
      `;
      const size = { w: 4, h: 4 };
      const generation = stringToGeneration(seed, size.w, size.h);
      const result = generationToString(generation, size);
      const expected = normalizeSeed(seed);
      assertEquals(result, expected);
    });
  });
});
