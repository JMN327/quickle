import { tileState } from "./enums/tile-state";

export default function Cell() {
  let tile = undefined;
  let criteria = [];

  let words = {
    own: {
      h: undefined,
      v: undefined,
    },
    adjacent: {
      left: { color:undefined, shape:undefined },
      right: { color:undefined, shape:undefined  },
      up: { color:undefined, shape:undefined },
      down: { color:undefined, shape:undefined  },

    },
  };


  function placeTile(movingTile) {
    if (tile) {
      throw new Error("There is already a tile in this cell");
    }
    tile = movingTile;
    tile.state = tileState.PLACED;
  }

  function fixTile() {
    if (!tile) {
      throw new Error("The is not a tile in this cell to fix yet");
    }
    tile.state = tileState.FIXED;
  }

  function removeTile() {
    let removedTile = tile;
    tile = undefined;
    return removedTile;
  }

  function addCriterion({ color, shape }) {
    if (tile) {
      return;
    }
    criteria.push({ color, shape });
  }

  function meetsCriteria(checkColor, checkShape) {
    if (tile) {
      throw new Error("There is already a tile in this cell");
    }
    if (!(criteria && criteria)) {
      return false;
    }
    let check = (criterion) => {
      let a = checkColor == criterion.color;
      let b = checkShape == criterion.shape;
      console.log(a ^ b);
      return a ^ b;
    };
    console.log(criteria.every(check));
    return criteria.every(check);
  }

  return {
    get tile() {
      return tile;
    },
    get empty() {
      return tile == undefined;
    },
    placeTile,
    fixTile,
    removeTile,
    addCriterion,
    meetsCriteria,
    words,
  };
}
