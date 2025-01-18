import Bag from "./bag";
import { tileState } from "./enums/tile-state";

export default function Rack() {

  let tiles = new Array(6)
  tiles.fill(undefined)
  Object.seal(tiles)

  function select(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    tiles[i].state = tileState.SELECTED;
  }
  function deselectSingle(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for deselection");
    }
    tiles[i].state = tileState.RACK;
  }
  function deselectAll() {
    tiles.forEach((tile) => {
      if (tile != undefined) {
        tile.state = tileState.RACK;
      }
    });
  }
  function xSelect(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    deselectAll();
    tiles[i].state = tileState.SELECTED;
  }

  function rearrange(from, to) {
    if (from > 5 || from < 0 || to > 5 || to < 0) {
      throw new Error("Invalid indexes for rearrangement");
    }
    let gap = tiles[from]
    tiles[from] = tiles[to]
    tiles[to] = gap
    //tiles.splice(to, 0, tiles.splice(from, 1)[0]);
  }

  function getSelection() {
    let selected = [];
    tiles.forEach((tile, index) => {
      if (tile == undefined) {
        return;
      }
      if ((tile.state == tileState.SELECTED)) {
        selected.push(index);
      }
    });
    return selected;
  }

  function getSpaces() {
    let emptySpaces = [];
    tiles.forEach((tile, index) => {
      if (tile == undefined) {
        emptySpaces.push(index);
      }
    });
    console.table(emptySpaces);
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
      tiles[emptySpaces[i]].state = tileState.RACK
    }
  }

  function removeSelection() {
    let selectionArr = getSelection();
    let removedTileArr = [];
    if (!selectionArr) {
      throw new Error("there are no selected tiles on the rack");
    }
    selectionArr.forEach((tileIndex) => {
      tiles[tileIndex].state = tileState.MOVING;
      removedTileArr.push(tiles.splice(tileIndex, 1, undefined)[0]);
    });
    return removedTileArr;
  }

  return {
    tiles,
    addTiles,
    removeSelection,
    rearrange,
    select,
    xSelect,
    deselectSingle,
    deselectAll,

    get spaces() {
      return getSpaces();
    },
    get spaceCount() {
      return getSpaces().length;
    },

    get selection() {
      return getSelection();
    },
  };
}

export function TileManager() {
  function fillRack(bag) {
    if (!bag) {
      throw new Error("The bag has not been created");
    }
    let emptySpaces = getEmptySpaces();
    if (emptySpaces.length == 0) {
      return;
    }
    emptySpaces.forEach((space) => {
      slots.splice(space, 1, ...bag.draw(1));
      //tiles[space] = ...bag.draw(1);
      slots[space].state = tileState.RACK;
    });
  }

  return {
    tiles: slots,
    fillRack,
    select,
    deselect,
    deselectAll,
    rearrange,
    get selection() {
      /////**************update
      return slots[selectedTilesIndexArr];
    },
    playSelected,
    get swapMode() {
      return swapMode;
    },
    set swapMode(bool) {
      if (typeof bool == "boolean") {
        swapMode = bool;
      }
    },
  };
}
