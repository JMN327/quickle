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

let outerHeight = 800;
let outerWidth = 800;
outer.style.height = outerHeight + "px";
outer.style.width = outerWidth + "px";
const innerHeight_Default = 1000;
const innerWidth_Default = 1500;
const aspectRatio = innerHeight_Default / innerWidth_Default;
inner.style.height = innerHeight_Default + "px";
inner.style.width = innerWidth_Default + "px";
let zoomLevel = 0;
const zoomLevelMax = 10;
let zoomFactor = 10;
const zoomAmountX = innerHeight_Default / zoomFactor;
const zoomAmountY = innerWidth_Default / zoomFactor;
let innerH_current = innerHeight_Default;
let innerW_current = innerWidth_Default;

inner.style.height = innerHeight_Default + "px";
inner.style.width = innerWidth_Default + "px";

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
  moveInner(event);
});

document.body.addEventListener("mouseup", (event) => {
  innerMouseDown = false;
});

inner.addEventListener("wheel", (event) => zoom(event), { passive: false });

function zoom(event) {
  event.preventDefault();

  if (event.deltaY < 0) {
    zoomLevel++;
    if (zoomLevel > zoomLevelMax) {
      console.log(`max zoom level reached`);
      zoomLevel--
      return;
    }
    console.log("zooming in");
  } else {
    console.log("zooming out");
    zoomLevel--;
  }
  console.log(`zoom level: ${zoomLevel}`);

  let innerH_proposed = innerHeight_Default + zoomLevel * zoomAmountX;
  let innerW_proposed = innerWidth_Default + zoomLevel * zoomAmountY;

  /* if (innerH_proposed >= outerHeight && innerW_proposed >= outerWidth) {
    innerH_current = innerH_proposed;
    innerW_current = innerW_proposed;
  } */

  if (innerH_proposed < outerHeight) {
    const difY = (innerH_proposed + zoomAmountX - outerHeight) / aspectRatio;
    zoomLevel++;
    innerH_current = outerHeight;
    innerW_current = innerWidth_Default + zoomLevel * zoomAmountY + difY;
  } else if (innerW_proposed < outerWidth) {
    const difX = (innerW_proposed + zoomAmountY - outerWidth) * aspectRatio;
    zoomLevel++;
    innerH_current = innerHeight_Default + zoomLevel * zoomAmountX + difX;
    innerW_current = outerWidth;
  } else {
    innerH_current = innerH_proposed;
    innerW_current = innerW_proposed;
  }

  console.log(innerH_current, innerW_current, innerH_current / innerW_current);

  inner.style.height = innerH_current + "px";
  inner.style.width = innerW_current + "px";
  //moveInner(event);
}

function moveInner(event) {
  let top = event.clientY - outer.getBoundingClientRect().top - clickOffsetY;
  let bottom = top + innerH_current - outerHeight;
  let left = event.clientX - outer.getBoundingClientRect().left - clickOffsetX;
  let right = left + innerW_current - outerWidth;

  if (top < 0 && bottom > 0) {
    inner.style.top = top + "px";
  } else if (top >= 0) {
    inner.style.top = "0px";
  } else {
    inner.style.top = outerHeight - innerH_current + "px";
  }
  if (left < 0 && right > 0) {
    inner.style.left = left + "px";
  } else if (left >= 0) {
    inner.style.left = "0px";
  } else {
    inner.style.left = outerWidth - innerW_current + "px";
  }

  console.log(event.clientY, left, right, top, bottom);
}
