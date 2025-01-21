import { TileState } from "./enums/tile-state";

export default function Rack() {

  let tiles = new Array(6)
  tiles.fill(null)
  Object.seal(tiles)

  function select(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    tiles[i].state = TileState.SELECTED;
  }
  function deselectSingle(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for deselection");
    }
    tiles[i].state = TileState.RACK;
  }
  function deselectAll() {
    tiles.forEach((tile) => {
      if (tile != null) {
        tile.state = TileState.RACK;
      }
    });
  }
  function xSelect(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    deselectAll();
    tiles[i].state = TileState.SELECTED;
  }

  function rearrange(from, to) {
    if (from > 5 || from < 0 || to > 5 || to < 0) {
      throw new Error("Invalid indexes for rearrangement");
    }
    let gap = tiles[from]
    tiles[from] = tiles[to]
    tiles[to] = gap
  }

  function getSelection() {
    let selected = [];
    tiles.forEach((tile, index) => {
      if (tile == null) {
        return;
      }
      if ((tile.state == TileState.SELECTED)) {
        selected.push(index);
      }
    });
    return selected;
  }

  function getSpaces() {
    let emptySpaces = [];
    tiles.forEach((tile, index) => {
      if (tile == null) {
        emptySpaces.push(index);
      }
    });
    return emptySpaces;
  }

  function addTiles(arr) {
    if (!arr) {
      throw new Error("No tiles passed for adding");
    }
    let emptySpaces = getSpaces();
    if (arr.length > emptySpaces.length) {
      throw new Error(
        "Trying to pass more tiles to the rack than spaces available"
      );
    }
    for (let i = 0; i < arr.length; i++) {
      tiles.splice(emptySpaces[i],1,arr[i])
      tiles[emptySpaces[i]].state = TileState.RACK
    }
  }

  function removeSelection() {
    let selectionArr = getSelection();
    let removedTileArr = [];
    if (!selectionArr) {
      throw new Error("there are no selected tiles on the rack");
    }
    selectionArr.forEach((tileIndex) => {
      tiles[tileIndex].state = TileState.MOVING;
      removedTileArr.push(tiles.splice(tileIndex, 1, null)[0]);
    });
    return removedTileArr;
  }

  return {
    get tiles() {
      return tiles
    },
    addTiles,
    removeSelection,
    rearrange,
    select,
    xSelect,
    deselectSingle,
    deselectAll,
    get spaces() {
      return {indexArr:getSpaces(), count:getSpaces().length};
    },
    get selection() {
      return {indexArr:getSelection(), count:getSelection().length, remove:removeSelection};
    },
  };
}