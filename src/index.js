import "./styles.css";
import storageAvailable from "./browser-storage.js";
import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "./elements.js";
import zoomPanWindow from "./zoom-pan-window.js";

console.log("Hello World!)");
console.log(`Local Storage available: ${storageAvailable("localStorage")}`);
console.log(`Session Storage available: ${storageAvailable("sessionStorage")}`);

let body = document.querySelector("body");

/* let pallet = addBasicElement("div", ["pallet"], body)
addTileElement("cross", "red", pallet)
addTileElement("clover", "orange", pallet)
addTileElement("diamond", "yellow", pallet)
addTileElement("circle", "green", pallet)
addTileElement("square", "blue", pallet)
addTileElement("star", "purple", pallet) */

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

let zpw = zoomPanWindow(frame)
zpw.setBounded(true)
console.log(zpw.zoomScaleFactor)

/* let rect = document.createElement("div")
rect.style.backgroundColor = "greenyellow"
rect.style.width = "100px"
rect.style.height = "100px"
rect.style.position = "absolute"
rect.style.top = "100px"

let zpw = zoomPanWindow(frame)
let zpw2 = zoomPanWindow(frame2)
zpw2.setBounded(false)
zpw2.setZoomLevelMax(20)
zpw2.setZoomLevelMin(0)
zpw2.setViewHeight(1200)
zpw2.appendChild(rect) */
