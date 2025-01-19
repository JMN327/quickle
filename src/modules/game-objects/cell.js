import { tileState } from "./enums/tile-state";

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
    let horizontalIds = [];
    let verticalIds = [];
    let placeableIds = [];

    let matrix = [];
    for (let i = 0; i < 6; i++) {
      matrix[i] = [];
      for (let j = 0; j < 6; j++) {
        matrix[i].push(0);
      }
    }

    function add(direction, color, shape) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          let toAdd;
          if ((i == color && j != shape) || (i != color && j == shape)) {
            toAdd = 1;
          } else {
            toAdd = 0;
          }
          matrix[i][j] += toAdd;
        }
      }
      if (direction == 0) {
        horizontalIds.push([color, shape]);
      } else {
        verticalIds.push([color, shape]);
      }
      updateValidTileList();
    }

    function updateValidTileList() {
      //...placeableIds
      let h = horizontalIds.length;
      let v = verticalIds.length;
      let t = h + v;
      let hVal = horizontalIds.every((id) => {
        console.log(matrix[id[0]][id[1]], horizontalIds)
        matrix[id[0]][id[1]] == t-1;
      });
      console.log(horizontalIds, hVal, t)
    }

    return {
      get matrix() {
        return matrix;
      },
      add,
      get horizontalIds() {
        return horizontalIds;
      },
      get verticalIds() {
        return verticalIds;
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
