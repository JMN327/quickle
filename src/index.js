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

let clickOffsetY;
let clickOffsetX;

let outerH_default = 800;
let outerW_default = 800;
setOuterSize([outerH_default, outerW_default]);

const innerH_Default = 1011;
const innerW_Default = 1511;
setInnerSize([innerH_Default, innerW_Default]);
const aspectRatio = innerH_Default / innerW_Default;

let zoomLevel = 0;
const zoomLevelMax = 20;
let zoomFactor = 10;

const zoomAddW = innerW_Default / zoomFactor;
const zoomAddH = innerH_Default / zoomFactor;

let innerH_current = innerH_Default;
let innerW_current = innerW_Default;

let innerMouseDown = false;

outer.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

outer.addEventListener("mousedown", (event) => {
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

outer.addEventListener("wheel", (event) => zoom(event), { passive: false });

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
    console.log(`zooming in`);
  } else {
    zoomLevel--;
    zoomParity = 1;
    console.log(`zooming out`);
  }

  let innerH_initial = innerH_current;
  let innerW_initial = innerW_current;
  let partialZoomAddH;
  let partialZoomAddW;

  let innerH_proposed = innerH_Default + zoomLevel * zoomAddH;
  let innerW_proposed = innerW_Default + zoomLevel * zoomAddW;

  // zooming out edge cases
  if (zoomParity === 1) {
    if (innerH_proposed <= outerH_default) {
      zoomLevel++;
      innerH_current = outerH_default;
      innerW_current = outerH_default / aspectRatio;

      partialZoomAddH = innerH_initial - outerH_default;
      partialZoomAddW = partialZoomAddH / aspectRatio;

      console.log(
        "partials",
        partialZoomAddH,
        partialZoomAddW,
        partialZoomAddW / partialZoomAddH
      );
      zoomOffset(event, partialZoomAddH, partialZoomAddW, zoomParity);
    } else if (innerW_proposed <= outerW_default) {
      zoomLevel++;
      innerH_current = outerW_default * aspectRatio;
      innerW_current = outerW_default;

      partialZoomAddW = innerW_initial - outerW_default;
      partialZoomAddH = partialZoomAddW * aspectRatio;

      console.log("partials", partialZoomAddH, partialZoomAddW);
      zoomOffset(event, partialZoomAddH, partialZoomAddW, zoomParity);
    } else {
      innerH_current = innerH_proposed;
      innerW_current = innerW_proposed;
      console.log("no partials");
      zoomOffset(event, zoomAddH, zoomAddW, zoomParity);
    }
  }

  // zooming in edge cases
  if (zoomParity === -1) {
    if (innerH_initial == outerH_default) {
      innerH_current = innerH_proposed;
      innerW_current = innerW_proposed;

      partialZoomAddH = innerH_proposed - innerH_initial;
      partialZoomAddW = partialZoomAddH / aspectRatio;

      console.log("partials", partialZoomAddH, partialZoomAddW);

      zoomOffset(event, partialZoomAddH, partialZoomAddW, zoomParity);
    } else if (innerW_initial == outerW_default) {
      innerH_current = innerH_proposed;
      innerW_current = innerW_proposed;

      partialZoomAddW = innerW_proposed - innerW_initial;
      partialZoomAddH = partialZoomAddW * aspectRatio;

      console.log("partials", partialZoomAddH, partialZoomAddW);

      zoomOffset(event, partialZoomAddH, partialZoomAddW, zoomParity);
    } else {
      innerH_current = innerH_proposed;
      innerW_current = innerW_proposed;
      console.log("no partials");
      zoomOffset(event, zoomAddH, zoomAddW, zoomParity);
    }
  }
  console.log(`zoom level: ${zoomLevel}`);

  setInnerSize([innerH_current, innerW_current]);
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
    bottom = top + innerH_current - outerH_default;
    left = event.clientX - outer.getBoundingClientRect().left - clickOffsetX;
    right = left + innerW_current - outerW_default;
  } else {
    console.log("move Zoom");
    top =
      inner.getBoundingClientRect().top -
      outer.getBoundingClientRect().top +
      zoom.posOffsetY;
    bottom = top + innerH_current - outerH_default;
    left =
      inner.getBoundingClientRect().left -
      outer.getBoundingClientRect().left +
      zoom.posOffsetX;
    right = left + innerW_current - outerW_default;
  }

  if (top < 0 && bottom > 0) {
    setInnerTop(top);
  } else if (top >= 0) {
    top = 0;
    setInnerTop(top);
  } else {
    bottom = outerH_default - innerH_current;
    setInnerTop(bottom);
  }
  if (left < 0 && right > 0) {
    setInnerLeft(left);
  } else if (left >= 0) {
    left = 0;
    setInnerLeft(left);
  } else {
    right = outerW_default - innerW_current;
    setInnerLeft(right);
  }

  console.log({
    T: Math.round(top),
    B: Math.round(bottom),
    L: Math.round(left),
    R: Math.round(right),
  });
}

function setOuterSize([outerH, outerW]) {
  if (outerH) {
    outer.style.height = outerH + "px";
  }
  if (outerW) {
    outer.style.width = outerW + "px";
  }
}

function setInnerSize([innerH, innerW]) {
  if (innerH) {
    inner.style.height = innerH + "px";
  }
  if (innerW) {
    inner.style.width = innerW + "px";
  }
}

function setInnerLeft(left) {
  inner.style.left = left + "px";
}
function setInnerTop(top) {
  inner.style.top = top + "px";
}
