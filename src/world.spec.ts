import { describe, expect, it } from "vitest";
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
} from "./world";

describe("world", () => {
  it.each([
    [1, 1],
    [3, 3],
    [10, 10],
    [100, 100],
    [10, 5],
    [1, 10],
    [10, 1],
  ])("Pristine %i by %i world is created", (width, height) => {
    const actual = makeWorld(width, height);
    const actualWidth = actual[0].length;
    const actualHeight = actual.length;

    expect(actualWidth).toEqual(width);
    expect(actualHeight).toEqual(height);
  });

  it.each([
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
  ])("Seeded %i by %i world is created", (width, height, state, expected) => {
    const actual = makeWorld(width, height, state);
    expect(actual).toEqual(expected);
  });

  it.each([
    [3, 3, [1, 2, 3, 4, 5]],
    [3, 3, [1, 2, 3, 4, 5, 6, 7]],
  ])(
    "World creation fails due to invalid parameters",
    (width, height, state) => {
      expect(() => {
        makeWorld(width, height, state);
      }).toThrow();
    },
  );

  it.each([
    [2, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 2],
    [8, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 0],
  ])("getNeighborTop returns %s", (expected, world, x, y) => {
    const actual = getNeighborTop(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [8, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [2, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 2],
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 0],
  ])("getNeighborBottom returns %s", (expected, world, x, y) => {
    const actual = getNeighborBottom(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [6, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 1],
    [4, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 1],
  ])("getNeighborLeft returns %s", (expected, world, x, y) => {
    const actual = getNeighborLeft(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 1],
    [6, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [4, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 1],
  ])("getNeighborRight returns %s", (expected, world, x, y) => {
    const actual = getNeighborRight(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [9, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 0],
    [1, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 2],
  ])("getNeighborTopLeft returns %s", (expected, world, x, y) => {
    const actual = getNeighborTopLeft(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 0],
    [9, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [1, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 2],
  ])("getNeighborBottomRight returns %s", (expected, world, x, y) => {
    const actual = getNeighborBottomRight(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [7, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 0],
    [3, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 2],
  ])("getNeighborTopRight returns %s", (expected, world, x, y) => {
    const actual = getNeighborTopRight(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    [5, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 0],
    [7, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 1, 1],
    [3, makeWorld(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 2],
  ])("getNeighborBottomLeft returns %s", (expected, world, x, y) => {
    const actual = getNeighborBottomLeft(world, x, y);
    expect(actual).toEqual(expected);
  });

  it.each([
    // 1 0 0 0
    // 0 0 0 0
    // 0 0 0 0
    // 0 0 0 0
    [
      0,
      makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      0,
      0,
    ],
    [
      1,
      makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      1,
      1,
    ],
    [
      0,
      makeWorld(4, 4, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      2,
      2,
    ],
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
  ])("countNeighbors returns %s", (expected, world, x, y) => {
    const actual = countNeighbors(world, x, y);
    expect(actual).toEqual(expected);
  });
});
