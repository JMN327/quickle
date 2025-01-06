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

//let pallet = addBasicElement("div", ["pallet"], body)
/* addTileElement("cross", "red", pallet)
addTileElement("clover", "orange", pallet)
addTileElement("diamond", "yellow", pallet)
addTileElement("circle", "green", pallet)
addTileElement("square", "blue", pallet)
addTileElement("star", "purple", pallet) */

let gridSize = 9;
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
}

//grid-template-columns: repeat(var(--grid-size), 1fr);
//grid-template-rows: repeat(var(--grid-size), 1fr);
