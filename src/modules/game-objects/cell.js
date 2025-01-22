import { TileState } from "./enums/tile-state";
import { Color } from "./enums/color";
import { Shape } from "./enums/shape";
import { CellState } from "./enums/cell-state";
import { Direction } from "./enums/direction";

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
    let matrix = new Array(6).fill().map(() => new Array(6).fill(0));
    let hTiles = [];
    let vTiles = [];
    let validTiles = [];
    updateValidTileList();

    function addTile(direction, color, shape) {
      let toAdd = [color, shape];
      if (direction == Direction.HORIZONTAL) {
        if (hTiles.some((x) => x.every((y) => toAdd.includes(y)))) {
          return;
        }
        hTiles.push(toAdd);
      } else {
        if (vTiles.some((x) => x.every((y) => toAdd.includes(y)))) {
          return;
        }
        vTiles.push(toAdd);
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += 1;
          }
        }
      }
      console.table(hTiles);
      console.table(vTiles);
      updateValidTileList();
    }

    function addTileH(color, shape) {
      let toAdd = [color, shape];

      if (hTiles.some((x) => x.every((y) => toAdd.includes(y)))) {
        return;
      }
      hTiles.push(toAdd);
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += 1;
          }
        }
      }
      updateValidTileList();
    }

    function addTileV(color, shape) {
      let toAdd = [color, shape];
      if (vTiles.some((x) => x.every((y) => toAdd.includes(y)))) {
        return;
      }
      vTiles.push(toAdd);
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if ((i == color && j != shape) || (i != color && j == shape)) {
            matrix[i][j] += 1;
          }
        }
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
      //console.trace()
      let h = hTiles.length;
      let v = vTiles.length;
      let t = h + v;
      console.log({ h, v, t });
      console.table(hTiles)
      console.table(vTiles)
      console.table(matrix)

      const allEqualAndGraterThanZero = arr => arr.every( v => (matrix[v[0]][v[1]] === matrix[arr[0][0]][arr[0][1]] && matrix[v[0]][v[1]]>0 )|| t ===1)

      let hTestResult = allEqualAndGraterThanZero(hTiles);

      let vTestResult = allEqualAndGraterThanZero(vTiles);

      console.log(`hTest ${hTestResult} vTest ${vTestResult}`);
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
          state = CellState.DEAD;
        } else if (validTiles.length == 36) {
          state = CellState.DORMANT;
        } else {
          state = CellState.ACTIVE;
        }
      } else {
        validTiles = [];
        state = CellState.DEAD;
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
        return matrix;
      },
      addTile,
      addTileH,
      addTileV,
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
    addTile,
    removeTile,
    fixTile,
    firstCell,
  };
}
