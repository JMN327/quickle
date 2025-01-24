import { Color } from "./enums/color";
import { Shape } from "./enums/shape";
import { CellState } from "./enums/cell-state";
import { TileState } from "./enums/tile-state";
import { Direction } from "./enums/direction";
import { AddRemove } from "./enums/addRemove";

export default function Cell() {
  let state = CellState.DORMANT;
  let tile = null;
  let checkList = CheckList();

  function activateFirstCell() {
    state = CellState.ACTIVE;
  }

  function addTile(movingTile) {
    if (!(state = CellState.ACTIVE)) {
      throw new Error(
        "You cannot place a tile in a cell which is not in 'active' state"
      );
    }
    tile = movingTile;
    tile.state = TileState.PLACED;
    state = CellState.PLACED;
  }

  function removeTile() {
    if (!(state = CellState.PLACED)) {
      throw new Error(
        "You cannot pick a tile up from a cell which is not in 'placed' state"
      );
    }
    let pickedUpTile = tile;
    pickedUpTile.state = TileState.MOVING;
    state = CellState.ACTIVE;
    tile = null;
    return pickedUpTile;
  }

  function fixTile() {
    if (!(state = CellState.PLACED)) {
      throw new Error("You cannot fix a tile which is not in 'placed' state");
    }
    tile.state = TileState.FIXED;
    state = CellState.FIXED;
  }

  function CheckList() {
    // symbols as abstract [color,shape] pairs taken from the tiles
    // are tested for validity against a 6 x 6
    // matrix with 6 colors for rows and  6 shapes for columns.
    // When a tile is placed, cells which are influenced
    // by it have their check list updated.

    let hWord = {
      matrix: new Array(6).fill().map(() => new Array(6).fill(0)),
      validSymbols: [],
      lSymbols: [],
      rSymbols: [],
    };
    let vWord = {
      matrix: new Array(6).fill().map(() => new Array(6).fill(0)),
      validSymbols: [],
      tSymbols: [],
      bSymbols: [],
    };
    let validSymbols = [];
    updateValidSymbolsForWord(Direction.LEFT);
    updateValidSymbolsForWord(Direction.TOP);
    updateValidSymbolsForCell();

    function addRemoveSymbol(direction, addRemove, color, shape) {
      let symbols;
      switch (direction) {
        case Direction.LEFT:
          symbols = hWord.rSymbols;
          break;

        case Direction.TOP:
          symbols = vWord.bSymbols;
          break;
        case Direction.RIGHT:
          symbols = hWord.lSymbols;
          break;

        case Direction.BOTTOM:
          symbols = vWord.tSymbols;
          break;
      }
      switch (addRemove) {
        case AddRemove.ADD:
          console.log(`Checking if symbol color ${color}, shape ${shape} is already in the list: ${JSON.stringify(symbols)}`)
          if (symbols.some((symbol) => symbol[0] == color && symbol[1] == shape)) {
            console.log(`symbol ${reverseEnum(Color,color)} ${reverseEnum(Shape,shape)} already part of the list`)
            return;
          }
          console.log(`Symbol not in the list.  Adding it and updating checklist now`)
          symbols.push([color, shape]);
          break;
        case AddRemove.REMOVE:
          let symbolIndex = symbols.findIndex((symbol) => symbol[0] == color && symbol[1] == shape);
          if (symbolIndex < 0) {
            throw new Error("The symbol to remove is not on the checklist");
          }
          symbols.splice(symbolIndex, 1);
          break;

      }
      updateMatrix(direction, addRemove, color, shape);
      updateValidSymbolsForWord(direction);
      updateValidSymbolsForCell();
      updateCellState();
    }

    function matrix(direction) {
      switch (direction) {
        case Direction.LEFT:
          return hWord.matrix;
        case Direction.TOP:
          return vWord.matrix;
        case Direction.RIGHT:
          return hWord.matrix;
        case Direction.BOTTOM:
          return vWord.matrix;
      }
    }

    function getValidSymbolsText() {
      let validSymbolNames = [];
      validSymbols.forEach((symbol) => {
        validSymbolNames.push([
          reverseEnum(Color, symbol[0]),
          reverseEnum(Shape, symbol[1]),
        ]);
      });
      return validSymbolNames;
    }

    function updateValidSymbolsForWord(direction) {
      let word;
      let symbols = [];
      switch (direction) {
        case Direction.LEFT:
          word = hWord;
          symbols = hWord.lSymbols.concat(hWord.rSymbols);
          break;
        case Direction.TOP:
          word = vWord;
          symbols = vWord.tSymbols.concat(vWord.bSymbols);
          break;
        case Direction.RIGHT:
          word = hWord;
          symbols = hWord.lSymbols.concat(hWord.rSymbols);
          break;
        case Direction.BOTTOM:
          word = vWord;
          symbols = vWord.tSymbols.concat(vWord.bSymbols);
          break;
      }

      let t = symbols.length;

      // test get the slot in each matrix for each symbol on the list and checks
      // 1. if they are all equal
      // 2. if they are equal to the total number of symbols minus 1
      // these conditions should be necessary & sufficient for the symbol
      // represented by the entries in the matrix which equal the symbol count
      // to be valid symbols for the word in the given direction
      let test = symbols.every(
        (symbol) =>
          word.matrix[symbol[0]][symbol[1]] ===
            word.matrix[symbols[0][0]][symbols[0][1]] &&
          word.matrix[symbol[0]][symbol[1]] + 1 === t
      );
      word.validSymbols = [];
      if (test) {
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) {
            if (word.matrix[i][j] == t) {
              word.validSymbols.push([i, j]);
            }
          }
        }
      }
    }

    function updateValidSymbolsForCell() {
      //intersect h + v valid symbols
      validSymbols = [];
      hWord.validSymbols.forEach((hSymbol) => {
        vWord.validSymbols.forEach((vSymbol) => {
          if (hSymbol[0] == vSymbol[0] && hSymbol[1] == vSymbol[1]) {
            validSymbols.push([hSymbol[0], hSymbol[1]]);
          }
        });
      });
    }

    function updateCellState() {
      let n = validSymbols.length;
      if (n == 36) {
        state = CellState.DORMANT;
        return;
      }
      if (n == 0) {
        state = CellState.DEAD;
        return;
      }
      state = CellState.ACTIVE;
    }

    function updateMatrix(direction, addRemove, color, shape) {
      let matrix;
      let inc = 0;
      switch (addRemove) {
        case AddRemove.ADD:
          inc = 1;
          break;
        case AddRemove.REMOVE:
          inc = -1;
          break;
      }
      switch (direction) {
        case Direction.LEFT:
          matrix = hWord.matrix;
          break;
        case Direction.TOP:
          matrix = vWord.matrix;
          break;
        case Direction.RIGHT:
          matrix = hWord.matrix;
          break;
        case Direction.BOTTOM:
          matrix = vWord.matrix;
          break;
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += inc;
          }
        }
      }
    }

    function reverseEnum(e, value) {
      for (let k in e) if (e[k] == value) return k;
    }

    return {
      get matrix() {
        return matrix;
      },
      get validSymbols() {
        return validSymbols;
      },
      get validSymbolsText() {
        return getValidSymbolsText();
      },
      addRemoveSymbol,
    };
  }

  return {
    get tile() {
      return tile;
    },
    get state() {
      return state;
    },
    get checkList() {
      return checkList;
    },
    addTile,
    removeTile,
    fixTile,
    activateFirstCell,
  };
}
