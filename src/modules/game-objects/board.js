import Cell from "./cell";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Morph } from "./enums/morph";
import { TileState } from "./enums/tile-state";
import { Update } from "./enums/update-type";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";

export default function Board() {
  let leftOffset = 0;
  let topOffset = 0;

  let cells = [[Cell()]];
  cells[0][0].firstCell();

  function cellsRow(row) {
    return row + topOffset;
  }
  function cellsCol(col) {
    return col + leftOffset;
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

  function cellGroup(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    if (state == null) {
      return cells.flat();
    }
    return cells.flat().filter((cell) => cell.state == state);
  }
  function positions(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    let positionArray = [];
    for (let i = 0; i < bounds.hSize; i++) {
      for (let j = 0; j < bounds.vSize; j++) {
        if (cells[i][j].state == state || state == null) {
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
        cells.forEach((arr) => {
          if (morphType == Morph.GROW) {
            arr.unshift(Cell());
          } else if (morphType == Morph.SHRINK) {
            arr.shift();
          }
        });
        break;

      case Direction.TOP:
        if (morphType == Morph.GROW) {
          cells.unshift(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.SHRINK) {
          cells.shift();
        }
        break;

      case Direction.RIGHT:
        cells.forEach((arr) => {
          if (morphType == Morph.GROW) {
            arr.push(Cell());
          } else if (morphType == Morph.SHRINK) {
            arr.pop();
          }
        });
        break;

      case Direction.BOTTOM:
        if (morphType == Morph.GROW) {
          cells.push(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.SHRINK) {
          cells.pop();
        }
        break;
    }
  }

  function addTile(tile, row, col) {
    tile = tile[0];
    row = cellsRow(row);
    col = cellsCol(col);
    cells[row][col].addTile(tile);
    let edges = checkForEdgeGrow(row, col);
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
    row = cellsRow(row);
    col = cellsCol(col);
    let removedTile = cells[row][col].removeTile();
    sendCheckListUpdates(Update.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.SHRINK);
      leftOffset += direction == Direction.LEFT ? -1 : 0;
      topOffset += direction == Direction.TOP ? -1 : 0;
    });
  }

  function fixTiles() {
    cellGroup(CellState.PLACED).forEach((cell) => {
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
      if (cells.every((rowArr) => rowArr[0].state == CellState.DORMANT)) {
        edges.push(Direction.LEFT);
      }
    }
    if (row == 1) {
      if (cells[0].every((cell) => cell.state == CellState.DORMANT)) {
        edges.push(Direction.TOP);
      }
    }
    if (col == bounds.hSize - 2) {
      if (
        cells.every(
          (rowArr) => rowArr[bounds.hSize - 1].state == CellState.DORMANT
        )
      ) {
        edges.push(Direction.RIGHT);
      }
    }
    if (row == bounds.vSize - 2) {
      if (
        cells[bounds.vSize - 1].every((cell) => cell.state == CellState.DORMANT)
      ) {
        edges.push(Direction.BOTTOM);
      }
    }
    return edges;
  }

  function sendCheckListUpdates(updateType, row, col, tile) {
    let positions = getUpdates(row, col);
    positions.forEach((pos) => {
      console.log("NEW UPDATE")
      console.log(`Tile played: ${tile.color} ${tile.shape} Board:`);
      console.table(info());
      if (updateType == Update.ADD) {
        console.log(`Updating cell [${pos.row},${pos.col}] direction ${pos.direction}with tile color ${tile.color} shape ${tile.shape}`)
        cells[pos.row][pos.col].checkList.addTile(
          pos.direction,
          tile.color,
          tile.shape
        );
        pos.neighbours.forEach((nbr) => {
          console.log(`Updating cell [${pos.row},${pos.col}] in direction ${pos.direction} with tile color ${nbr.color} shape ${nbr.shape}`)
          cells[pos.row][pos.col].checkList.addTile(
            pos.direction,
            nbr.color,
            nbr.shape
          );
        });
      } else if (updateType == Update.REMOVE) {
        console.log(`Updating cell [${pos.row},${pos.col}] direction ${pos.direction} with tile color ${tile.color} shape ${tile.shape}`)
        cells[pos.row][pos.col].checkList.removeTile(
          pos.direction,
          tile.color,
          tile.shape
        );
      }
      console.table(cells[pos.row][pos.col].checkList.matrix);
      console.log("hTiles " + cells[pos.row][pos.col].checkList.hTiles);
      console.log("vTiles " + cells[pos.row][pos.col].checkList.vTiles);
    });
  }

  function getUpdates(row, col, direction) {
    let positions = [];
    if (!(direction == Direction.VERTICAL)) {
      //check horizontal
      let neighboursToAdd = [];
      let colCheck = col - 1;
      while (colCheck > 0) {
        if (
          cells[row][colCheck]?.state == CellState.PLACED ||
          cells[row][colCheck]?.state == CellState.FIXED
        ) {
          neighboursToAdd.push({
            color: cells[row][colCheck].tile.color,
            shape: cells[row][colCheck].tile.shape,
          });
        } else {
          break;
        }
        colCheck--;
      }
      positions.push({
        row: row,
        col: colCheck,
        direction: Direction.HORIZONTAL,
        neighbours: [],
      });
      colCheck = col + 1;
      while (colCheck < bounds.hSize) {
        if (
          cells[row][colCheck]?.state == CellState.PLACED ||
          cells[row][colCheck]?.state == CellState.FIXED
        ) {
          neighboursToAdd.push({
            color: cells[row][colCheck].tile.color,
            shape: cells[row][colCheck].tile.shape,
          });
        } else {
          break;
        }
        colCheck++;
      }
      positions.push({
        row: row,
        col: colCheck,
        direction: Direction.HORIZONTAL,
        neighbours: neighboursToAdd,
      });
      positions[0].neighbours = neighboursToAdd;
    }
    if (!(direction == Direction.HORIZONTAL)) {
      //check vertical
      let neighboursToAdd = [];
      let rowCheck = row - 1;
      while (rowCheck > 0) {
        if (
          cells[rowCheck][col]?.state == CellState.PLACED ||
          cells[rowCheck][col]?.state == CellState.FIXED
        ) {
          neighboursToAdd.push({
            color: cells[rowCheck][col].tile.color,
            shape: cells[rowCheck][col].tile.color,
          });
        } else {
          break;
        }
        rowCheck--;
      }
      positions.push({
        row: rowCheck,
        col: col,
        direction: Direction.VERTICAL,
        neighbours: [],
      });
      rowCheck = row + 1;
      while (rowCheck < bounds.vSize) {
        if (
          cells[rowCheck][col]?.state == CellState.PLACED ||
          cells[rowCheck][col]?.state == CellState.FIXED
        ) {
          neighboursToAdd.push({
            color: cells[rowCheck][col].tile.color,
            shape: cells[rowCheck][col].tile.color,
          });
        } else {
          break;
        }
        rowCheck++;
      }
      positions.push({
        row: rowCheck,
        col: col,
        direction: Direction.VERTICAL,
        neighbours: neighboursToAdd,
      });
      positions[2].neighbours = neighboursToAdd;
    }
    return positions;
  }

  function validPositions(tile) {
    // come back once tile placing and info sending sorted

    // check line(s) of any already played tiles
    // cross with
    //(tile){board.cells.forEach cell.checklist.validTiles.includes([tile.color,tile.shape])}
    if (tile) {
      Board.positions(CellState.ACTIVE).forEach((pos) => {
        cells[pos[0]][pos[1]].checkList.validTiles.includes(tile);
      });
    }
  }
  //placeTile(x,y){sendChecklistUpdates()}
  //

  function info() {
    let info = new Array(bounds.vSize)
      .fill("")
      .map(() => new Array(bounds.hSize).fill(""));
    for (let i = 0; i < bounds.vSize; i++) {
      for (let j = 0; j < bounds.hSize; j++) {
        info[i][j] = `${cells[i][j]?.state} ${
          reverseEnum(Color, cells[i][j]?.tile?.color) || ""
        } ${cells[i][j]?.tile?.color || ""} ${
          reverseEnum(Shape, cells[i][j]?.tile?.shape) || ""
        } ${cells[i][j]?.tile?.shape || ""}`;
      }
    }
    return info;

    function reverseEnum(e, value) {
      for (let k in e) if (e[k] == value) return k;
    }
  }

  return {
    get cells() {
      return cells;
    },
    get gridCount() {
      return cells.flat().length;
    },
    get bounds() {
      return bounds;
    },
    cellGroup,
    positions,
    addTile,
    removeTile,
    fixTiles,
    get info() {
      return info();
    },
  };
}
