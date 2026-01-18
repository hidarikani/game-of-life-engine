# game-of-life-engine

## Development

Runs on [Deno][deno]. Tested with `deno --version` `2.5.x`.

```zsh
# run unit tests in watch mode
deno run test:watch
```

## Coordinates

Instantiating a world with the following params:

```js
const world = new World({ width: 8, height: 4 });
```

Will result in the following grid. Dead cells are represented by `.` and live
cells by `#`. The coordinates of the only live cell on the grid below is
`{x: 2, y: 1}`.

```
    | -1 | 0 1 2 3 4 5 6 7 8 | 9 |
    +----------------------------> X axis
 -1 |  . | . . . . . . . . . | . |
    +----+-------------------+---+
  0 |  . | . . . . . . . . . | . |
  1 |  . | . . # . . . . . . | . |
  2 |  . | . . . . . . . . . | . |
  3 |  . | . . . . . . . . . | . |
  4 |  . | . . . . . . . . . | . |
    +----+-------------------+---+
  5 |  . | . . . . . . . . . | . |
    +----+-------------------+---+ 
    v
Y axis
```

Notice 1 cell border around the world (`x = -1, x = 9, y = -1, y = 5`). The
behavior of border cells depends on `GridMode`.

- `GridMode.Finite` — border cells are treated as permanently dead. In this
  world, a glider that hits the bottom-right corner simply disintegrates. This
  is easy to implement, but philosophically a little brutal. The universe has
  edges, and they are lethal. For example, the top-left neighbor of cell
  `{ x: 0, y: 0 }` is at `{ x: -1, y: -1 }` and will always be dead (`false`)
- `GridMode.Toroidal` — The left edge connects to the right, the top connects to
  the bottom. In that case, a spaceship exiting the bottom-right reappears at
  the top-left. This turns the universe into the surface of a donut. It’s
  mathematically tidy and popular for demos, but it introduces artificial
  interactions—your glider can collide with its own past if the grid is small.
  For example when trying to access cell at `{ x: 9, y: 5}` it shall be
  translated to `{ x: 0, y: 0 }`.

  ---

  [deno]: https://deno.com/
