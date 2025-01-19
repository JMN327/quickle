import { tileState } from "./enums/tile-state";

export default function Cell() {
  let tile = undefined;

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

  


  return {
    get tile() {
      return tile;
    },
    get empty() {
      return tile == undefined;
    },
    placeTile,
    fixTile,
  };
}
