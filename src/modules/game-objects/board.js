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
          if (morphType == Morph.ADD) {
            arr.unshift(Cell());
          } else if (morphType == Morph.REMOVE) {
            arr.shift();
          }
        });
        break;

      case Direction.TOP:
        if (morphType == Morph.ADD) {
          cells.unshift(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.REMOVE) {
          cells.shift();
        }
        break;

      case Direction.RIGHT:
        cells.forEach((arr) => {
          if (morphType == Morph.ADD) {
            arr.push(Cell());
          } else if (morphType == Morph.REMOVE) {
            arr.pop();
          }
        });
        break;

      case Direction.BOTTOM:
        if (morphType == Morph.ADD) {
          cells.push(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (morphType == Morph.REMOVE) {
          cells.pop();
        }
        break;
    }
  }

  function addTile(tile, row, col) {
    console.log(
      `ADDING TILE ${reverseEnum(Color, tile[0].color)} ${reverseEnum(
        Shape,
        tile[0].shape
      )} at [${row},${col}]`
    );
    tile = tile[0];
    row = cellsRow(row);
    col = cellsCol(col);
    cells[row][col].addTile(tile);
    let edges = checkForEdgeGrow(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.ADD);
      col = direction == Direction.LEFT ? col + 1 : col;
      row = direction == Direction.TOP ? row + 1 : row;
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
    //sendCheckListUpdates(Update.ADD, row, col, tile);
    addToCheckLists(row, col, tile);
  }

  function removeTile(row, col) {
    row = cellsRow(row);
    col = cellsCol(col);
    let removedTile = cells[row][col].removeTile();
    sendCheckListUpdates(Update.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      morph(direction, Morph.REMOVE);
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

  function addToCheckLists(row, col, tile) {
    let hTilesToAdd = [{ color: tile.color, shape: tile.shape }];
    let vTilesToAdd = [{ color: tile.color, shape: tile.shape }];
    let lCell = {};
    let tCell = {};
    let rCell = {};
    let bCell = {};

    console.log("NEW CHECKLIST UPDATE");
    console.log(
      `Tile played: ${reverseEnum(Color, tile.color)} ${reverseEnum(
        Shape,
        tile.shape
      )} Board BEFORE updates:`
    );
    console.table(info());

    radiate(Direction.LEFT);
    radiate(Direction.TOP);
    radiate(Direction.RIGHT);
    radiate(Direction.BOTTOM);
    sendTiles(Direction.LEFT);
    sendTiles(Direction.TOP);
    sendTiles(Direction.RIGHT);
    sendTiles(Direction.BOTTOM);

    function radiate(direction) {
      let condition;
      let increment;
      let newCol = col;
      let newRow = row;
      let updateCell;
      let tilesToAdd;
      switch (direction) {
        case Direction.LEFT:
          condition = () => {
            return newCol > 0;
          };
          increment = () => {
            return newCol--;
          };
          tilesToAdd = hTilesToAdd;
          updateCell = lCell;
          break;

        case Direction.TOP:
          condition = () => {
            return newRow > 0;
          };
          increment = () => {
            return newRow--;
          };
          tilesToAdd = vTilesToAdd;
          updateCell = tCell;
          break;

        case Direction.RIGHT:
          condition = () => {
            return newCol < bounds.hSize;
          };
          increment = () => {
            return newCol++;
          };
          tilesToAdd = hTilesToAdd;
          updateCell = rCell;
          break;

        case Direction.BOTTOM:
          condition = () => {
            return newRow < bounds.vSize;
          };
          increment = () => {
            return newRow++;
          };
          tilesToAdd = vTilesToAdd;
          updateCell = bCell;
          break;
      }

      while (condition()) {
        increment();
        if (
          cells[newRow][newCol].state == CellState.PLACED ||
          cells[newRow][newCol].state == CellState.FIXED
        ) {
          tilesToAdd.push({
            color: cells[newRow][newCol].tile.color,
            shape: cells[newRow][newCol].tile.shape,
          });
        } else {
          break;
        }
      }
      console.log(`Radiated ${direction} to cell [${newRow},${newCol}]`);
      updateCell = { direction, row: newRow, col: newCol };
      //console.table(cellsToUpdate)
      //console.table(tilesToAdd)
    }

    function sendTiles(direction) {
      let cellsToUpdate = [lCell, tCell, rCell, bCell];
      let tilesToAdd;
      switch (direction) {
        case Direction.LEFT:
          tilesToAdd = hTilesToAdd;
          break;

        case Direction.TOP:
          tilesToAdd = vTilesToAdd;
          break;
        case Direction.RIGHT:
          tilesToAdd = hTilesToAdd;
          break;

        case Direction.BOTTOM:
          tilesToAdd = vTilesToAdd;
          break;
      }
      cellsToUpdate.forEach((cell) => {
        console.log(
          `NEW CELL CHECK: ${direction} updating cell [${cell.row}][${cell.col}] checklist matrix BEFORE update:`
        );
        console.table(cells[cell.row][cell.col].checkList.matrix);

        tilesToAdd.forEach((t) => {
          console.log(
            `Updating cell [${cell.row},${cell.col}] with tile ${reverseEnum(
              Color,
              t.color
            )} ${reverseEnum(Shape, t.shape)}`
          );

          cells[cell.row][cell.col].checkList.addTile(
            direction,
            t.color,
            t.shape
          );
        });

        console.log(
          `${direction}  updated cell [${cell.row}][${cell.col}] checklist matrix AFTER update:`
        );
        console.table(cells[cell.row][cell.col].checkList.matrix);
        console.log(`NEW TILE STATE: ${cells[cell.row][cell.col].state}`);
        console.log(`Valid tiles for cell after updates:`);
        console.table(cells[cell.row][cell.col].checkList.validTileNames);
      });
    }

    console.log(`UPDATES FINISHED.  Board:`);
    console.table(info());
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

  function reverseEnum(e, value) {
    for (let k in e) if (e[k] == value) return k;
  }

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
