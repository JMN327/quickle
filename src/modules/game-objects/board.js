import Cell from "./cell";
import { CellState } from "../enums/cell-state";
import { Direction } from "../enums/direction";
import { AddRemove } from "../enums/addRemove";
import { Color } from "../enums/color";
import { Shape } from "../enums/shape";

export default function Board() {
  let leftOffset = 0;
  let topOffset = 0;

  let cells = [[Cell()]];
  cells[0][0].activateFirstCell();

  let placedTiles = [];

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
    /* let row = cellsOffsetRow(rowToOffset);
    let col = cellsOffsetCol(colToOffset); */

    placedTiles.push(tile.number);
    // validity checks to be handed to player //
    if (!tileIsValidForCell(tile, row, col)) {
      throw new Error("The tile is not on the cells valid tiles list");
    }
    if (!cellIsActive) {
      throw new Error("The cell is not active");
    }
    cells[row][col].addTile(tile);
    console.log(
      `EDGES TO GROW ${JSON.stringify(edgeGrowDirections(row, col))}`
    );
    edgeGrowDirections(row, col).forEach((direction) => {
      AddRemoveBoardEdges(direction, AddRemove.ADD);
      col = direction == Direction.LEFT ? col + 1 : col;
      row = direction == Direction.TOP ? row + 1 : row;
      leftOffset += direction == Direction.LEFT ? 1 : 0;
      topOffset += direction == Direction.TOP ? 1 : 0;
    });
    updateCheckLists(AddRemove.ADD, row, col, tile);

    console.log(`SCORE IS ${score()}`);
  }

  function removeLastPlacedTile() {
    if (placedTiles.length == 0) {
      return;
    }
    let tileToRemove = placedTiles.pop();
    let coordinates = getCoordinatesOfTileToRemove(tileToRemove);
    let row = coordinates.i;
    let col = coordinates.j;
    console.log(row, col);
    let removedTile = cells[row][col].removeTile();
    console.log(
      `REMOVING TILE ${removedTile.number} ${reverseEnum(
        Color,
        tileToRemove.color
      )} ${reverseEnum(Shape, removedTile.shape)}`
    );

    updateCheckLists(AddRemove.REMOVE, row, col, removedTile);
    let edges = checkForEdgeShrink(row, col);
    edges.forEach((direction) => {
      AddRemoveBoardEdges(direction, AddRemove.REMOVE);
      leftOffset -= direction == Direction.LEFT ? 1 : 0;
      topOffset -= direction == Direction.TOP ? 1 : 0;
    });

    console.log(removedTile);
    console.table(info());
    console.log(`SCORE IS ${score()}`);
    return removedTile;
  }

  function fixTiles() {
    positionsByCellState(CellState.PLACED).forEach((pos) => {
      cells[pos[0]][pos[1]].fixTile();
    });
    console.log(`PLACED TILES NOW FIXED. Board:`);
    console.table(info());
  }

  function score() {
    let score = 0;
    let placedCells = positionsByCellState(CellState.PLACED);
    console.log(
      `GETTING SCORE FOR PLACED CELLS: ${JSON.stringify(placedCells)}`
    );
    if (placedCells.length == 0) {
      return;
    }

    if (placedCells.length == 1) {
      score += stem(Direction.LEFT, placedCells[0][0], placedCells[0][1]);
      score += stem(Direction.TOP, placedCells[0][0], placedCells[0][1]);
    } else {
      if (placedCells[0][0] == placedCells[1][0]) {
        score += stem(Direction.LEFT, placedCells[0][0], placedCells[0][1]);
        placedCells.forEach((pos) => {
          score += stem(Direction.TOP, pos[0], pos[1]);
        });
      } else {
        score += stem(Direction.TOP, placedCells[0][0], placedCells[0][1]);
        placedCells.forEach((pos) => {
          score += stem(Direction.LEFT, pos[0], pos[1]);
        });
      }
    }
    return score || 1;

    function stem(direction, row, col) {
      let directions;
      let radiateScore = 0;
      let logString = "";
      switch (direction) {
        case Direction.LEFT:
          directions = [Direction.LEFT, Direction.RIGHT];
          logString = "horizontally";
          break;
        case Direction.TOP:
          directions = [Direction.TOP, Direction.BOTTOM];
          logString = "vertically";
          break;
      }
      directions.forEach((direction) => {
        radiateScore += radiate(direction, row, col).score;
      });
      radiateScore = radiateScore != 0 ? radiateScore + 1 : radiateScore;
      let bingoCheck = (score) => (score == 6 ? 12 : score);
      radiateScore = bingoCheck(radiateScore);
      console.log(
        `Radiate Score for cell [${row},${col}] ${logString} is ${radiateScore}`
      );
      return radiateScore;
    }
  }

  function cell(offsetRow, offsetCol) {
    return cells[offsetRow + topOffset][offsetCol + leftOffset];
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
        info[i][j] = `${cells[i][j].state} ${
          reverseEnum(Color, cells[i][j]?.tile?.color) || ""
        } ${cells[i][j]?.tile?.color || ""} ${
          reverseEnum(Shape, cells[i][j]?.tile?.shape) || ""
        } ${cells[i][j]?.tile?.shape || ""}`;
      }
    }
    return info;
  }

  function getCoordinatesOfTileToRemove(tileToRemoveByNumber) {
    for (let i = 0; i < bounds.vSize; i++) {
      for (let j = 0; j < bounds.hSize; j++) {
        if (cells[i][j]?.tile?.number == tileToRemoveByNumber) {
          return { i, j };
        }
      }
    }
  }

  function tileIsValidForCell(tile, row, col) {
    console.log(
      `Check tile ${reverseEnum(Color, tile.color)} ${reverseEnum(
        Shape,
        tile.shape
      )} ${tile.color} ${tile.shape} is valid for cell [${row},${col}]`
    );
    let result = cells[row][col].checkList.validSymbols.some(
      (validTile) => validTile[0] == tile.color && validTile[1] == tile.shape
    );
    console.log(
      `valid tiles are: ${JSON.stringify(
        cells[row][col].checkList.validSymbols
      )}`
    );
    console.log(`RESULT: ${result}`);
    return result;
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
          } else if (!tileIsValidForCell(tile, i, j)) {
            console.log(`[${i},${j}] not valid`);
          } else {
            playableCells.push([i, j]);
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
        let cell = radiate(direction, fromRow, fromCol).activeCellFound;
        checkCells.push([cell.row, cell.col]);
      });
      playableCells = checkCells.filter((cell) =>
        tileIsValidForCell(tile, cell[0], cell[1])
      );
      console.log(playableCells);
      return playableCells;
    }

    if (placedTileCount > 1) {
      let directions = [];
      let placedCells = positionsByCellState(CellState.PLACED);
      let fromRow = placedCells[0][0];
      let fromCol = placedCells[0][1];
      if (placedCells[0][0] == placedCells[1][0]) {
        directions = [Direction.LEFT, Direction.RIGHT];
      } else {
        directions = [Direction.TOP, Direction.BOTTOM];
      }
      let checkCells = [];
      directions.forEach((direction) => {
        let cell = radiate(direction, fromRow, fromCol).activeCellFound;
        checkCells.push([cell.row, cell.col]);
      });
      playableCells = checkCells.filter((cell) =>
        tileIsValidForCell(tile, cell[0], cell[1])
      );
      console.log(playableCells);
      return playableCells;
    }
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
      `Tile added/removed: ${reverseEnum(Color, tile.color)} ${reverseEnum(
        Shape,
        tile.shape
      )} Board BEFORE checklist updates:`
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

    let hTilesToAdd = [tile];
    hTilesToAdd = hTilesToAdd.concat(l.tilesToAddRemoveIfUpdatingChecklists);
    hTilesToAdd = hTilesToAdd.concat(r.tilesToAddRemoveIfUpdatingChecklists);
    let vTilesToAdd = [tile];
    vTilesToAdd = vTilesToAdd.concat(t.tilesToAddRemoveIfUpdatingChecklists);
    vTilesToAdd = vTilesToAdd.concat(b.tilesToAddRemoveIfUpdatingChecklists);

    let lTilesToRemove = [tile];
    lTilesToRemove = lTilesToRemove.concat(
      r.tilesToAddRemoveIfUpdatingChecklists
    );
    let tTilesToRemove = [tile];
    tTilesToRemove = tTilesToRemove.concat(
      b.tilesToAddRemoveIfUpdatingChecklists
    );
    let rTilesToRemove = [tile];
    rTilesToRemove = rTilesToRemove.concat(
      l.tilesToAddRemoveIfUpdatingChecklists
    );
    let bTilesToRemove = [tile];
    bTilesToRemove = bTilesToRemove.concat(
      t.tilesToAddRemoveIfUpdatingChecklists
    );

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
      let tilesToAdd;
      let tilesToRemove;
      switch (direction) {
        case Direction.LEFT:
          tilesToAdd = hTilesToAdd;
          tilesToRemove = lTilesToRemove;
          uCell = lCell;
          break;
        case Direction.TOP:
          tilesToAdd = vTilesToAdd;
          tilesToRemove = tTilesToRemove;
          uCell = tCell;
          break;
        case Direction.RIGHT:
          tilesToAdd = hTilesToAdd;
          tilesToRemove = rTilesToRemove;
          uCell = rCell;
          break;
        case Direction.BOTTOM:
          tilesToAdd = vTilesToAdd;
          tilesToRemove = bTilesToRemove;
          uCell = bCell;
          break;
      }
      console.log("tiles to remove:");
      console.table(tilesToRemove);

      console.log(
        `NEW CELL CHECK FROM: ${direction} updating cell [${uCell.row}][${uCell.col}] checklist matrix BEFORE update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));
      if (addRemove == AddRemove.ADD) {
        tilesToAdd.forEach((tile) => {
          console.log(
            `Adding to cell [${uCell.row},${uCell.col}] with tile ${reverseEnum(
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
      } else {
        tilesToRemove.forEach((tile) => {
          console.log(
            `Removing from cell [${uCell.row},${
              uCell.col
            }] with tile ${reverseEnum(Color, tile.color)} ${reverseEnum(
              Shape,
              tile.shape
            )}`
          );

          cells[uCell.row][uCell.col].checkList.addRemoveSymbol(
            direction,
            addRemove,
            tile.color,
            tile.shape
          );
        });
      }

      console.log(
        `CELL CHECK OVER FROM:${direction}, updated cell [${uCell.row}][${uCell.col}] checklist matrix AFTER update:`
      );
      console.table(cells[uCell.row][uCell.col].checkList.matrix(direction));
      console.log(
        `CELL [${uCell.row},${uCell.col}] NEW CELL STATE: ${
          cells[uCell.row][uCell.col].state
        }`
      );
      //console.log(`Valid tiles for cell after updates:`);
      //console.table(cells[uCell.row][uCell.col].checkList.validSymbolsText);
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
    let score = 0;
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
        score++;
      } else {
        break;
      }
    }
    activeCellFound.direction = direction;
    activeCellFound.row = newRow;
    activeCellFound.col = newCol;
    return { activeCellFound, tilesToAddRemoveIfUpdatingChecklists, score };
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
        //placedTiles.forEach((pt)=>{pt.ptCol++})
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
        //placedTiles.forEach((pt)=>{pt.ptRow++})
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
    get score() {
      return score();
    },
    get placedTiles() {
      return placedTiles;
    },
    cellsByCellState,
    positionsByCellState,
    playableCells,
    addTile,
    removeLastPlacedTile,
    fixTiles,
  };
}
