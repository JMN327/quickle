import Bag from "./bag";
import { tileState } from "./enums/tile-state";

export default function Rack() {
    let tiles = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ];

  
  function selectForSwap(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    tiles[i].state = tileState.PLAYSELECTED;
  }
  function deselectByIndex(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for deselection");
    }
    tiles[i].state = tileState.RACK;
  }
  function deselectAll() {
    tiles.forEach((tile) => {
      tile.state = tileState.RACK;
    });
  }
  function selectForPlay(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    deselectAll();
    tiles[i].state = tileState.PLAYSELECTED;
  }

  function rearrange(from, to) {
    if (from > 5 || from < 0 || to > 5 || to < 0) {
      throw new Error("Invalid indexes for rearrangement");
    }
    tiles.splice(to, 0, tiles.splice(from, 1)[0]);
  }
  
  return {
    tiles,
    rearrange,
    selectForSwap,
    deselectByIndex,
    deselectAll,
    selectForPlay,
    get emptySpaces() {
      let emptySpaces = [];
      tiles.forEach((tile, index) => {
        if (tile == undefined) {
          emptySpaces.push(index);
        }
      });
      console.table(emptySpaces);
      return emptySpaces;
    },
    get swapSelected() {
      let selected = []
      tiles.forEach((tile, index) => {
        if (tile == undefined) {
          return
        }
        if (tile.state = tileState.SELECTED) {
          selected.push(index);
        }
      });
      console.table(selected);
      return selected;
    },
    get playSelected() {
      let selected;
      tiles.forEach((tile, index) => {
        if (tile == undefined) {
          return
        }
        if (tile.state = tileState.SELECTED) {
          selected = index
        }
      });
      console.table(selected);
      return selected;
    }
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
  
  function playSelected() {
    if (!selectedTilesIndexArr) {
      throw new Error("there is no selected tile on the rack");
    }
    let tileToBePlayed = slots.splice(selectedTilesIndexArr, 1)[0];
    slots.splice(selectedTilesIndexArr, 0, undefined);
    tileToBePlayed.state = tileState.LOOSE;
    return tileToBePlayed;
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
