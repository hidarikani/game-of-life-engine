import { assertEquals } from "@std/assert";
import {
  isPointInsideBorder,
  isPointOnBorder,
  isPointOutsideBorder,
  validateMinGridSize,
} from "./geometry.ts";

Deno.test("Geometry: validateMinGridSize", async (t) => {
  await t.step("valid grid at minimum size (3x3) passes", () => {
    assertEquals(validateMinGridSize({ w: 3, h: 3 }), { valid: true });
  });

  await t.step("valid grid larger than minimum passes", () => {
    assertEquals(validateMinGridSize({ w: 10, h: 10 }), { valid: true });
    assertEquals(validateMinGridSize({ w: 3, h: 10 }), { valid: true });
    assertEquals(validateMinGridSize({ w: 10, h: 3 }), { valid: true });
  });

  await t.step("width below minimum fails with message", () => {
    assertEquals(validateMinGridSize({ w: 2, h: 3 }), {
      valid: false,
      message: "Grid must be at least 3 cells wide and 3 cells tall",
    });
  });

  await t.step("height below minimum fails with message", () => {
    assertEquals(validateMinGridSize({ w: 3, h: 2 }), {
      valid: false,
      message: "Grid must be at least 3 cells wide and 3 cells tall",
    });
  });
});

Deno.test("Geometry: isPointOutsideBorder", async (t) => {
  const rect = { w: 5, h: 5 };

  await t.step("points clearly inside are not outside", () => {
    assertEquals(isPointOutsideBorder({ x: 0, y: 0 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 1, y: 1 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 4, y: 4 }, rect), false);
  });

  await t.step("points on border are not outside", () => {
    assertEquals(isPointOutsideBorder({ x: -1, y: 0 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 5, y: 0 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 0, y: -1 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 0, y: 5 }, rect), false);
  });

  await t.step("corner points on border are not outside", () => {
    assertEquals(isPointOutsideBorder({ x: -1, y: -1 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: -1, y: 5 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 5, y: -1 }, rect), false);
    assertEquals(isPointOutsideBorder({ x: 5, y: 5 }, rect), false);
  });

  await t.step("points outside beyond border are outside", () => {
    assertEquals(isPointOutsideBorder({ x: -2, y: 0 }, rect), true);
    assertEquals(isPointOutsideBorder({ x: 6, y: 0 }, rect), true);
    assertEquals(isPointOutsideBorder({ x: 0, y: -2 }, rect), true);
    assertEquals(isPointOutsideBorder({ x: 0, y: 6 }, rect), true);
  });

  await t.step("diagonal outside beyond border are outside", () => {
    assertEquals(isPointOutsideBorder({ x: -2, y: -2 }, rect), true);
    assertEquals(isPointOutsideBorder({ x: 6, y: 6 }, rect), true);
  });
});

Deno.test("Geometry: isPointOnBorder", async (t) => {
  const rect = { w: 5, h: 5 };

  await t.step("points clearly inside are not on border", () => {
    assertEquals(isPointOnBorder({ x: 0, y: 0 }, rect), false);
    assertEquals(isPointOnBorder({ x: 2, y: 2 }, rect), false);
    assertEquals(isPointOnBorder({ x: 4, y: 4 }, rect), false);
  });

  await t.step("points on the edges are on border", () => {
    assertEquals(isPointOnBorder({ x: -1, y: 0 }, rect), true);
    assertEquals(isPointOnBorder({ x: 5, y: 0 }, rect), true);
    assertEquals(isPointOnBorder({ x: 0, y: -1 }, rect), true);
    assertEquals(isPointOnBorder({ x: 0, y: 5 }, rect), true);
  });

  await t.step("corner points are on border", () => {
    assertEquals(isPointOnBorder({ x: -1, y: -1 }, rect), true);
    assertEquals(isPointOnBorder({ x: -1, y: 5 }, rect), true);
    assertEquals(isPointOnBorder({ x: 5, y: -1 }, rect), true);
    assertEquals(isPointOnBorder({ x: 5, y: 5 }, rect), true);
  });

  await t.step("points outside beyond border are not on border", () => {
    assertEquals(isPointOnBorder({ x: -2, y: 0 }, rect), false);
    assertEquals(isPointOnBorder({ x: 6, y: 0 }, rect), false);
    assertEquals(isPointOnBorder({ x: 0, y: -2 }, rect), false);
    assertEquals(isPointOnBorder({ x: 0, y: 6 }, rect), false);
  });
});

Deno.test("Geometry: isPointInsideBorder", async (t) => {
  const rect = { w: 5, h: 5 };

  await t.step("points clearly inside are inside", () => {
    assertEquals(isPointInsideBorder({ x: 0, y: 0 }, rect), true);
    assertEquals(isPointInsideBorder({ x: 2, y: 2 }, rect), true);
    assertEquals(isPointInsideBorder({ x: 4, y: 4 }, rect), true);
  });

  await t.step("points on the border are not inside", () => {
    assertEquals(isPointInsideBorder({ x: -1, y: 0 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 5, y: 0 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 0, y: -1 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 0, y: 5 }, rect), false);
  });

  await t.step("corner points on border are not inside", () => {
    assertEquals(isPointInsideBorder({ x: -1, y: -1 }, rect), false);
    assertEquals(isPointInsideBorder({ x: -1, y: 5 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 5, y: -1 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 5, y: 5 }, rect), false);
  });

  await t.step("points outside beyond border are not inside", () => {
    assertEquals(isPointInsideBorder({ x: -2, y: 0 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 6, y: 0 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 0, y: -2 }, rect), false);
    assertEquals(isPointInsideBorder({ x: 0, y: 6 }, rect), false);
  });
});
