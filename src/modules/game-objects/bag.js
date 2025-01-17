import { color } from "./enums/color";
import { shape } from "./enums/shape";
import { tileState } from "./enums/tile-state";
import Tile from "./tile";

export default function Bag() {
  const colorArr = Object.values(color);
  const shapeArr = Object.values(shape);
  let tiles = [];

  function fill() {
    let n = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        for (let k = 0; k < 3; k++) {
          tiles.push(Tile(n, colorArr[i], shapeArr[j], tileState.BAG));
          n++;
        }
      }
    }
  }

  function shuffle() {
    let m = tiles.length;
    let t;
    let i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = tiles[m];
      tiles[m] = tiles[i];
      tiles[i] = t;
    }
  }

  function draw(count) {
    count = count > tiles.length ? tiles.length : count;
    return tiles.splice(-count, count);
  }

  // change to remove and fill
  function putBack(arr) {
    if (!arr) {
      return;
    }
    let count = arr.length;
    if (count > tiles.length) {
      throw new Error("Not enough tiles left in the bag to complete the swap");
    }
    return tiles.splice(tiles.length, 0, ...arr);
  }

  return {
    tiles,
    fill,
    shuffle,
    draw,
    putBack,
    get count() {
      return tiles.length;
    },
  };
}
