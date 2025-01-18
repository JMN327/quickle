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
  let swapMode = false;

  function getEmptySpaces() {
    let emptySpaces = [];
    tiles.forEach((space, index) => {
      if (space == undefined) {
        emptySpaces.push(index);
      }
    });
    console.table(emptySpaces);
    return emptySpaces;
  }

  let selection;
  let swapSelection = [];

  function fill(bag) {
    if (!bag) {
      throw new Error("The bag has not been created");
    }
    let emptySpaces = getEmptySpaces()
    if (emptySpaces.length == 0) {
      return;
    }
    emptySpaces.forEach((space) => {
      tiles.splice(space, 1, ...bag.draw(1));
      //tiles[space] = ...bag.draw(1);
      tiles[space].state = tileState.RACK;
    });

    /*     let count = 6 - tiles.length;
    tiles.splice(tiles.length, 0, ...bag.draw(count));
    tiles.forEach((tile) => {
      tile.state = tileState.RACK;
    }); */
  }

  function select(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    tiles[i].state = tileState.SELECTED;
    selection = i;
  }
  function deselect(i) {
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for deselection");
    }
    tiles[i].state = tileState.RACK;
    selection = undefined;
  }

  function playSelected() {
    if (!selection) {
      throw new Error("there is no selected tile on the rack");
    }
    let playedTile = tiles.splice(selection, 1)[0];
    tiles.splice(selection,0,undefined)
    playedTile.state = tileState.LOOSE;
    return playedTile;
  }

  function rearrange(from, to) {
    if (from > 5 || from < 0 || to > 5 || to < 0) {
      throw new Error("Invalid indexes for rearrangement");
    }
    tiles.splice(to, 0, tiles.splice(from, 1)[0]);
  }

  function swapSelect(i) {
    if (!swapMode) {
      return
    }
    if (i > 5 || i < 0) {
      throw new Error("Invalid index for selection");
    }
    tiles[i].state = tileState.SWAPSELECTED;
    swapSelection.push(tiles[i])
  }

  function deselectAll() {
    tiles.forEach((tile) => {
      tile.state = tileState.RACK;
    });
    selection = undefined;
  }



  // .swapMode = bool activated if player wants to swap tiles
  // .swapSelect = push tile onto swapSelection
  // .swapSelection = [] of tile numbers for swapping

  // .swap(selection[]) = bag.swapTiles(selection[])

  ////// think about moving swap function out of bag, into rack

  return {
    tiles,
    fill,
    select,
    deselect,
    deselectAll,
    rearrange,
    get selection() {
      return tiles[selection];
    },
    playSelected,
  };
}
