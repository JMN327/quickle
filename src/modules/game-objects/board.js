import Cell from "./cell";
import { cellState } from "./enums/cell-state";
import { direction } from "./enums/direction";

export default function Board() {
  let grid = [[Cell()]];
  grid[0][0].activate();

  let bounds = {
    left: 0,
    top: 0,
    right: 1,
    bottom: 1,
    get hSize() {
      return bounds.right - bounds.left;
    },
    get vSize() {
      return bounds.bottom - bounds.top;
    },
  };

  function cells(state = null) {
    if (!Object.values(cellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    if (state == null) {
      return grid.flat;
    }
    return grid.flat.filter((cell) => (cell.state = state));
  }
  function positions(state = null) {
    if (!Object.values(cellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    let positionArray = [];
    for (let i = 0; i < bounds.hSize; i++) {
      for (let j = 0; j < bounds.vSize; j++) {
        if (grid[i][j].state == state || state == null) {
          positionArray.push([i, j]);
        }
      }
    }
    return positionArray;
  }

  function expand(bound) {
    if (
      !Object.values(direction).includes(bound) ||
      !bound ||
      bound == direction.HORIZONTAL ||
      bound == direction.VERTICAL
    ) {
      throw new Error("A valid direction was not passed to the function");
    }
    // update bounds +1 in direction
    // push, unshift 2d!
  }
  //showValidMoves(tile){for each active cell check if validTiles.includes([tile.color,tile.shape])}
  //placeTile(x,y){sendChecklistUpdates()}
  //

  return {
    get grid() {
      return grid;
    },
    get bounds() {
      return bounds;
    },
    cells,
    positions,
  };
}
