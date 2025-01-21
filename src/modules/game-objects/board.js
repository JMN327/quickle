import Cell from "./cell";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Morph } from "./enums/morph";
import { TileState } from "./enums/tile-state";
import { Update } from "./enums/update-type";

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
    increment(direction, morphType) {
      if (direction == Direction.LEFT || direction == Direction.TOP) {
        bounds[direction] -= 1 * morphType;
      } else {
        bounds[direction] += 1 * morphType;
      }
    },
    get info() {
      return `l:${bounds.left} t:${bounds.top} r:${bounds.right} b:${bounds.bottom}`;
    },
  };

  function cells(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    if (state == null) {
      return grid.flat;
    }
    return grid.flat.filter((cell) => (cell.state = state));
  }
  function positions(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
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

  function morph(direction, morphType) {
    if (
      !Object.values(Direction).includes(direction) ||
      !direction ||
      direction == Direction.HORIZONTAL ||
      direction == Direction.VERTICAL
    ) {
      throw new Error("A valid direction was not passed to the function");
    }
    //update bounds
    bounds.increment(direction, morphType);
    // update grid
    switch (direction) {
      case Direction.LEFT:
        grid.forEach((arr) => {
          if ((morphType = Morph.GROW)) {
            arr.unshift(Cell());
          } else if ((morphType = Morph.SHRINK)) {
            arr.shift();
          }
        });
        break;

      case Direction.TOP:
        if (morphType == Morph.GROW) {
          grid.unshift(Array(6).fill(Cell()));
        } else if ((morphType = Morph.SHRINK)) {
          grid.shift();
        }
        break;

      case Direction.RIGHT:
        grid.forEach((arr) => {
          if ((morphType = Morph.GROW)) {
            arr.push(Cell());
          } else if ((morphType = Morph.SHRINK)) {
            arr.pop();
          }
        });
        break;

      case Direction.BOTTOM:
        if ((morphType = Morph.GROW)) {
          grid.push(Array(6).fill(Cell()));
        } else if ((morphType = Morph.SHRINK)) {
          grid.pop();
        }
        break;
    }
  }

  function addTile(tile, row, col) {
    if (tile.state != TileState.MOVING) {
      throw new Error("You cannot place a tile which is not in 'moving' state");
    }
    let cell = grid[row][col];
    cell.addTile(tile);
    let edges = checkForEdgeGrow(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.GROW);
    });
    sendCheckListUpdates(Update.ADD, row, col, tile);
  }

  function removeTile(row, col) {
    if (tile.state != TileState.PLACED) {
      throw new Error(
        "You cannot remove a tile which is not in 'placed' state"
      );
    }
    let cell = grid[row][col];
    let removedTile = cell.removeTile();
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.SHRINK);
    });
    sendCheckListUpdates(Update.REMOVE, row, col, removedTile);
  }

  function fixTiles() {
    cells(CellState.PLACED).forEach((cell) => {
      cell.state = CellState.FIXED;
    });
    return removedTile;
  }

  function checkForEdgeGrow(row, col) {
    let edges = [];
    if (row == 0) {
      edges.push(Direction.LEFT);
    }
    if (col == 0) {
      edges.push(Direction.TOP);
    }
    if (row == bounds.hSize - 1) {
      edges.push(Direction.RIGHT);
    }
    if (col == bounds.vSize - 1) {
      edges.push(Direction.BOTTOM);
    }
    return edges;
  }

  function checkForEdgeShrink(row, col) {
    let edges = [];
    if (col == 1) {
      if (
        grid.every((rowArr, index) => {
          rowArr[0].state = CellState.DORMANT || index == row;
        })
      ) {
        edges.push(Direction.LEFT);
      }
    }
    if (row == 1) {
      if (
        grid[0].every((cell, index) => {
          cell.state = CellState.DORMANT || index == col;
        })
      ) {
        edges.push(Direction.TOP);
      }
    }
    if (col == bounds.hSize - 2) {
      if (
        grid.every((rowArr, index) => {
          rowArr[bounds.hSize - 1].state = CellState.DORMANT || index == row;
        })
      ) {
        edges.push(Direction.RIGHT);
      }
    }
    if (row == bounds.vSize - 2) {
      if (
        grid[bounds.vSize - 1].every((cell, index) => {
          cell.state = CellState.DORMANT || index == col;
        })
      ) {
        edges.push(Direction.BOTTOM);
      }
    }
    return edges;
  }

  function sendCheckListUpdates(updateType, row, col, tile) {
    let positionsToUpdate = neighbourPositions(row, col);
    positionsToUpdate.forEach((pos) => {
      if (updateType == Update.ADD) {
        grid[pos.row][pos.col].checkList.addTile(
          pos.direction,
          tile.color,
          tile.shape
        );
      } else if (updateType == Update.REMOVE) {
        grid[pos.row][pos.col].checkList.removeTile(
          pos.direction,
          tile.color,
          tile.shape
        );
      }
    });
  }

  function neighbourPositions(direction, row, col) {
    let neighbourPositions = [];
    if (!direction == Direction.HORIZONTAL) {
      //check vertical
      colCheck = col - 1;
      while (
        grid[row][colCheck].state != CellState.ACTIVE ||
        grid[row][colCheck] != undefined
      ) {
        colCheck--;
      }
      neighbourPositions.push({
        row,
        col: colCheck,
        direction: Direction.VERTICAL,
      });
      colCheck = col + 1;
      while (
        grid[row][colCheck].state != CellState.ACTIVE ||
        grid[row][colCheck] != undefined
      ) {
        colCheck++;
      }
      neighbourPositions.push({
        row,
        col: colCheck,
        direction: Direction.VERTICAL,
      });
    }
    if (!direction == Direction.VERTICAL) {
      //check horizontal
      rowCheck = row - 1;
      while (
        grid[rowCheck][col].state != CellState.ACTIVE ||
        grid[rowCheck][col] != undefined
      ) {
        rowCheck--;
      }
      neighbourPositions.push({
        row: rowCheck,
        col,
        direction: Direction.HORIZONTAL,
      });
      rowCheck = row + 1;
      while (
        grid[rowCheck][col].state != CellState.ACTIVE ||
        grid[rowCheck][col] != undefined
      ) {
        rowCheck++;
      }
      neighbourPositions.push({
        row: rowCheck,
        col,
        direction: Direction.HORIZONTAL,
      });
    }
    return neighbourPositions;
  }

  function validPositions(tile) {
    // come back once tile placing and info sending sorted

    // check line(s) of any already played tiles
    // cross with
    //(tile){board.cells.forEach cell.checklist.validTiles.includes([tile.color,tile.shape])}
    if (tile) {
      Board.positions(CellState.ACTIVE).forEach((pos) => {
        grid[pos[0]][pos[1]].checkList.validTiles.includes(tile);
      });
    }
  }
  //placeTile(x,y){sendChecklistUpdates()}
  //

  function info() {
    //let info = 
  }

  return {
    get grid() {
      return grid;
    },
    get bounds() {
      return bounds;
    },
    cells,
    positions,
    addTile,
    removeTile,
    fixTiles,
    info,
  };
}
