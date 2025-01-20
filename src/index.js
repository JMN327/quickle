import "./styles.css";
import storageAvailable from "./modules/browser-storage.js";
import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "./modules/UI/DOM-elements.js";
import ZoomPanWindow from "./modules/UI/ui-zoom-pan-window.js";

import Bag from "./modules/game-objects/bag.js";
import Rack from "./modules/game-objects/rack.js";
import Cell from "./modules/game-objects/cell.js";
import { color } from "./modules/game-objects/enums/color.js";
import { shape } from "./modules/game-objects/enums/shape.js";
import { direction } from "./modules/game-objects/enums/direction.js";
import CheckList from "./modules/abstract/CheckList.js";

console.log("Hello World!)");
console.log(`Local Storage available: ${storageAvailable("localStorage")}`);
console.log(`Session Storage available: ${storageAvailable("sessionStorage")}`);

let body = document.querySelector("body");

///// outer /////
let frame = addBasicElement("div", ["zpw"], body);
let frameH = 800;
let frameW = 800;
setDivSize([frame, frameH, frameW]);

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

/* let bag = Bag()
bag.fill()
bag.shuffle()
let rack = Rack()
rack.addTiles(bag.draw(rack.spaces.count))
console.table(rack.tiles)
rack.rearrange(0,1)
console.table(rack.tiles)
rack.xSelect(2)
console.table(rack.tiles)
let playedTile = rack.selection.remove() // cell.tile = rack.playSelected()
console.table(playedTile)
console.table(rack.tiles)
rack.addTiles(bag.draw(rack.spaces.count))
console.table(rack.tiles) */

let cell = Cell();

//let checkList = CheckList()
cell.checkList.addTile(direction.HORIZONTAL, color.RED, shape.CIRCLE);
cell.checkList.addTile(direction.HORIZONTAL, color.RED, shape.SQUARE);
cell.checkList.addTile(direction.VERTICAL, color.GREEN, shape.CLOVER);
console.table(cell.checkList.validTiles);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(direction.HORIZONTAL, color.RED, shape.SQUARE);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(direction.VERTICAL, color.GREEN, shape.CLOVER);
console.table(cell.checkList.validTileNames);
