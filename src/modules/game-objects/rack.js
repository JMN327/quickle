import Bag from "./bag";

export default function rack() {
  let tiles = [];

  function fill() {
    let count = 6 - tiles.length;
    tiles = tiles.splice(tiles.length, 0, ...bag.draw(count));
  }
  // .fill = tiles =>bag.drawTiles(6 - tiles.length)
  // .selection = tile number of interface selected tile
  // .select = push tile onto selection
  // .swapMode = bool activated if player wants to swap tiles
  // .swapSelect = push tile onto swapSelection
  // .swapSelection = [] of tile numbers for swapping
  // .deselect = remove tile from selection
  // .swap(selection[]) = bag.swapTiles(selection[])

  return {
    tiles,
    fill,
  };
}
