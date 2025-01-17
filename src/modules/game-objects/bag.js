import { color } from "./ENUMS-color";
import { shape } from "./ENUMS-shape";
import Tile from "./tile";

export default function Bag() {
  const colorArr = Object.values(color);
  const shapeArr = Object.values(shape);
  let tiles = [];

  function fill() {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        for (let k = 0; k < 3; k++) {
          tiles.push(Tile(colorArr[i], shapeArr[j]));
        }
      }
    }
  }

  function shuffle() {
    let m = tiles.length 
    let t
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

  // drawTiles(int count) method to return array of tiles equal to count removed from bag array
  function draw(count){
    count = count > tiles.length ? tiles.length :count
    return tiles.splice(-count,count)
  }

  function swap(arr){
    if (!arr) {
      return
    }
    let count = arr.length
    if (count>tiles.length) {
      throw new Error("Not enough tiles left in the bag to complete the swap");
      
    }
    shuffle()
    return tiles.splice(-count,count, ...arr)
  }

  return {
    tiles,
    fill,
    shuffle,
    draw,
    swap,
  }
}
