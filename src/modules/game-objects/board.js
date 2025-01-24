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

  function addTile(tile, rowToOffset, colToOffset) {
    console.log(
      `ADDING TILE ${reverseEnum(Color, tile[0].color)} ${reverseEnum(
        Shape,
        tile[0].shape
      )} at [${rowToOffset},${colToOffset}]`
    );
    tile = tile[0]; //change once passing tile better implemented
    let row = cellsOffsetRow(rowToOffset);
    let col = cellsOffsetCol(colToOffset);

    // validity checks to be handed to player //
    if (!tileIsValidForCell(tile, row, col)) {
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

  function removeTile(rowToOffset, colToOffset) {
    console.log(`REMOVING TILE at [${rowToOffset},${colToOffset}]`);
    let row = cellsOffsetRow(rowToOffset);
    let col = cellsOffsetCol(colToOffset);
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
    let hmm = positionsByCellState(CellState.PLACED);
    console.log(hmm);
    positionsByCellState(CellState.PLACED).forEach((pos) => {
      console.log(pos);
      cells[pos[0]][pos[1]].fixTile();
    });
    console.log(`PLACED TILES NOW FIXED. Board:`);
    console.table(info());
  }

  function cell(row, col) {
    return cells[row + topOffset][col + leftOffset];
  }

  function cellsByCellState(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    if (state == null) {
      return cells.flat();
    }
    return cells.flat().filter((cell) => cell.state == state);
  }

  function positionsByCellState(state = null) {
    if (!Object.values(CellState).includes(state) && !(state == null)) {
      throw new Error("A valid cell state was not passed to the function");
    }
    let positionArray = [];
    for (let i = 0; i < bounds.vSize; i++) {
      for (let j = 0; j < bounds.hSize; j++) {
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
        info[i][j] = `${cells[i][j]?.state}${
          reverseEnum(Color, cells[i][j]?.tile?.color) || ""
        } ${cells[i][j]?.tile?.color || ""} ${
          reverseEnum(Shape, cells[i][j]?.tile?.shape) || ""
        } ${cells[i][j]?.tile?.shape || ""}`;
      }
    }
    return info;
  }

  function tileIsValidForCell(tile, row, col) {
    console.log(
      `Check tile ${reverseEnum(Color, tile.color)} ${reverseEnum(
        Shape,
        tile.shape
      )} is valid for cell [${row},${col}]`
    );
    return cells[row][col].checkList.validSymbols.some(
      (validTile) => validTile[0] == tile.color && validTile[1] == tile.shape
    );
  }

  function cellIsActive() {
    return cells[row][col].state == CellState.ACTIVE;
  }

  function playableCells(tile) {
    if (!tile) {
      throw new Error("No tile provided");
    }
    let playableCells = [];
    let placedTileCount = cellsByCellState(CellState.PLACED).length;
    if (placedTileCount == 0) {
      for (let i = 0; i < bounds.vSize; i++) {
        for (let j = 0; j < bounds.hSize; j++) {
          if (cells[i][j].state != CellState.ACTIVE) {
            console.log(`[${i},${j}] state: ${cells[i][j].state}`);
          } else if (!tileIsValidForCell(tile[0], i, j)) { ////more problems with tiles coming out of bag as array
            console.log(`[${i},${j}] not valid`);
          } else {
            playableCells.push([, i, j]);
          }
        }
      }
      return playableCells;
    }

    if (placedTileCount == 1) {
      let placedCells = positionsByCellState(CellState.PLACED);
      let fromRow = placedCells[0][0];
      let fromCol = placedCells[0][1];
      let checkCells = [];
      Object.values(Direction).forEach((direction) => {
        checkCells.push(radiate(direction, fromRow, fromCol).activeCellFound);
      });
      checkCells.filter((cell) => {
        tileIsValidForCell(tile, cell.row, cell.col);
      });
      playableCells = checkCells;
      console.table(playableCells);
      return playableCells;
    }

    if (placedTileCount > 1) {
      let directions = [];
      let placedCells = positionsByCellState(CellState.PLACED);
      let fromRow = placedCells[0][0];
      let fromCol = placedCells[0][1];
      if ((placedCells[0][0] = placedCells[1][0])) {
        directions = [Direction.LEFT, Direction.RIGHT];
      } else {
        directions = [Direction.TOP, Direction.BOTTOM];
      }
      let checkCells = [];
      directions.forEach((direction) => {
        checkCells.push(radiate(direction, fromRow, fromCol).activeCellFound);
      });
      checkCells.filter((cell) => {
        tileIsValidForCell(tile, cell.row, cell.col);
      });
      playableCells = checkCells;
      console.table(playableCells);
      return playableCells;
    }

    //logic for lines and radiating
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
    console.log("NEW CHECKLIST UPDATE");
    console.log(
      `Tile played: ${reverseEnum(Color, tile.color)} ${reverseEnum(
        Shape,
        tile.shape
      )} Board BEFORE updates:`
    );
    console.table(info());

    // radiate heads from the given tile in a compass direction collecting played or fixed
    // tiles on the way for checklist updates, stopping at the first active cell
    // and collecting it to apply checklist updates to or gather valid cells for tiles
    //to be placed in
    let l = radiate(Direction.LEFT, row, col);
    let t = radiate(Direction.TOP, row, col);
    let r = radiate(Direction.RIGHT, row, col);
    let b = radiate(Direction.BOTTOM, row, col);
    let hTilesToAddRemove = [tile];
    hTilesToAddRemove.concat(l.tilesToAddRemoveIfUpdatingChecklists);
    hTilesToAddRemove.concat(r.tilesToAddRemoveIfUpdatingChecklists);
    let vTilesToAddRemove = [tile];
    vTilesToAddRemove.concat(b.tilesToAddRemoveIfUpdatingChecklists);
    vTilesToAddRemove.concat(b.tilesToAddRemoveIfUpdatingChecklists);
    let lCell = l.activeCellFound;
    let tCell = t.activeCellFound;
    let rCell = r.activeCellFound;
    let bCell = b.activeCellFound;
    sendTiles(Direction.LEFT);
    sendTiles(Direction.TOP);
    sendTiles(Direction.RIGHT);
    sendTiles(Direction.BOTTOM);

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
        `NEW CELL CHECK FROM: ${direction} updating cell [${uCell.row}][${uCell.col}] checklist matrix BEFORE update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));

      tilesToAddRemove.forEach((tile) => {
        console.log(
          `Updating cell [${uCell.row},${uCell.col}] with tile ${reverseEnum(
            Color,
            tile.color
          )} ${reverseEnum(Shape, tile.shape)}`
        );

        cells[uCell.row][uCell.col].checkList.addRemoveSymbol(
          direction,
          addRemove,
          tile.color,
          tile.shape
        );
      });

      console.log(
        `CELL CHECK OVER FROM:${direction}, updated cell [${uCell.row}][${uCell.col}] checklist matrix AFTER update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));
      console.log(
        `CELL [${uCell.row},${uCell.col}] NEW CELL STATE: ${
          cells[uCell.row][uCell.col].state
        }`
      );
      console.log(`Valid tiles for cell after updates:`);
      console.table(cells[uCell.row][uCell.col].checkList.validSymbolsText);
    }

    console.log(`UPDATES FINISHED.  Board:`);
    console.table(info());
  }

  function radiate(direction, row, col) {
    let condition;
    let increment;
    let newCol = col;
    let newRow = row;
    let activeCellFound = { direction: null, row: null, col: null };
    let tilesToAddRemoveIfUpdatingChecklists = [];
    switch (direction) {
      case Direction.LEFT:
        condition = () => {
          return newCol > 0;
        };
        increment = () => {
          return newCol--;
        };
        break;
      case Direction.TOP:
        condition = () => {
          return newRow > 0;
        };
        increment = () => {
          return newRow--;
        };
        break;
      case Direction.RIGHT:
        condition = () => {
          return newCol < bounds.hSize;
        };
        increment = () => {
          return newCol++;
        };
        break;
      case Direction.BOTTOM:
        condition = () => {
          return newRow < bounds.vSize;
        };
        increment = () => {
          return newRow++;
        };
        break;
    }

    while (condition()) {
      increment();
      if (
        cells[newRow][newCol].state == CellState.PLACED ||
        cells[newRow][newCol].state == CellState.FIXED
      ) {
        tilesToAddRemoveIfUpdatingChecklists.push(cells[newRow][newCol].tile);
      } else {
        break;
      }
    }
    //console.log(`Radiated ${direction} to cell [${newRow},${newCol}]`);
    activeCellFound.direction = direction;
    activeCellFound.row = newRow;
    activeCellFound.col = newCol;
    return { activeCellFound, tilesToAddRemoveIfUpdatingChecklists };
  }

  function AddRemoveBoardEdges(direction, addRemove) {
    if (!Object.values(Direction).includes(direction) || !direction) {
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
    cell,
    get cells() {
      return cells;
    },
    get bounds() {
      return bounds;
    },
    get info() {
      return info();
    },
    cellsByState: cellsByCellState,
    positionsByState: positionsByCellState,
    playableCells,
    addTile,
    removeTile,
    fixTiles,
  };
}
