import type { CellKey, LiveCells } from "../types/cell.ts";
import type { GridSize } from "../types/grid.ts";

import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";

import {
  generationToString,
  normalizeSeed,
  randSeed,
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
      const generation: LiveCells = new Set();
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

  describe("randSeed", () => {
    describe("invalid bias throws", () => {
      it("bias of exactly 0 throws", () => {
        assertThrows(
          () => randSeed({ w: 3, h: 3 }, 0),
          Error,
          "bias must be larger than zero and less than 1",
        );
      });

      it("bias of exactly 1 throws", () => {
        assertThrows(
          () => randSeed({ w: 3, h: 3 }, 1),
          Error,
          "bias must be larger than zero and less than 1",
        );
      });

      it("negative bias throws", () => {
        assertThrows(
          () => randSeed({ w: 3, h: 3 }, -0.1),
          Error,
          "bias must be larger than zero and less than 1",
        );
      });

      it("bias greater than 1 throws", () => {
        assertThrows(
          () => randSeed({ w: 3, h: 3 }, 1.1),
          Error,
          "bias must be larger than zero and less than 1",
        );
      });
    });

    it("defaults to a bias of 0.5 when omitted", () => {
      using _randomStub = stub(Math, "random", () => 0.6);
      const size = { w: 2, h: 2 };
      const result = randSeed(size);
      assertEquals(result, "# #\n# #");
    });

    it("produces a row per height and a cell per width", () => {
      const size = { w: 5, h: 3 };
      const result = randSeed(size, 0.5);
      const rows = result.split("\n");
      assertEquals(rows.length, size.h);
      for (const row of rows) {
        assertEquals(row.split(" ").length, size.w);
      }
    });

    it("only produces valid seed characters that parse back cleanly", () => {
      const size = { w: 6, h: 6 };
      const result = randSeed(size, 0.3);
      stringToGeneration(result, size.w, size.h);
    });

    it("a cell is dead when the random draw is below bias", () => {
      using _randomStub = stub(Math, "random", () => 0.2);
      const result = randSeed({ w: 2, h: 2 }, 0.5);
      assertEquals(result, ". .\n. .");
    });

    it("a cell is alive when the random draw is above bias", () => {
      using _randomStub = stub(Math, "random", () => 0.8);
      const result = randSeed({ w: 2, h: 2 }, 0.5);
      assertEquals(result, "# #\n# #");
    });

    it("a cell is dead when the random draw equals bias exactly", () => {
      using _randomStub = stub(Math, "random", () => 0.5);
      const result = randSeed({ w: 1, h: 1 }, 0.5);
      assertEquals(result, ".");
    });

    it("a lower bias raises the chance of a cell being alive", () => {
      using _randomStub = stub(Math, "random", () => 0.4);
      const result = randSeed({ w: 1, h: 1 }, 0.1);
      assertEquals(result, "#");
    });

    it("a higher bias lowers the chance of a cell being alive", () => {
      using _randomStub = stub(Math, "random", () => 0.4);
      const result = randSeed({ w: 1, h: 1 }, 0.9);
      assertEquals(result, ".");
    });
  });
});
