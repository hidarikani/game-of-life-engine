import { assertThrows } from "@std/assert";
import { GridMode } from "./constants.ts";
import { World } from "./better-world.ts";

Deno.test("World: width too small throws", () => {
  // MIN_WIDTH is 3; using 2 should throw
  assertThrows(
    () => new World({ width: 2, height: 3 }),
    Error,
    "Width must be at least 3",
  );
});

Deno.test("World: height too small throws", () => {
  // MIN_HEIGHT is 3; using 2 should throw
  assertThrows(
    () => new World({ width: 3, height: 2 }),
    Error,
    "Height must be at least 3",
  );
});

Deno.test("World.getCell: out of bounds throws", async (t) => {
  await t.step("left edge exceeded", () => {
    const world = new World({ width: 5, height: 5 });
    assertThrows(
      () => world.getCell(-2, 0),
      Error,
      "Cell (-2, 0) is out of bounds",
    );
  });

  await t.step("right edge exceeded", () => {
    const width = 5;
    const world = new World({ width, height: 5 });
    assertThrows(
      () => world.getCell(width + 1, 0),
      Error,
      `Cell (${width + 1}, 0) is out of bounds`,
    );
  });

  await t.step("top edge exceeded", () => {
    const world = new World({ width: 5, height: 5 });
    assertThrows(
      () => world.getCell(0, -2),
      Error,
      "Cell (0, -2) is out of bounds",
    );
  });

  await t.step("bottom edge exceeded", () => {
    const height = 5;
    const world = new World({ width: 5, height });
    assertThrows(
      () => world.getCell(0, height + 1),
      Error,
      `Cell (0, ${height + 1}) is out of bounds`,
    );
  });
});

Deno.test("World.getCell: toroidal border wrapping", async (t) => {
  const seed = `
  # . # 
  . . . 
  # . . 
  `;

  const world = new World({
    width: 3,
    height: 3,
    mode: GridMode.Toroidal,
    seed,
  });

  await t.step("cell { x: 2, y: 2 } right neighbor is alive", () => {
    const rightNeighborX = 3; // wraps to 0
    const rightNeighborY = 2;
    const isAlive = world.getCell(rightNeighborX, rightNeighborY);
    if (!isAlive) {
      throw new Error(
        `Expected cell (${rightNeighborX}, ${rightNeighborY}) to be alive due to wrapping, but it was dead.`,
      );
    }
  });

  await t.step("cell { x: 2, y: 2 } bottom neighbor is alive", () => {
    const bottomNeighborX = 2;
    const bottomNeighborY = 3; // wraps to 0
    const isAlive = world.getCell(bottomNeighborX, bottomNeighborY);
    if (!isAlive) {
      throw new Error(
        `Expected cell (${bottomNeighborX}, ${bottomNeighborY}) to be alive due to wrapping, but it was dead.`,
      );
    }
  });

  await t.step("cell { x: 2, y: 2 } bottom-right neighbor is alive", () => {
    const bottomRightNeighborX = 3; // wraps to 0
    const bottomRightNeighborY = 3; // wraps to 0
    const isAlive = world.getCell(bottomRightNeighborX, bottomRightNeighborY);
    if (!isAlive) {
      throw new Error(
        `Expected cell (${bottomRightNeighborX}, ${bottomRightNeighborY}) to be alive due to wrapping, but it was dead.`,
      );
    }
  });
});
