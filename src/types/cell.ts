/** The two characters a seed string may use for a cell: alive or dead. */
export type CellChars = "#" | ".";

/**
 * A `Point` serialized as `"x,y"`, used as a `Map` key because object
 * identity would make two equal points distinct keys.
 */
export type CellKey = `${number},${number}`;

/**
 * Sparse storage of a grid's living cells. Only live cells are present;
 * absence of a key means the cell is dead.
 */
export type LiveCells = Map<CellKey, boolean>;
