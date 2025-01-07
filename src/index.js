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
const innerHeight_Default = 1500;
const innerWidth_Default = 1000;
const aspectRatio = innerHeight_Default / innerWidth_Default;
inner.style.height = innerHeight_Default + "px";
inner.style.width = innerWidth_Default + "px";
let zoomLevel = 0;
const zoomLevelMax = 20;
let zoomFactor = 10;
const zoomIncreaseX = innerWidth_Default / zoomFactor;
const zoomIncreaseY = innerHeight_Default / zoomFactor;
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
  let zoomParity;
  if (event.deltaY < 0) {
    zoomLevel++;
    if (zoomLevel > zoomLevelMax) {
      console.log(`max zoom level reached`);
      zoomLevel--;
      return;
    }
    zoomParity = -1;
    console.log("zooming in");
  } else {
    console.log("zooming out");
    zoomLevel--;
    zoomParity = 1;
  }
  console.log(`zoom level: ${zoomLevel}`);

  let innerH_proposed = innerHeight_Default + zoomLevel * zoomIncreaseY;
  let innerW_proposed = innerWidth_Default + zoomLevel * zoomIncreaseX;

  const partIncreaseX =
    (innerW_proposed + zoomIncreaseX - outerWidth) * aspectRatio;
  const partIncreaseY =
    (innerH_proposed + zoomIncreaseY - outerHeight) / aspectRatio;

  if (innerH_proposed < outerHeight) {
    zoomLevel++;
    innerH_current = outerHeight;
    innerW_current =
      innerWidth_Default + zoomLevel * zoomIncreaseX + partIncreaseX;
    zoomOffset(event, partIncreaseY, partIncreaseX);
  } else if (innerW_proposed < outerWidth) {
    zoomLevel++;
    innerH_current =
      innerHeight_Default + zoomLevel * zoomIncreaseY + partIncreaseY;
    innerW_current = outerWidth;
    zoomOffset(event, partIncreaseY, partIncreaseX);
  } else {
    innerH_current = innerH_proposed;
    innerW_current = innerW_proposed;
    zoomOffset(event, zoomIncreaseY, zoomIncreaseX, zoomParity);
  }

  console.log(innerH_current, innerW_current, innerW_current / innerH_current);

  inner.style.height = innerH_current + "px";
  inner.style.width = innerW_current + "px";
}

function zoomOffset(event, increaseY, increaseX, zoomParity) {
  const posOffsetY =
    ((event.clientY - inner.getBoundingClientRect().top) /
      inner.getBoundingClientRect().height) *
    increaseY *
    zoomParity;
  const posOffsetX =
    ((event.clientX - inner.getBoundingClientRect().left) /
      inner.getBoundingClientRect().width) *
    increaseX *
    zoomParity;
  moveInner(event, { posOffsetX, posOffsetY });
}

function moveInner(event, zoom) {
  let top;
  let bottom;
  let left;
  let right;

  if (!zoom) {
    console.log("move Pan");
    top = event.clientY - outer.getBoundingClientRect().top - clickOffsetY;
    bottom = top + innerH_current - outerHeight;
    left = event.clientX - outer.getBoundingClientRect().left - clickOffsetX;
    right = left + innerW_current - outerWidth;
  } else {
    console.log(
      "move Zoom",
      "offX " + Math.round(zoom.posOffsetX),
      "offY " + Math.round(zoom.posOffsetY),
      Math.round(inner.getBoundingClientRect().top)
    );
    console.log(inner.style.top, inner.getBoundingClientRect().top);
    top =
      inner.getBoundingClientRect().top -
      outer.getBoundingClientRect().top +
      zoom.posOffsetY;
    bottom = top + innerH_current - outerHeight;
    left =
      inner.getBoundingClientRect().left -
      outer.getBoundingClientRect().left +
      zoom.posOffsetX;
    right = left + innerW_current - outerWidth;
  }

  if (top < 0 && bottom > 0) {
    inner.style.top = top + "px";
  } else if (top >= 0) {
    top = 0;
    inner.style.top = top + "px";
  } else {
    bottom = outerHeight - innerH_current;
    inner.style.top = bottom + "px";
  }
  if (left < 0 && right > 0) {
    inner.style.left = left + "px";
  } else if (left >= 0) {
    left = 0;
    inner.style.left = left + "px";
  } else {
    right = outerWidth - innerW_current;
    inner.style.left = right + "px";
  }

  console.log(
    "L " + Math.round(left),
    "R " + Math.round(right),
    "T " + Math.round(top),
    "B " + Math.round(bottom)
  );
}
