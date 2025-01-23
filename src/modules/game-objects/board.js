import Cell from "./cell";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Increment } from "./enums/increment";
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

  function incrementBoardDimensions(direction, increment) {
    if (
      !Object.values(Direction).includes(direction) ||
      !direction ||
      direction == Direction.HORIZONTAL ||
      direction == Direction.VERTICAL
    ) {
      throw new Error("A valid direction was not passed to the function");
    }
    //update bounds
    bounds.increment(direction, increment);
    // update grid
    switch (direction) {
      case Direction.LEFT:
        cells.forEach((arr) => {
          if (increment == Increment.ADD) {
            arr.unshift(Cell());
          } else if (increment == Increment.REMOVE) {
            arr.shift();
          }
        });
        break;
      case Direction.TOP:
        if (increment == Increment.ADD) {
          cells.unshift(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (increment == Increment.REMOVE) {
          cells.shift();
        }
        break;
      case Direction.RIGHT:
        cells.forEach((arr) => {
          if (increment == Increment.ADD) {
            arr.push(Cell());
          } else if (increment == Increment.REMOVE) {
            arr.pop();
          }
        });
        break;
      case Direction.BOTTOM:
        if (increment == Increment.ADD) {
          cells.push(
            Array(bounds.hSize)
              .fill()
              .map((x) => Cell())
          );
        } else if (increment == Increment.REMOVE) {
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
    tile = tile[0]; //change once passing tile better implemented
    row = cellsRow(row);
    col = cellsCol(col);
    cells[row][col].addTile(tile);
    let edges = checkForEdgeGrow(row, col);
    edges.forEach((direction) => {
      incrementBoardDimensions(direction, Increment.ADD);
      col = direction == Direction.LEFT ? col + 1 : col;
      row = direction == Direction.TOP ? row + 1 : row;
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
    updateCheckLists(Increment.ADD, row, col, tile);
  }

  function removeTile(row, col) {
    console.log(`REMOVING TILE at [${row},${col}]`);
    row = cellsRow(row);
    col = cellsCol(col);
    console.log(leftOffset, topOffset);
    console.log(row);
    let removedTile = cells[row][col].removeTile();
    console.log(removedTile);
    updateCheckLists(Increment.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      incrementBoardDimensions(direction, Increment.REMOVE);
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
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

  function updateCheckLists(increment, row, col, tile) {
    let hTilesToIncrement = [{ color: tile.color, shape: tile.shape }];
    let vTilesToIncrement = [{ color: tile.color, shape: tile.shape }];
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
      let increment;
      let newCol = col;
      let newRow = row;
      let updateCell;
      let tilesToIncrement;
      switch (direction) {
        case Direction.LEFT:
          condition = () => {
            return newCol > 0;
          };
          increment = () => {
            return newCol--;
          };
          tilesToIncrement = hTilesToIncrement;
          updateCell = lCell;
          break;

        case Direction.TOP:
          condition = () => {
            return newRow > 0;
          };
          increment = () => {
            return newRow--;
          };
          tilesToIncrement = vTilesToIncrement;
          updateCell = tCell;
          break;

        case Direction.RIGHT:
          condition = () => {
            return newCol < bounds.hSize;
          };
          increment = () => {
            return newCol++;
          };
          tilesToIncrement = hTilesToIncrement;
          updateCell = rCell;
          break;

        case Direction.BOTTOM:
          condition = () => {
            return newRow < bounds.vSize;
          };
          increment = () => {
            return newRow++;
          };
          tilesToIncrement = vTilesToIncrement;
          updateCell = bCell;
          break;
      }

      while (condition()) {
        increment();
        if (
          cells[newRow][newCol].state == CellState.PLACED ||
          cells[newRow][newCol].state == CellState.FIXED
        ) {
          tilesToIncrement.push({
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
      let tilesToIncrement;
      switch (direction) {
        case Direction.LEFT:
          tilesToIncrement = hTilesToIncrement;
          uCell = lCell;
          break;
        case Direction.TOP:
          tilesToIncrement = vTilesToIncrement;
          uCell = tCell;
          break;
        case Direction.RIGHT:
          tilesToIncrement = hTilesToIncrement;
          uCell = rCell;
          break;
        case Direction.BOTTOM:
          tilesToIncrement = vTilesToIncrement;
          uCell = bCell;
          break;
      }

      console.log(
        `NEW CELL CHECK: ${direction} updating cell [${uCell.row}][${uCell.col}] checklist matrix BEFORE update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));

      tilesToIncrement.forEach((t) => {
        console.log(
          `Updating cell [${uCell.row},${uCell.col}] with tile ${reverseEnum(
            Color,
            t.color
          )} ${reverseEnum(Shape, t.shape)}`
        );

        cells[uCell.row][uCell.col].checkList.incrementTile(
          direction,
          increment,
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
