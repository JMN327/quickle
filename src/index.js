import "./styles.css";
import storageAvailable from "./local-storage.js";
import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "./elements.js";

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
let outerH = 800;
let outerW = 800;
setDivSize([outer, outerH, outerW]);

const outerL = outer.getBoundingClientRect().left;
const outerT = outer.getBoundingClientRect().top;

let inner = addBasicElement("div", ["inner"], outer);
const innerH = 800;
const innerW = 800;
setDivSize([inner, innerH, innerW]);

//initiate transform matrix
let scale = 1;
let top = 0;
let left = 0;
let matrix = new DOMMatrix([scale, 0, 0, scale, left, top]);

inner.style.transformOrigin = "00px 00px";

let startX;
let startY;
let currentX;
let currentY;
let dx;
let dy;
let lastDx = 0;
let lastDy = 0;

const zoomLevelMax = 10;
const zoomLevelMin = -10;
let zoomLevel = 0;

let scaleFactor = 1.1;

///// utilities /////

function setDivSize([div, h, w]) {
  if (h) {
    div.style.height = h + "px";
  }
  if (w) {
    div.style.width = w + "px";
  }
}

function updateInnerTransform({ scale, left, top }) {
  if (scale) {
    matrix.scaleSelf(scale);
  }
  if (left) {
    matrix.e = left;
  }
  if (top) {
    matrix.f = top;
  }
  inner.style.transform = matrix;
}

///// zooming /////

outer.addEventListener("wheel", (event) => zoom(event), { passive: false });

function zoom(event) {
  event.preventDefault();

  let zoomParity;
  if (event.deltaY < 0) {
    if (zoomLevel == zoomLevelMax) {
      console.log(`max zoom in level reached`);
      return;
    }
    zoomLevel++;
    zoomParity = 1;
    console.log(`zooming in`);
  } else {
    if (zoomLevel == zoomLevelMin) {
      console.log(`max zoom out level reached`);
      return;
    }
    zoomLevel--;
    zoomParity = -1;
    console.log(`zooming out`);
  }
}

///// panning /////

let innerMouseDown = false;

outer.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

outer.addEventListener("mousedown", (event) => {
  if (event.buttons !== 1) {
    return;
  }
  innerMouseDown = true;
  startX = event.clientX - outerL;
  startY = event.clientY - outerT;
});

document.body.addEventListener("mousemove", (event) => {
  if (!innerMouseDown) {
    return;
  }
  if (event.buttons !== 1) {
    return;
  }
  currentX = event.clientX - outerL;
  currentY = event.clientY - outerT;
  dx = lastDx + currentX - startX;
  dy = lastDy + currentY - startY;
  console.log({ dx, dy });
  updateInnerTransform({ left: dx, top: dy });
});

document.body.addEventListener("mouseup", (event) => {
  innerMouseDown = false;
  lastDx = dx;
  lastDy = dy;
});
