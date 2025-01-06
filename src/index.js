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

/* let gridSize = 9;
let grid = addBasicElement("div", ["grid"], body);
populateGrid();

grid.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    event.deltaY > 0 ? gridSize++ : gridSize--;
    if (gridSize < 1) {
      gridSize = 1;
    }
    if (gridSize > 24) {
      gridSize = 24;
    }
    console.log(`Grid Size ${gridSize} `);
    populateGrid();
  },
  { passive: false }
);

function populateGrid() {
  removeAllChildNodes(grid);
  const gridPx = 616 / gridSize;
  console.log(gridPx);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let cell = addBasicElement("div", ["cell"], grid);
      cell.style.left = `${gridPx * i}px`;
      cell.style.top = `${gridPx * j}px`;
      cell.style.width = `${gridPx}px`;
      cell.style.height = `${gridPx}px`;
      addTileElement("circle", "purple", cell);
    }
  }
} */

let outer = addBasicElement("div", ["outer"], body);
let inner = addBasicElement("div", ["inner"], outer);
let mouseY;
let mouseX;
let clickOffsetY;
let clickOffsetX;

let innerHeight = 1200;
let innerWidth = 1800;
let outerHeight = 800;
let outerWidth = 800;

inner.style.height = innerHeight + "px";
inner.style.width = innerWidth + "px";
outer.style.height = outerHeight + "px";
outer.style.width = outerWidth + "px";

let innerMouseDown = false;

inner.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

inner.addEventListener("mousedown", (event) => {
  if (event.buttons !== 1) {
    return;
  }
  innerMouseDown = true;
  clickOffsetY = event.clientY - inner.getBoundingClientRect().top;
  clickOffsetX = event.clientX - inner.getBoundingClientRect().left;
});

document.body.addEventListener("mousemove", (event) => {
  if (!innerMouseDown) {
    return;
  }
  if (event.buttons !== 1) {
    return;
  }
  let top = event.clientY - outer.getBoundingClientRect().top - clickOffsetY;
  let bottom = top + innerHeight - outerHeight;
  let left = event.clientX - outer.getBoundingClientRect().left - clickOffsetX;
  let right = left + innerWidth - outerWidth;

  if (top < 0 && bottom > 0) {
    inner.style.top = top + "px";
  }
  if (left < 0 && right > 0) {
    inner.style.left = left + "px";
  }

  console.log(left, right, top, bottom);
});

document.body.addEventListener("mouseup", (event) => {
  innerMouseDown = false;
});
