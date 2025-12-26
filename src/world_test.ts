import { assertEquals, assertThrows } from "@std/assert";
import {
  countNeighbors,
  getNeighborBottom,
  getNeighborBottomLeft,
  getNeighborBottomRight,
  getNeighborLeft,
  getNeighborRight,
  getNeighborTop,
  getNeighborTopLeft,
  getNeighborTopRight,
  makeWorld,
} from "./world.ts";

Deno.test("world: pristine world creation", async (t) => {
  const cases: Array<[number, number]> = [
    [1, 1],
    [3, 3],
    [10, 10],
    [100, 100],
    [10, 5],
    [1, 10],
    [10, 1],
  ];

  for (const [width, height] of cases) {
    await t.step(`Pristine ${width} by ${height} world is created`, () => {
      const actual = makeWorld(width, height);
      const actualWidth = actual[0].length;
      const actualHeight = actual.length;

      assertEquals(actualWidth, width);
      assertEquals(actualHeight, height);
    });
  }
});

Deno.test("world: seeded world creation", async (t) => {
  const cases: Array<[number, number, number[], number[][]]> = [
    [1, 1, [1], [[1]]],
    [3, 1, [1, 2, 3], [[1, 2, 3]]],
    [1, 3, [1, 2, 3], [[1], [2], [3]]],
    [
      3,
      3,
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    ],
  ];

  for (const [width, height, state, expected] of cases) {
    await t.step(`Seeded ${width} by ${height} world is created`, () => {
      const actual = makeWorld(width, height, state);
      assertEquals(actual, expected);
    });
  }
});

Deno.test("world: invalid creation parameters throw", async (t) => {
  const cases: Array<[number, number, number[]]> = [
    [3, 3, [1, 2, 3, 4, 5]],
    [3, 3, [1, 2, 3, 4, 5, 6, 7]],
  ];

  for (const [width, height, state] of cases) {
    await t.step(`Invalid params (${width}x${height}) with state length ${state.length}`, () => {
      assertThrows(() => makeWorld(width, height, state));
    });
  }
});

Deno.test("world: neighbor getters", async (t) => {
  const w3 = makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const topCases: Array<[number, number[][], number, number]> = [
    [2, w3, 1, 1],
    [5, w3, 1, 2],
    [8, w3, 1, 0],
  ];
  for (const [expected, world, x, y] of topCases) {
    await t.step(`getNeighborTop returns ${expected}`, () => {
      const actual = getNeighborTop(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const bottomCases: Array<[number, number[][], number, number]> = [
    [8, w3, 1, 1],
    [2, w3, 1, 2],
    [5, w3, 1, 0],
  ];
  for (const [expected, world, x, y] of bottomCases) {
    await t.step(`getNeighborBottom returns ${expected}`, () => {
      const actual = getNeighborBottom(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const leftCases: Array<[number, number[][], number, number]> = [
    [6, w3, 0, 1],
    [4, w3, 1, 1],
    [5, w3, 2, 1],
  ];
  for (const [expected, world, x, y] of leftCases) {
    await t.step(`getNeighborLeft returns ${expected}`, () => {
      const actual = getNeighborLeft(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const rightCases: Array<[number, number[][], number, number]> = [
    [5, w3, 0, 1],
    [6, w3, 1, 1],
    [4, w3, 2, 1],
  ];
  for (const [expected, world, x, y] of rightCases) {
    await t.step(`getNeighborRight returns ${expected}`, () => {
      const actual = getNeighborRight(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const topLeftCases: Array<[number, number[][], number, number]> = [
    [9, w3, 0, 0],
    [1, w3, 1, 1],
    [5, w3, 2, 2],
  ];
  for (const [expected, world, x, y] of topLeftCases) {
    await t.step(`getNeighborTopLeft returns ${expected}`, () => {
      const actual = getNeighborTopLeft(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const bottomRightCases: Array<[number, number[][], number, number]> = [
    [5, w3, 0, 0],
    [9, w3, 1, 1],
    [1, w3, 2, 2],
  ];
  for (const [expected, world, x, y] of bottomRightCases) {
    await t.step(`getNeighborBottomRight returns ${expected}`, () => {
      const actual = getNeighborBottomRight(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const topRightCases: Array<[number, number[][], number, number]> = [
    [7, w3, 2, 0],
    [3, w3, 1, 1],
    [5, w3, 0, 2],
  ];
  for (const [expected, world, x, y] of topRightCases) {
    await t.step(`getNeighborTopRight returns ${expected}`, () => {
      const actual = getNeighborTopRight(world, x, y);
      assertEquals(actual, expected);
    });
  }

  const bottomLeftCases: Array<[number, number[][], number, number]> = [
    [5, w3, 2, 0],
    [7, w3, 1, 1],
    [3, w3, 0, 2],
  ];
  for (const [expected, world, x, y] of bottomLeftCases) {
    await t.step(`getNeighborBottomLeft returns ${expected}`, () => {
      const actual = getNeighborBottomLeft(world, x, y);
      assertEquals(actual, expected);
    });
  }
});

Deno.test("world: countNeighbors", async (t) => {
  const cases: Array<[number, number[][], number, number]> = [
    // 1 0 0 0
    // 0 0 0 0
    // 0 0 0 0
    // 0 0 0 0
    [0, makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0, 0],
    [1, makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 1, 1],
    [0, makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 2, 2],
    // 1 0 1
    // 0 0 1
    // 1 1 1
    [6, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 1, 0],
    [6, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 1, 1],
    [5, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 1, 2],
    [6, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 0, 1],
    [6, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 1, 1],
    [5, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 0, 0],
    [5, makeWorld(3, 3, [1, 0, 1, 0, 0, 1, 1, 1, 1]), 2, 2],
  ];

  for (const [expected, world, x, y] of cases) {
    await t.step(`countNeighbors returns ${expected}`, () => {
      const actual = countNeighbors(world, x, y);
      assertEquals(actual, expected);
    });
  }
});
