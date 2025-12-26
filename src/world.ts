/**
 *   0 1 2 3 4
 *  +---------> X axis
 * 0|
 * 1|    *
 * 2|
 * 3|
 * 4|
 *  V
 * Y axis
 * //world[y][x]
 * //world[1][2]
 */
export const makeWorld = (
  width: number,
  height: number,
  state: number[] | null = null,
): number[][] => {
  if (state !== null && width * height !== state?.length) {
    throw new Error("Invalid arguments");
  }
  const world: number[][] = [];
  let pointer = 0;
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      row.push(state === null ? 0 : state[pointer]);
      pointer++;
    }
    world.push(row);
  }

  return world;
};

export const getNeighborTop = (
  world: number[][],
  x: number,
  y: number,
): number => {
  if (y === 0) return world[world.length - 1][x];

  return world[y - 1][x];
};

export const getNeighborBottom = (
  world: number[][],
  x: number,
  y: number,
): number => {
  if (y === world.length - 1) return world[0][x];

  return world[y + 1][x];
};

export const getNeighborLeft = (
  world: number[][],
  x: number,
  y: number,
): number => {
  if (x === 0) return world[y][world[y].length - 1];

  return world[y][x - 1];
};

export const getNeighborRight = (
  world: number[][],
  x: number,
  y: number,
): number => {
  if (x === world[y].length - 1) return world[y][0];

  return world[y][x + 1];
};

export const getNeighborTopLeft = (
  world: number[][],
  x: number,
  y: number,
): number => {
  let xWarped = x - 1;
  let yWarped = y - 1;

  if (x === 0) xWarped = world[0].length - 1;
  if (y === 0) yWarped = world.length - 1;

  return world[yWarped][xWarped];
};

export const getNeighborBottomRight = (
  world: number[][],
  x: number,
  y: number,
) => {
  let xWarped = x + 1;
  let yWarped = y + 1;

  if (x === world[0].length - 1) xWarped = 0;
  if (y === world.length - 1) yWarped = 0;

  return world[yWarped][xWarped];
};

export const getNeighborTopRight = (
  world: number[][],
  x: number,
  y: number,
): number => {
  let xWarped = x + 1;
  let yWarped = y - 1;

  if (x === world[0].length - 1) xWarped = 0;
  if (y === 0) yWarped = world.length - 1;

  return world[yWarped][xWarped];
};

export const getNeighborBottomLeft = (
  world: number[][],
  x: number,
  y: number,
): number => {
  let xWarped = x - 1;
  let yWarped = y + 1;

  if (x === 0) xWarped = world[0].length - 1;
  if (y === world.length - 1) yWarped = 0;

  return world[yWarped][xWarped];
};

export const countNeighbors = (
  world: number[][],
  x: number,
  y: number,
): number => {
  // clockwise
  const top = getNeighborTop(world, x, y) > 0 ? 1 : 0;
  const topRight = getNeighborTopRight(world, x, y) > 0 ? 1 : 0;
  const right = getNeighborRight(world, x, y) > 0 ? 1 : 0;
  const bottomRight = getNeighborBottomRight(world, x, y) > 0 ? 1 : 0;
  const bottom = getNeighborBottom(world, x, y) > 0 ? 1 : 0;
  const bottomLeft = getNeighborBottomLeft(world, x, y) > 0 ? 1 : 0;
  const left = getNeighborLeft(world, x, y) > 0 ? 1 : 0;
  const topLeft = getNeighborTopLeft(world, x, y) > 0 ? 1 : 0;
  return (
    top + topRight + right + bottomRight + bottom + bottomLeft + left + topLeft
  );
};
