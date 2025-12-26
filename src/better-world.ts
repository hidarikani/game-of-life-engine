export enum GridMode {
  Finite,
  WrappedEdges,
}

const MIN_WIDTH = 3;
const MIN_HEIGHT = 3;

type WorldOptions = {
  width: number;
  height: number;
  mode?: GridMode;
};

export class World {
  width: number;
  height: number;
  liveCells: Map<string, boolean>;

  constructor(
    { width, height, mode = GridMode.Finite }: WorldOptions,
  ) {
    if (width < MIN_WIDTH) {
      throw new Error(`Width must be at least ${MIN_WIDTH}`);
    }

    if (height < MIN_HEIGHT) {
      throw new Error(`Height must be at least ${MIN_HEIGHT}`);
    }

    this.width = width;
    this.height = height;
    this.liveCells = new Map();
  }
}
