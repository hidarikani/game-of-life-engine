import type { Point, Rectangle } from "../types.ts";

const isXOutsideBorder = (x: number, worldWidth: number): boolean => {
  return x < -1 || x > worldWidth;
};

const isYOutsideBorder = (y: number, worldHeight: number): boolean => {
  return y < -1 || y > worldHeight;
};

export const isPointOutsideBorder = (
  { x, y }: Point,
  { w, h }: Rectangle,
): boolean => {
  return isXOutsideBorder(x, w) || isYOutsideBorder(y, h);
};

const isXOnBorder = (x: number, worldWidth: number): boolean => {
  return x === -1 || x === worldWidth;
};

const isYOnBorder = (y: number, worldHeight: number): boolean => {
  return y === -1 || y === worldHeight;
}; 

export const isPointOnBorder = (
  { x, y }: Point,
  { w, h }: Rectangle,
): boolean => {
  return isXOnBorder(x, w) || isYOnBorder(y, h);
};
