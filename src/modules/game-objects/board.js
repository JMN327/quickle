import Cell from "./cell";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Morph } from "./enums/morph";
import { TileState } from "./enums/tile-state";
import { Update } from "./enums/update-type";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";

export default function Board() {
  let grid = [[Cell()]];
  grid[0][0].activate();

  let leftOffset = 0;
  let topOffset = 0;

  console.log(grid[0][0]);
  let x = grid[row(0)][col(0)];
  console.log(x);
  console.log(Grid(0,0));
  
  function Grid(row, col) {
    if (col) {
      const a = row + topOffset
      const b = col + leftOffset
      return grid[a][b];
    }
    return grid[row + topOffset];
  }

  function row(row){
    return row + topOffset
  }
  function col(col){
    return col + leftOffset
  }

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
      return grid.flat();
    }
    return grid.flat().filter((cell) => cell.state == state);
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
          if (morphType == Morph.GROW) {
            arr.unshift(Cell());
          } else if (morphType == Morph.SHRINK) {
            arr.shift();
          }
        });
        break;

      case Direction.TOP:
        if (morphType == Morph.GROW) {
          grid.unshift(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.SHRINK) {
          grid.shift();
        }
        break;

      case Direction.RIGHT:
        grid.forEach((arr) => {
          if (morphType == Morph.GROW) {
            arr.push(Cell());
          } else if (morphType == Morph.SHRINK) {
            arr.pop();
          }
        });
        break;

      case Direction.BOTTOM:
        if (morphType == Morph.GROW) {
          grid.push(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.SHRINK) {
          grid.pop();
        }
        break;
    }
  }

  function addTile(tile, row, col) {
    grid[row][col].addTile(tile);
    let edges = checkForEdgeGrow(row, col);
    console.log(edges);
    edges.forEach((direction) => {
      morph(direction, Morph.GROW);
      col = direction == Direction.LEFT ? col + 1 : col;
      row = direction == Direction.TOP ? row + 1 : row;
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
    sendCheckListUpdates(Update.ADD, row, col, tile);
  }

  function removeTile(row, col) {
    let removedTile = grid[row][col].removeTile();
    sendCheckListUpdates(Update.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.SHRINK);
    });
  }

  function fixTiles() {
    cells(CellState.PLACED).forEach((cell) => {
      cell.state = CellState.FIXED;
    });
    return removedTile;
  }

  function checkForEdgeGrow(row, col) {
    let edges = [];
    if (col == 0) {
      edges.push(Direction.LEFT);
    }
    if (row == 0) {
      edges.push(Direction.TOP);
    }
    if (col == bounds.hSize - 1) {
      edges.push(Direction.RIGHT);
    }
    if (row == bounds.vSize - 1) {
      edges.push(Direction.BOTTOM);
    }
    return edges;
  }

  function checkForEdgeShrink(row, col) {
    let edges = [];
    if (col == 1) {
      if (grid.every((rowArr) => rowArr[0].state == CellState.DORMANT)) {
        edges.push(Direction.LEFT);
      }
    }
    if (row == 1) {
      if (grid[0].every((cell) => cell.state == CellState.DORMANT)) {
        edges.push(Direction.TOP);
      }
    }
    if (col == bounds.hSize - 2) {
      if (
        grid.every(
          (rowArr) => rowArr[bounds.hSize - 1].state == CellState.DORMANT
        )
      ) {
        edges.push(Direction.RIGHT);
      }
    }
    if (row == bounds.vSize - 2) {
      if (
        grid[bounds.vSize - 1].every((cell) => cell.state == CellState.DORMANT)
      ) {
        edges.push(Direction.BOTTOM);
      }
    }
    return edges;
  }

  function sendCheckListUpdates(updateType, row, col, tile) {
    console.log(row, col);
    let positionsToUpdate = neighbourPositions(row, col);
    console.log(positionsToUpdate);
    positionsToUpdate.forEach((pos) => {
      if (updateType == Update.ADD) {
        grid[pos.row][pos.col].activate();
        grid[pos.row][pos.col].checkList.addTile(
          pos.direction,
          tile.color,
          tile.shape
        );
        //console.table(grid[pos.row][pos.col].checkList.validTileNames)
      } else if (updateType == Update.REMOVE) {
        grid[pos.row][pos.col].checkList.removeTile(
          pos.direction,
          tile.color,
          tile.shape
        );
        grid[pos.row][pos.col].deactivate();
      }
    });
  }

  function neighbourPositions(row, col, direction) {
    let neighbourPositions = [];
    if (!(direction == Direction.HORIZONTAL)) {
      //check vertical
      let colCheck = col - 1;
      while (colCheck > 0) {
        if (
          grid[row][colCheck]?.state != CellState.ACTIVE ||
          grid[row][colCheck]?.state != CellState.DORMANT
        ) {
          break;
        }
        colCheck--;
      }
      neighbourPositions.push({
        row,
        col: colCheck,
        direction: Direction.HORIZONTAL,
      });
      colCheck = col + 1;
      while (colCheck < bounds.hSize) {
        if (
          grid[row][colCheck]?.state != CellState.ACTIVE ||
          grid[row][colCheck]?.state != CellState.DORMANT
        ) {
          break;
        }
        colCheck++;
      }
      neighbourPositions.push({
        row: row,
        col: colCheck,
        direction: Direction.HORIZONTAL,
      });
    }
    if (!(direction == Direction.VERTICAL)) {
      //check horizontal
      let rowCheck = row - 1;
      while (rowCheck > 0) {
        if (
          grid[rowCheck][col]?.state != CellState.ACTIVE ||
          grid[rowCheck][col]?.state != CellState.DORMANT
        ) {
          break;
        }
        rowCheck--;
      }
      neighbourPositions.push({
        row: rowCheck,
        col: col,
        direction: Direction.VERTICAL,
      });
      rowCheck = row + 1;
      while (rowCheck < bounds.vSize) {
        if (
          grid[rowCheck][col]?.state != CellState.ACTIVE ||
          grid[rowCheck][col]?.state != CellState.DORMANT
        ) {
          break;
        }
        rowCheck++;
      }
      neighbourPositions.push({
        row: rowCheck,
        col,
        direction: Direction.VERTICAL,
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
    let info = new Array(bounds.hSize)
      .fill("")
      .map(() => new Array(bounds.vSize).fill(""));
    for (let i = 0; i < bounds.hSize; i++) {
      for (let j = 0; j < bounds.vSize; j++) {
        info[i][j] = `${grid[i][j].state},${
          reverseEnum(Color, grid[i][j]?.tile?.color) || ""
        },${reverseEnum(Shape, grid[i][j]?.tile?.shape) || ""}`;
      }
    }
    return info;

    function reverseEnum(e, value) {
      for (let k in e) if (e[k] == value) return k;
    }
  }

  return {
    get grid() {
      return grid;
    },
    get gridCount() {
      return grid.flat().length;
    },
    get bounds() {
      return bounds;
    },
    cells,
    positions,
    addTile,
    removeTile,
    fixTiles,
    get info() {
      return info();
    },
  };
}
