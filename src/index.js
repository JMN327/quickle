import "./styles.css";
import storageAvailable from "./modules/browser-storage.js";
import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "./modules/UI/DOM-elements.js";
import ZoomPanWindow from "./modules/UI/ui-zoom-pan-window.js";

import { color } from "./modules/game-objects/ENUMS-color.js";
import { shape } from "./modules/game-objects/ENUMS-shape.js";
import Tile from "./modules/game-objects/tile.js";
import Bag from "./modules/game-objects/bag.js";
import Rack from "./modules/game-objects/rack.js";

console.log("Hello World!)");
console.log(`Local Storage available: ${storageAvailable("localStorage")}`);
console.log(`Session Storage available: ${storageAvailable("sessionStorage")}`);

let body = document.querySelector("body");

///// outer /////
let frame = addBasicElement("div", ["zpw"], body);
let frameH = 800;
let frameW = 800;
setDivSize([frame, frameH, frameW]);

/* let frame2 = addBasicElement("div", ["zpw"], body);
let frame2H = 400;
let frame2W = 600;
setDivSize([frame2, frame2H, frame2W]); */

function setDivSize([div, h, w]) {
  if (h) {
    div.style.height = h + "px";
  }
  if (w) {
    div.style.width = w + "px";
  }
}

let zpw = ZoomPanWindow(frame);
zpw.bounded = true;
console.log(zpw.zoomLevelMax);

/* let pallet = addBasicElement("div", ["pallet"], body)
addTileElement("cross", "red", pallet)
addTileElement("clover", "orange", pallet)
addTileElement("diamond", "yellow", pallet)
addTileElement("circle", "green", pallet)
addTileElement("square", "blue", pallet)
addTileElement("star", "purple", pallet)

zpw.appendChild(pallet) */
zpw.zoomScaleFactor = 1.25;
console.log(zpw.zoomScaleFactor);

/* let t1 = Tile(color.RED, shape.CIRCLE)
let t2 = Tile(color[0], shape[3])

console.log(t2.color, t2.shape) */

let bag = Bag()
//console.log(bag.tiles)
bag.fill()
bag.shuffle()
//console.log(bag.tiles)
let rack = Rack()
rack.fill(bag)
console.table(rack.tiles)
rack.rearrange(0,1)
console.table(rack.tiles)
rack.select(3)
console.log(rack.selection)
let playedTile = rack.playSelected() // cell.tile = rack.playSelected()
console.table(playedTile)
console.table(rack.tiles)
