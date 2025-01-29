import { Color } from "../enums/color";
import { TileState } from "../enums/tile-state";

export default function Rack() {
  let tiles = new Array(6);
  tiles.fill(null);
  Object.seal(tiles);

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
  function selectSingle(i) {
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
    let gap = tiles[from];
    tiles[from] = tiles[to];
    tiles[to] = gap;
    console.log(`tile at index ${from} swapped with tile at index ${to}`)
  }

  function getRackIndexesOfSelectedTiles() {
    let selected = [];
    tiles.forEach((tile, index) => {
      if (tile == null) {
        return;
      }
      if (tile.state == TileState.SELECTED) {
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

  function drawTiles(arr) {
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
      tiles.splice(emptySpaces[i], 1, arr[i]);
      tiles[emptySpaces[i]].state = TileState.RACK;
    }
  }

  function pickUpSelection() {
    let selectionArr = getRackIndexesOfSelectedTiles();
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

  function longestWordLength() {
    let colorCounts = {};
    let maxColor = tiles[0];
    let maxColorCount = 1;
    for (let i = 0; i < 6; i++) {
      let color = tiles[i].color;
      if (colorCounts[color] == null)
        colorCounts[color] = { count: 1, shapes: [tiles[i].shape] };
      else if (!colorCounts[color].shapes.includes(tiles[i].shape)) {
        colorCounts[color].count++;
        colorCounts[color].shapes.push(tiles[i].shape);
      }
      if (colorCounts[color].count > maxColorCount) {
        maxColor = color;
        maxColorCount = colorCounts[color].count;
      }
    }
    let shapeCounts = {};
    let maxShape = tiles[0];
    let maxShapeCount = 1;
    for (let i = 0; i < 6; i++) {
      let shape = tiles[i].shape;
      if (shapeCounts[shape] == null)
        shapeCounts[shape] = { count: 1, colors: [tiles[i].color] };
      else if (!shapeCounts[shape].colors.includes(tiles[i].color)) {
        shapeCounts[shape].count++;
        shapeCounts[shape].colors.push(tiles[i].color);
      }
      if (shapeCounts[shape].count > maxShapeCount) {
        maxShape = shape;
        maxShapeCount = shapeCounts[shape].count;
      }
    }
    return Math.max(maxColorCount, maxShapeCount);
  }

  return {
    get tiles() {
      return tiles;
    },
    drawTiles,
    pickUpSelection,
    rearrange,
    select,
    selectSingle,
    deselectSingle,
    deselectAll,
    longestWordLength,
    get spaces() {
      return { indexArr: getSpaces(), count: getSpaces().length };
    },
    get selection() {
      return tiles[getRackIndexesOfSelectedTiles()];
    },
  };
}
