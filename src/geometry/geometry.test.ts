import { assertEquals } from "@std/assert";
import {
  gridContainsCells,
  gridContainsGrid,
  isPointInsideBorder,
  isPointOnBorder,
  isPointOutsideBorder,
  validateMinGridSize,
} from "./geometry.ts";
import { pointToCellKey } from "../seed/seed.ts";

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

Deno.test("Geometry: gridContainsGrid", async (t) => {
  await t.step("returns valid", async (t) => {
    await t.step("inner fits exactly in outer (no offset)", () => {
      assertEquals(
        gridContainsGrid({ outer: { w: 5, h: 5 }, inner: { w: 5, h: 5 } }),
        { valid: true },
      );
    });

    await t.step("inner smaller than outer fits (no offset)", () => {
      assertEquals(
        gridContainsGrid({ outer: { w: 10, h: 10 }, inner: { w: 3, h: 3 } }),
        { valid: true },
      );
    });

    await t.step("inner fits in outer with offset", () => {
      assertEquals(
        gridContainsGrid({
          outer: { w: 10, h: 10 },
          inner: { w: 3, h: 3 },
          offset: { x: 2, y: 2 },
        }),
        { valid: true },
      );
    });

    await t.step("inner fits exactly at offset boundary", () => {
      assertEquals(
        gridContainsGrid({
          outer: { w: 10, h: 10 },
          inner: { w: 5, h: 5 },
          offset: { x: 5, y: 5 },
        }),
        { valid: true },
      );
    });
  });

  await t.step("returns invalid", async (t) => {
    await t.step("inner too wide for outer", () => {
      assertEquals(
        gridContainsGrid({ outer: { w: 4, h: 10 }, inner: { w: 5, h: 3 } }),
        {
          valid: false,
          message:
            "Inner grid of size (5, 3) offset by (0, 0) does not fit in outer grid of size (4, 10).",
        },
      );
    });

    await t.step("inner too tall for outer", () => {
      assertEquals(
        gridContainsGrid({ outer: { w: 10, h: 4 }, inner: { w: 3, h: 5 } }),
        {
          valid: false,
          message:
            "Inner grid of size (3, 5) offset by (0, 0) does not fit in outer grid of size (10, 4).",
        },
      );
    });

    await t.step("inner overflows outer width due to offset", () => {
      assertEquals(
        gridContainsGrid({
          outer: { w: 10, h: 10 },
          inner: { w: 5, h: 5 },
          offset: { x: 6, y: 0 },
        }),
        {
          valid: false,
          message:
            "Inner grid of size (5, 5) offset by (6, 0) does not fit in outer grid of size (10, 10).",
        },
      );
    });

    await t.step("inner overflows outer height due to offset", () => {
      assertEquals(
        gridContainsGrid({
          outer: { w: 10, h: 10 },
          inner: { w: 5, h: 5 },
          offset: { x: 0, y: 6 },
        }),
        {
          valid: false,
          message:
            "Inner grid of size (5, 5) offset by (0, 6) does not fit in outer grid of size (10, 10).",
        },
      );
    });
  });
});

Deno.test("Geometry: gridContainsCells", async (t) => {
  await t.step("returns valid", async (t) => {
    await t.step("empty cells map is valid for any grid", () => {
      const inner = new Map();
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        { valid: true },
      );
    });

    await t.step("cell at top-left corner (0,0) is valid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 0, y: 0 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        { valid: true },
      );
    });

    await t.step("cell at bottom-right interior corner is valid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 4, y: 4 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        { valid: true },
      );
    });

    await t.step("multiple cells all inside grid are valid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 1, y: 1 }), true);
      inner.set(pointToCellKey({ x: 2, y: 2 }), true);
      inner.set(pointToCellKey({ x: 3, y: 3 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        { valid: true },
      );
    });
  });

  await t.step("returns invalid", async (t) => {
    await t.step("cell with negative x is invalid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: -1, y: 2 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        {
          valid: false,
          message: "Cell at (-1, 2) is outside the grid of size (5, 5).",
        },
      );
    });

    await t.step("cell with negative y is invalid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 2, y: -1 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        {
          valid: false,
          message: "Cell at (2, -1) is outside the grid of size (5, 5).",
        },
      );
    });

    await t.step("cell with x equal to grid width is invalid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 5, y: 2 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        {
          valid: false,
          message: "Cell at (5, 2) is outside the grid of size (5, 5).",
        },
      );
    });

    await t.step("cell with y equal to grid height is invalid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 2, y: 5 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        {
          valid: false,
          message: "Cell at (2, 5) is outside the grid of size (5, 5).",
        },
      );
    });

    await t.step("one out-of-bounds cell among valid cells is invalid", () => {
      const inner = new Map();
      inner.set(pointToCellKey({ x: 1, y: 1 }), true);
      inner.set(pointToCellKey({ x: 10, y: 10 }), true);
      assertEquals(
        gridContainsCells({ outer: { w: 5, h: 5 }, inner }),
        {
          valid: false,
          message: "Cell at (10, 10) is outside the grid of size (5, 5).",
        },
      );
    });
  });
});