type Neighbors = {
  count: number;
};

const evolve = (target: number, neighbors: Neighbors) => {
  if (neighbors.count < 0 || neighbors.count > 8) {
    throw new Error(`Invalid neighbor count ${neighbors.count}`);
  }

  if (target === 1) {
    if (neighbors.count === 2 || neighbors.count === 3) return target;
    return 0;
  }

  if (target === 0) {
    if (neighbors.count === 3) return 1;
    return target;
  }

  throw new Error(`Invalid target cell value ${target}`);
};

export { evolve };
