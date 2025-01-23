import { TileState } from "./enums/tile-state";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Increment } from "./enums/increment";

export default function Cell() {
  let state = CellState.DORMANT;
  let tile = null;
  let checkList = CheckList();

  function firstCell() {
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
    let hWord = {
      matrix: new Array(6).fill().map(() => new Array(6).fill(0)),
      validTiles: [],
      lTiles: [],
      rTiles: [],
    };
    let vWord = {
      matrix: new Array(6).fill().map(() => new Array(6).fill(0)),
      validTiles: [],
      tTiles: [],
      bTiles: [],
    };
    let validTiles = [];
    updateValidTilesForWord(Direction.LEFT);
    updateValidTilesForWord(Direction.TOP);
    updateValidTilesForCell();

    function updateValidTilesForWord(direction) {
      let word;
      let tiles = [];
      switch (direction) {
        case Direction.LEFT:
          word = hWord;
          tiles = hWord.lTiles.concat(hWord.rTiles);
          break;
        case Direction.TOP:
          word = vWord;
          tiles = vWord.tTiles.concat(vWord.bTiles);
          break;
        case Direction.RIGHT:
          word = hWord;
          tiles = hWord.lTiles.concat(hWord.rTiles);
          break;
        case Direction.BOTTOM:
          word = vWord;
          tiles = vWord.tTiles.concat(vWord.bTiles);
          break;
      }

      let t = tiles.length;

      // test get the slot in each matrix for each tile on the list and checks
      // 1. if they are all equal
      // 2. if they are equal to the total number of tiles minus 1
      // these conditions should be necessary & sufficient for the tiles
      // represented by the entries in the matrix which equal the tile count
      // to be valid tiles for the word in the given direction
      let test = tiles.every(
        (tile) =>
          word.matrix[tile[0]][tile[1]] ===
            word.matrix[tiles[0][0]][tiles[0][1]] &&
          word.matrix[tile[0]][tile[1]] + 1 === t
      );
      console.log(test)
      word.validTiles = [];
      if (test) {
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) {
            if (word.matrix[i][j] == t) {
              word.validTiles.push([i, j]);
            }
          }
        }
      }
    }

    function updateValidTilesForCell() {
      //intersect h + v valid tiles
      validTiles = [];
      hWord.validTiles.forEach((hTile) => {
        vWord.validTiles.forEach((vTile) => {
          if (hTile[0] == vTile[0] && hTile[1] == vTile[1]) {
            validTiles.push([hTile[0], hTile[1]]);
          }
        });
      });
    }

    function updateCellState() {
      let n = validTiles.length;
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

    function incrementTile(direction, increment, color, shape) {
      let tiles;
      switch (direction) {
        case Direction.LEFT:
          tiles = hWord.rTiles;
          break;

        case Direction.TOP:
          tiles = vWord.bTiles;
          break;
        case Direction.RIGHT:
          tiles = hWord.lTiles;
          break;

        case Direction.BOTTOM:
          tiles = vWord.tTiles;
          break;
      }
      switch (increment) {
        case Increment.ADD:
          if (tiles.some((tile) => tile[0] === color && tile[1] === shape[1])) {
            console.log(`tile ${reverseEnum(Color,color)} ${reverseEnum(Shape,shape)} already part of the list`)
            return;
          }
          tiles.push([color, shape]);
          break;
        case Increment.REMOVE:
          let tileIndex = tiles.findIndex((tile) => tile[0] == color && tile[1] == shape);
          if (tileIndex < 0) {
            throw new Error("The tile to remove is not on the checklist");
          }
          tiles.splice(tileIndex, 1);
          break;

      }
      updateMatrix(direction, increment, color, shape);
      updateValidTilesForWord(direction);
      updateValidTilesForCell();
      updateCellState();
    }

    function updateMatrix(direction, increment, color, shape) {
      let matrix;
      let inc = 0;
      switch (increment) {
        case Increment.ADD:
          inc = 1;
          break;
        case Increment.REMOVE:
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

    function getValidTileNames() {
      let validTileNames = [];
      validTiles.forEach((tile) => {
        validTileNames.push([
          reverseEnum(Color, tile[0]),
          reverseEnum(Shape, tile[1]),
        ]);
      });
      return validTileNames;
    }

    function reverseEnum(e, value) {
      for (let k in e) if (e[k] == value) return k;
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

    return {
      matrix,
      incrementTile,
      get hTiles() {
        return lTiles;
      },
      get vTiles() {
        return tTiles;
      },
      get validTiles() {
        return validTiles;
      },
      get validTileNames() {
        return getValidTileNames();
      },
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
    firstCell,
  };
}
