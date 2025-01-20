import { tileState } from "./enums/tile-state";
import { color } from "./enums/color";
import { shape } from "./enums/shape";
import { cellState } from "./enums/cell-state";

export default function Cell() {
  let state = cellState.DORMANT;
  let tile = null;
  let checkList = null;

  function activate() {
    if (!(state == cellState.DORMANT)) {
      throw new Error(
        "You cannot active a cell which is not in 'dormant' state"
      );
    }
    state = cellState.ACTIVE;
    checkList = CheckList();
  }

  function placeTile(movingTile) {
    if (!(state = cellState.ACTIVE)) {
      throw new Error(
        "You cannot place a tile in a cell which is not in 'active' state"
      );
    }
    tile = movingTile;
    tile.state = tileState.PLACED;
    state = cellState.PLACED;
  }

  function pickTile() {
    if (!(state = cellState.PLACED)) {
      throw new Error(
        "You cannot pick a tile up from a cell which is not in 'placed' state"
      );
    }
    let pickedUpTile = tile;
    pickedUpTile.state = tileState.MOVING;
    state = cellState.EMPTY;
    tile = null;
    return pickedUpTile;
  }

  function fixTile() {
    if (!(state = cellState.PLACED)) {
      throw new Error("You cannot fix a tile which is not in 'placed' state");
    }
    tile.state = tileState.FIXED;
    state = cellState.FIXED;
  }

  function killCell() {
    state = cellState.DEAD;
  }

  function CheckList() {
    let matrix = [];
    for (let i = 0; i < 6; i++) {
      matrix[i] = [];
      for (let j = 0; j < 6; j++) {
        matrix[i].push(0);
      }
    }
    let hTiles = [];
    let vTiles = [];
    let validTiles = [];
    updateValidTileList();


    function addTile(direction, color, shape) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          let toAdd;
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += 1;
          }
        }
      }
      if (direction == 0) {
        hTiles.push([color, shape]);
      } else {
        vTiles.push([color, shape]);
      }
      updateValidTileList();
    }

    function removeTile(direction, color, shape) {
      if (direction == 0) {
        let tileIndex = hTiles.findIndex((t) => t[0] == color && t[1] == shape);
        if (tileIndex < 0) {
          throw new Error("The tile to remove is not on the checklist");
        }
        hTiles.splice(tileIndex, 1);
      } else {
        let tileIndex = vTiles.findIndex((t) => t[0] == color && t[1] == shape);
        if (tileIndex < 0) {
          throw new Error("The tile to remove is not on the checklist");
        }
        vTiles.splice(tileIndex, 1);
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          let toAdd;
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += -1;
          }
        }
      }
      updateValidTileList();
    }

    function updateValidTileList() {
      let h = hTiles.length;
      let v = vTiles.length;
      let t = h + v;
      const hTest = (id) => matrix[id[0]][id[1]] + 1 == h;
      let hTestResult = hTiles.every(hTest);
      const vTest = (id) => matrix[id[0]][id[1]] + 1 == v;
      let vTestResult = vTiles.every(vTest);
      if (hTestResult && vTestResult) {
        validTiles = [];
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) {
            if (matrix[i][j] == t) {
              validTiles.push([i, j]);
            }
          }
        }
        if (validTiles.length == 0) {
          killCell();
        }
      } else {
        validTiles = [];
        killCell();
      }
    }

    function getValidTileNames() {
      let validTileNames = [];
      validTiles.forEach((tile) => {
        validTileNames.push([
          reverseEnum(color, tile[0]),
          reverseEnum(shape, tile[1]),
        ]);
      });
      return validTileNames;

      function reverseEnum(e, value) {
        for (let k in e) if (e[k] == value) return k;
      }
    }

    return {
      get matrix() {
        return matrix;
      },
      addTile,
      removeTile,
      get hTiles() {
        return hTiles;
      },
      get vTiles() {
        return vTiles;
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
    activate,
    placeTile,
    pickTile,
    fixTile,
  };
}
