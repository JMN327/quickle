import { tileState } from "./enums/tile-state";
import { color } from "./enums/color";
import { shape } from "./enums/shape";

export default function Cell() {
  let tile = undefined;
  let checkList = CheckList();

  function placeTile(movingTile) {
    if (tile) {
      throw new Error("There is already a tile in this cell");
    }
    tile = movingTile;
    tile.state = tileState.PLACED;
  }

  function pickTileUp() {
    if (!tile) {
      throw new Error("There is no tile in this cell");
    }
    let pickedUpTile = tile;
    pickedUpTile.state = tileState.MOVING;
    tile = undefined;
    return pickTileUp;
  }

  function fixTile() {
    if (!tile) {
      throw new Error("The is not a tile in this cell to fix yet");
    }
    tile.state = tileState.FIXED;
  }

  function CheckList() {
    let hTiles = [];
    let vTiles = [];
    let validTiles = [];

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

    let matrix = [];
    for (let i = 0; i < 6; i++) {
      matrix[i] = [];
      for (let j = 0; j < 6; j++) {
        matrix[i].push(0);
      }
    }

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
    get empty() {
      return tile == undefined;
    },
    get checkList() {
      return checkList;
    },
    placeTile,
    pickTileUp,
    fixTile,
  };
}
