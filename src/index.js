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
let outerW = 1000;
setDivSize([outer, outerH, outerW]);

const outerL = outer.getBoundingClientRect().left;
const outerT = outer.getBoundingClientRect().top;

let inner = addBasicElement("div", ["inner"], outer);
const innerH = 800;
const innerW = 1600;
setDivSize([inner, innerH, innerW]);

//initiate transform matrix
let scale = 1;
let matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);

setTransformOrigin({ x: 0, y: 0 });

let mousedownPos = { x: 0, y: 0 };
let mousemovePos = { x: 0, y: 0 };
let divMovingPos = { x: 0, y: 0 };
let divPos = { x: 0, y: 0 };

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

function getMousePos(event) {
  if (!event) {
    return { x: 0, y: 0 };
  }
  return { x: event.clientX - outerL, y: event.clientY - outerT };
}

function setTransformOrigin(pos = { x: 0, y: 0 }) {
  inner.style.transformOrigin = `${pos.x}px ${pos.y}px`;
}

function setTransform({ scale, x, y }) {
  if (scale != null) {
    matrix.a = scale;
    matrix.d = scale;
  }
  if (x != null) {
    matrix.e = x;
  }
  if (y !=null) {
    matrix.f = y;
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

  scale *= scaleFactor ** zoomParity;

  mousemovePos = getMousePos(event);
  let d = { x: mousemovePos.x - divPos.x, y: mousemovePos.y - divPos.y };
  divPos.y += d.y - d.y * scaleFactor ** zoomParity;
  divPos.x += d.x - d.x * scaleFactor ** zoomParity;

  console.log(zoomParity, zoomLevel, divPos)

  setTransform({ scale: scale, x: divPos.x, y: divPos.y });
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
  mousedownPos = getMousePos(event);
});

document.body.addEventListener("mousemove", (event) => {
  if (!innerMouseDown) {
    return;
  }
  if (event.buttons !== 1) {
    return;
  }

  mousemovePos = getMousePos(event);

  divMovingPos = {
    x: divPos.x + mousemovePos.x - mousedownPos.x,
    y: divPos.y + mousemovePos.y - mousedownPos.y,
  };

  setTransform(divMovingPos);
});

document.body.addEventListener("mouseup", (event) => {
  innerMouseDown = false;
  divPos = divMovingPos;
});
