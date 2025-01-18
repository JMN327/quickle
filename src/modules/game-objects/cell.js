import { tileState } from "./enums/tile-state";

export default function Cell() {
  let tile = undefined;
  let rowCriteria = [];
  let colCriteria = [];

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

  function addRowCriterion({ color, shape }) {
    if (tile) {
      return;
    }
    rowCriteria.push({ color, shape });
  }

  function addColCriterion({ color, shape }) {
    if (tile) {
      return;
    }
    colCriteria.push({ color, shape });
  }

  function meetsCriteria(checkColor, checkShape) {
    if (tile) {
      throw new Error("There is already a tile in this cell");
    }
    if (!(rowCriteria && colCriteria)) {
      return false;
    }
    let check = (criterion) => {
      let a = checkColor == criterion.color;
      let b = checkShape == criterion.shape;
      console.log(a ^ b);
      return a ^ b;
    };
    console.log(rowCriteria.every(check), colCriteria.every(check))
    return rowCriteria.every(check) && colCriteria.every(check);
  }

  function removeTile() {
    let removedTile = tile;
    tile = undefined;
    return removedTile;
  }

  return {
    get tile() {
      return tile;
    },
    placeTile,
    fixTile,
    removeTile,
    addRowCriterion,
    addColCriterion,
    meetsCriteria,
  };
}
