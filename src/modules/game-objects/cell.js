import { TileState } from "./enums/tile-state";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";
import { Morph } from "./enums/morph";

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
    updateValidTilesForWord(Direction.HORIZONTAL);
    updateValidTilesForWord(Direction.VERTICAL);
    updateValidTilesForCell();

    function updateValidTilesForWord(direction) {
      let word;
      let tiles;
      switch (direction) {
        case Direction.HORIZONTAL:
          word = hWord;
          tiles = hWord.lTiles.concat(hWord.rTiles);
          break;

        case Direction.VERTICAL:
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
      let validTiles = [];
      hWord.validTiles.forEach((hTile) => {
        vWord.validTiles.forEach((vTile) => {
          if (hTile[0] == vTile[0] && hTile[1] == vTile[1]) {
            validTiles.push([hTile[0], hTile[1]]);
          }
        });
      });
    }

    function addTile(direction, color, shape) {
      let tiles;
      switch (direction) {
        case Direction.LEFT:
          tiles = rTiles;
          break;

        case Direction.TOP:
          tiles = bTiles;
          break;
        case Direction.RIGHT:
          tiles = lTiles;
          break;

        case Direction.BOTTOM:
          tiles = tTiles;
          break;
      }
      pushTileToTilesListIfNew(tiles, color, shape);
      updateMatrix(direction, color, shape);
      updateValidTileListForWord(direction);
      updateValidTilesForCell();
      updateCellState();
    }

    function pushTileToTilesListIfNew(tiles, color, shape) {
      if (hasElement(tiles, [color, shape])) {
        return;
      }
      tiles.push([color, shape]);
      function hasElement(arr, el) {
        return arr.some((x) => x[0] === el[0] && x[1] === el[1]);
      }
    }

    function removeTile(direction, color, shape) {
      if (direction == 0) {
        let tileIndex = lTiles.findIndex((t) => t[0] == color && t[1] == shape);
        if (tileIndex < 0) {
          throw new Error("The tile to remove is not on the checklist");
        }
        lTiles.splice(tileIndex, 1);
      } else {
        let tileIndex = tTiles.findIndex((t) => t[0] == color && t[1] == shape);
        if (tileIndex < 0) {
          throw new Error("The tile to remove is not on the checklist");
        }
        tTiles.splice(tileIndex, 1);
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          let toAdd;
          if ((i == color && j != shape) || (i != color && j == shape)) {
            hWord[i][j] += -1;
          }
        }
      }
      updateValidTileListForWord();
    }

    function updateMatrix(direction, morph, color, shape) {
      let matrix;
      let increment;
      switch (morph) {
        case Morph.ADD:
          increment = 1;
          break;
        case Morph.REMOVE:
          increment = -1;
          break;
      }
      switch (direction) {
        case Direction.LEFT:
          matrix = hWord;
          break;
        case Direction.TOP:
          matrix = vWord;
          break;
        case Direction.RIGHT:
          matrix = hWord;
          break;
        case Direction.BOTTOM:
          matrix = vWord;
          break;
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += increment;
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

      function reverseEnum(e, value) {
        for (let k in e) if (e[k] == value) return k;
      }
    }

    return {
      get matrix() {
        return hWord;
      },
      addTile,
      removeTile,
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
