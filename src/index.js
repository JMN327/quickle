import "./styles.css";
import storageAvailable from "./local-storage.js";
import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "./elements.js";
import zoomPanWindow from "./zoom-pan-window.js";

console.log("Hello World!)");
console.log(`Storage available: ${storageAvailable("localStorage")}`);

let body = document.querySelector("body");

/* let pallet = addBasicElement("div", ["pallet"], body)
addTileElement("cross", "red", pallet)
addTileElement("clover", "orange", pallet)
addTileElement("diamond", "yellow", pallet)
addTileElement("circle", "green", pallet)
addTileElement("square", "blue", pallet)
addTileElement("star", "purple", pallet) */

///// outer /////
let outer = addBasicElement("div", ["outer"], body);
let outerH = 400;
let outerW = 600;
setDivSize([outer, outerH, outerW]);

let outer2 = addBasicElement("div", ["outer"], body);
let outer2H = 400;
let outer2W = 600;
setDivSize([outer2, outer2H, outer2W]);

function setDivSize([div, h, w]) {
  if (h) {
    div.style.height = h + "px";
  }
  if (w) {
    div.style.width = w + "px";
  }
}


let zpw = zoomPanWindow(outer)
let zpw2 = zoomPanWindow(outer2)
