import { assertThrows } from "@std/assert";
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
