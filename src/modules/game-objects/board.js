import Cell from "./cell";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { AddRemove } from "./enums/addRemove";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";

export default function Board() {
  let leftOffset = 0;
  let topOffset = 0;

  let cells = [[Cell()]];
  cells[0][0].activateFirstCell();

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
    addRemove(direction, addRemove) {
      if (direction == Direction.LEFT || direction == Direction.TOP) {
        bounds[direction] -= 1 * addRemove;
      } else {
        bounds[direction] += 1 * addRemove;
      }
    },
    get info() {
      return `l:${bounds.left} t:${bounds.top} r:${bounds.right} b:${bounds.bottom}`;
    },
  };

  function addTile(tile, row, col) {
    console.log(
      `ADDING TILE ${reverseEnum(Color, tile[0].color)} ${reverseEnum(
        Shape,
        tile[0].shape
      )} at [${row},${col}]`
    );
    tile = tile[0]; //change once passing tile better implemented
    row = cellsOffsetRow(row);
    col = cellsOffsetCol(col);

    // validity checks to be handed to player //
    if (!tileIsValid(tile, row, col)) {
      throw new Error("The tile is not on the cells valid tiles list");
    }
    if (!cellIsActive) {
      throw new Error("The cell is not active");
      
    }
    cells[row][col].addTile(tile);
    edgeGrowDirections(row, col).forEach((direction) => {
      AddRemoveBoardEdges(direction, AddRemove.ADD);
      col = direction == Direction.LEFT ? col + 1 : col;
      row = direction == Direction.TOP ? row + 1 : row;
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
    updateCheckLists(AddRemove.ADD, row, col, tile);
  }

  function removeTile(row, col) {
    console.log(`REMOVING TILE at [${row},${col}]`);
    row = cellsOffsetRow(row);
    col = cellsOffsetCol(col);
    console.log(leftOffset, topOffset);
    console.log(row);
    let removedTile = cells[row][col].removeTile();
    console.log(removedTile);
    updateCheckLists(AddRemove.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      AddRemoveBoardEdges(direction, AddRemove.REMOVE);
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
  }

  function fixTiles() {
    cellsByState(CellState.PLACED).forEach((cell) => {
      cell.state = CellState.FIXED;
    });
    return removedTile;
  }

  function cellsByState(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    if (state == null) {
      return cells.flat();
    }
    return cells.flat().filter((cell) => cell.state == state);
  }
  
  function positionsByState(state = null) {
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

  function tileIsValid(tile, row, col) {
    return cells[row][col].checkList.validTiles.some(
      (validTile) => validTile[0] == tile.color && validTile[1] == tile.shape
    );
  }
  
  function cellIsActive(){
    return cells[row][col].state == CellState.ACTIVE;
  }

  function edgeGrowDirections(row, col) {
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

  function updateCheckLists(addRemove, row, col, tile) {
    let hTilesToAddRemove = [{ color: tile.color, shape: tile.shape }];
    let vTilesToAddRemove = [{ color: tile.color, shape: tile.shape }];
    let lCell = { direction: null, row: null, col: null };
    let tCell = { direction: null, row: null, col: null };
    let rCell = { direction: null, row: null, col: null };
    let bCell = { direction: null, row: null, col: null };

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
      let addRemove;
      let newCol = col;
      let newRow = row;
      let updateCell;
      let tilesToAddRemove;
      switch (direction) {
        case Direction.LEFT:
          condition = () => {
            return newCol > 0;
          };
          addRemove = () => {
            return newCol--;
          };
          tilesToAddRemove = hTilesToAddRemove;
          updateCell = lCell;
          break;

        case Direction.TOP:
          condition = () => {
            return newRow > 0;
          };
          addRemove = () => {
            return newRow--;
          };
          tilesToAddRemove = vTilesToAddRemove;
          updateCell = tCell;
          break;

        case Direction.RIGHT:
          condition = () => {
            return newCol < bounds.hSize;
          };
          addRemove = () => {
            return newCol++;
          };
          tilesToAddRemove = hTilesToAddRemove;
          updateCell = rCell;
          break;

        case Direction.BOTTOM:
          condition = () => {
            return newRow < bounds.vSize;
          };
          addRemove = () => {
            return newRow++;
          };
          tilesToAddRemove = vTilesToAddRemove;
          updateCell = bCell;
          break;
      }

      while (condition()) {
        addRemove();
        if (
          cells[newRow][newCol].state == CellState.PLACED ||
          cells[newRow][newCol].state == CellState.FIXED
        ) {
          tilesToAddRemove.push({
            color: cells[newRow][newCol].tile.color,
            shape: cells[newRow][newCol].tile.shape,
          });
        } else {
          break;
        }
      }
      console.log(`Radiated ${direction} to cell [${newRow},${newCol}]`);
      updateCell.direction = direction;
      updateCell.row = newRow;
      updateCell.col = newCol;
      //console.table(cellsToUpdate)
      //console.table(tilesToAdd)
    }

    function sendTiles(direction) {
      let uCell;
      let tilesToAddRemove;
      switch (direction) {
        case Direction.LEFT:
          tilesToAddRemove = hTilesToAddRemove;
          uCell = lCell;
          break;
        case Direction.TOP:
          tilesToAddRemove = vTilesToAddRemove;
          uCell = tCell;
          break;
        case Direction.RIGHT:
          tilesToAddRemove = hTilesToAddRemove;
          uCell = rCell;
          break;
        case Direction.BOTTOM:
          tilesToAddRemove = vTilesToAddRemove;
          uCell = bCell;
          break;
      }

      console.log(
        `NEW CELL CHECK: ${direction} updating cell [${uCell.row}][${uCell.col}] checklist matrix BEFORE update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));

      tilesToAddRemove.forEach((t) => {
        console.log(
          `Updating cell [${uCell.row},${uCell.col}] with tile ${reverseEnum(
            Color,
            t.color
          )} ${reverseEnum(Shape, t.shape)}`
        );

        cells[uCell.row][uCell.col].checkList.addRemoveTile(
          direction,
          addRemove,
          t.color,
          t.shape
        );
      });

      console.log(
        `${direction}  updated cell [${uCell.row}][${uCell.col}] checklist matrix AFTER update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));
      console.log(`NEW TILE STATE: ${cells[uCell.row][uCell.col].state}`);
      console.log(`Valid tiles for cell after updates:`);
      console.table(cells[uCell.row][uCell.col].checkList.validTileNames);
    }

    console.log(`UPDATES FINISHED.  Board:`);
    console.table(info());
  }

  function AddRemoveBoardEdges(direction, addRemove) {
    if (
      !Object.values(Direction).includes(direction) ||
      !direction ||
      direction == Direction.HORIZONTAL ||
      direction == Direction.VERTICAL
    ) {
      throw new Error("A valid direction was not passed to the function");
    }
    //update bounds
    bounds.addRemove(direction, addRemove);
    // update grid
    switch (direction) {
      case Direction.LEFT:
        cells.forEach((arr) => {
          if (addRemove == AddRemove.ADD) {
            arr.unshift(Cell());
          } else if (addRemove == AddRemove.REMOVE) {
            arr.shift();
          }
        });
        break;
      case Direction.TOP:
        if (addRemove == AddRemove.ADD) {
          cells.unshift(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (addRemove == AddRemove.REMOVE) {
          cells.shift();
        }
        break;
      case Direction.RIGHT:
        cells.forEach((arr) => {
          if (addRemove == AddRemove.ADD) {
            arr.push(Cell());
          } else if (addRemove == AddRemove.REMOVE) {
            arr.pop();
          }
        });
        break;
      case Direction.BOTTOM:
        if (addRemove == AddRemove.ADD) {
          cells.push(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (addRemove == AddRemove.REMOVE) {
          cells.pop();
        }
        break;
    }
  }

  function cellsOffsetRow(row) {
    return row + topOffset;
  }

  function cellsOffsetCol(col) {
    return col + leftOffset;
  }

  function reverseEnum(e, value) {
    for (let k in e) if (e[k] == value) return k;
  }

  return {
    get cells() {
      return cells;
    },
    get bounds() {
      return bounds;
    },
    get info() {
      return info();
    },
    cellsByState,
    positionsByState,
    addTile,
    removeTile,
    fixTiles,
  };
}
