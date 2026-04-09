import { assertEquals } from "@std/assert";
import { isPointOutsideBorder, isPointOnBorder } from "./geometry.ts";

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

