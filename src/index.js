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
import { Color } from "./modules/game-objects/enums/color.js";
import { Shape } from "./modules/game-objects/enums/shape.js";
import { Direction } from "./modules/game-objects/enums/direction.js";
import Board from "./modules/game-objects/board.js";
import { CellState } from "./modules/game-objects/enums/cell-state.js";

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

/* let board = Board()
console.log(board.positions())
let cell = board.grid[0][0];
console.log(cell.checkList)
console.log(cell.state)
console.table(cell.checkList.validTiles);
cell.checkList.addTile(Direction.HORIZONTAL, Color.RED, Shape.CIRCLE);
cell.checkList.addTile(Direction.HORIZONTAL, Color.RED, Shape.SQUARE);
cell.checkList.addTile(Direction.VERTICAL, Color.GREEN, Shape.CLOVER);
console.table(cell.checkList.validTiles);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(Direction.HORIZONTAL, Color.RED, Shape.SQUARE);
console.table(cell.checkList.validTileNames);
cell.checkList.removeTile(Direction.VERTICAL, Color.GREEN, Shape.CLOVER);
console.table(cell.checkList.validTileNames);
cell.checkList.addTile(Direction.VERTICAL, Color.YELLOW, Shape.DIAMOND);
cell.checkList.addTile(Direction.VERTICAL, Color.RED, Shape.DIAMOND);
console.table(cell.checkList.validTileNames);
console.table(cell.checkList.matrix); */

let bag = Bag()
let rack = Rack()
let board = Board()
console.table(board.info)
bag.fill()

board.addTile(bag.quickPick(Color.RED, Shape.CIRCLE), 0, 0)
board.addTile(bag.quickPick(Color.RED, Shape.CLOVER), 0, 1)
board.addTile(bag.quickPick(Color.RED, Shape.CROSS), 1, 0)
board.addTile(bag.quickPick(Color.GREEN, Shape.CLOVER), -1, 1)
board.addTile(bag.quickPick(Color.YELLOW, Shape.CLOVER), -2, 1)
board.addTile(bag.quickPick(Color.YELLOW, Shape.DIAMOND), -2, 0)
//board.addTile(bag.quickPick(Color.RED, Shape.DIAMOND), 0, 3)
//board.addTile(bag.quickPick(Color.RED, Shape.SQUARE), 0, 4)
//board.addTile(bag.quickPick(Color.RED, Shape.DIAMOND), 2, 1)
/* console.table(board.info)
console.table(board.cells[0][2].checkList.matrix)
console.table(board.cells[0][2].checkList.vTiles)
console.table(board.cells[0][2].checkList.hTiles) */


//board.removeTile(0,0)
//board.removeTile(0, 0)

//console.table(board.info)

