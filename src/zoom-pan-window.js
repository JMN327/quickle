import { addBasicElement, addSvgElement } from "./elements.js";

export default function zoomPanWindow(div) {
  if (!div) {
    return null;
  }

  ///// Setup frame viv /////
  const frame = addBasicElement("div", ["frame"], div);
  let frameLimits = frame.getBoundingClientRect();
  const frameL = frameLimits.left;
  const frameT = frameLimits.top;
  const frameW = frameLimits.width;
  const frameH = frameLimits.height;

  ///// Setup view div /////
  let view = addBasicElement("div", ["view"], frame);
  /* view.style.left = 0
  view.style.top = 0 */
  let viewH = 1600;
  let viewW = 1600;

  let viewR;
  let viewB;
  setDivSize([view, viewH, viewW]);

  ///// transform matrix /////
  let scale = 1;
  let matrix = new DOMMatrix([scale, 0, 0, scale, 0, 0]);

  setTransformOrigin({ x: 0, y: 0 });

  ///// positions /////
  let mousedownPos = { x: 0, y: 0 };
  let mousemovePos = { x: 0, y: 0 };
  let viewMovingPos = { x: 0, y: 0 };
  let viewPos = { x: 0, y: 0 };
  let viewMouseDown = false;
  let bounded = true;

  ///// zoom /////
  let zoomLevelMax = 10;
  let zoomLevelMin = -10;
  let zoomLevel = 0;
  let zoomParity;
  let zoomScaleFactor = 1.1;

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
    switch (event.type) {
      case "click":
        return { x: (frameW/2), y:(frameH/2)};
        break;
      default:
        return { x: event.clientX - frameL, y: event.clientY - frameT };
    }
  }

  function setTransformOrigin(pos = { x: 0, y: 0 }) {
    view.style.transformOrigin = `${pos.x}px ${pos.y}px`;
  }

  function setTransform({ scale, x, y }) {
    if (scale != null) {
      matrix.a = scale;
      matrix.d = scale;
    }
    if (x != null) {
      matrix.e = x;
    }
    if (y != null) {
      matrix.f = y;
    }
    view.style.transform = matrix;
  }

  ///// exposed functions /////
  

  function getBounded() {
    let isBounded = bounded ? true : false;
    return isBounded;
  }
  function setBounded(bool) {
    if (typeof bool == "boolean") {
      bounded = bool;
    }
  }

  function getViewWidth() {
    return viewW;
  }
  function setViewWidth(width) {
    if (typeof width != "number") {
      throw new Error("Parameter is not a number!");
    }
    if (width < frameW && bounded === true) {
      throw new Error(
        "You cannot set the view width as less than the frame width for a bounded window"
      );
    }
    viewW = width;
    setDivSize([view, viewH, viewW]);
  }

  function getViewHeight() {
    return viewH;
  }
  function setViewHeight(height) {
    if (typeof height != "number") {
      throw new Error("Parameter is not a number!");
    }
    if (height < frameH && bounded === true) {
      throw new Error(
        "You cannot set the view height as less than the frame height for a bounded window"
      );
    }
    viewH = height;
    setDivSize([view, viewH, viewW]);
  }

  function appendChild(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error("Parameter is not an HTML Element");
    }
    view.appendChild(div);
  }

  function getZoomLevelMax() {
    return zoomLevelMax;
  }
  function setZoomLevelMax(max) {
    max = max < 0 ? 0 : max;
    zoomLevelMax = max;
  }
  function getZoomLevelMin() {
    return zoomLevelMin;
  }
  function setZoomLevelMin(min) {
    min = min > 0 ? 0 : min;
    zoomLevelMin = min;
  }

  ///// zooming /////
  frame.addEventListener("wheel", (event) => zoom(event), { passive: false });

  function zoom(event) {
    let condition;
    switch (event.type) {
      case "wheel":
        event.preventDefault();
        console.log(event.type);
        condition = event.deltaY < 0;
        break;
      case "click":
        console.log(event.type);
        condition = event.target.closest(".controls__icon").classList.contains("zoom-in");
        console.log(condition);
        break;
      default:
        return;
    }

    if (condition) {
      if (zoomLevel == zoomLevelMax) {
        console.log(`max zoom in level reached: ${zoomLevel}`);
        return;
      }
      zoomLevel++;
      zoomParity = 1;
      console.log(`zooming in`);
    } else {
      if (zoomLevel == zoomLevelMin) {
        console.log(`max zoom out level reached: ${zoomLevel}`);
        return;
      }
      zoomLevel--;
      zoomParity = -1;
      console.log(`zooming out`);
    }

    scale *= zoomScaleFactor ** zoomParity;

    if (viewW * scale < frameW || viewH * scale < frameH) {
      scale *= (zoomScaleFactor ** zoomParity) ** -1;
      return;
    }

    mousemovePos = getMousePos(event);
    let d = { x: mousemovePos.x - viewPos.x, y: mousemovePos.y - viewPos.y };
    viewPos.x += d.x - d.x * zoomScaleFactor ** zoomParity;
    viewPos.y += d.y - d.y * zoomScaleFactor ** zoomParity;

    if (bounded) {
      viewPos = checkBounds({ x: viewPos.x, y: viewPos.y });
    }

    setTransform({ scale: scale, x: viewPos.x, y: viewPos.y });
  }

  ///// panning /////
  frame.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  frame.addEventListener("mousedown", (event) => {
    if (event.buttons !== 1) {
      return;
    }
    viewMouseDown = true;
    mousedownPos = getMousePos(event);
  });

  document.body.addEventListener("mousemove", (event) => {
    if (!viewMouseDown) {
      return;
    }
    if (event.buttons !== 1) {
      return;
    }

    mousemovePos = getMousePos(event);

    viewMovingPos = {
      x: viewPos.x + mousemovePos.x - mousedownPos.x,
      y: viewPos.y + mousemovePos.y - mousedownPos.y,
    };

    if (bounded) {
      viewMovingPos = checkBounds({
        x: viewMovingPos.x,
        y: viewMovingPos.y,
      });
    }

    setTransform(viewMovingPos);
  });

  document.body.addEventListener("mouseup", (event) => {
    viewMouseDown = false;
    viewPos = viewMovingPos;
  });

  ///// bounds /////
  function checkBounds({ x, y }) {
    x = x > 0 ? 0 : x;
    y = y > 0 ? 0 : y;

    viewR = x + viewW * scale;
    viewB = y + viewH * scale;

    x = viewR < frameW ? frameW - viewW * scale : x;
    y = viewB < frameH ? frameH - viewH * scale : y;

    return { x, y };
  }

  ///// control panel /////

  let panel = addBasicElement("div", ["panel"], frame);
  let controls = addBasicElement("div", ["panel__controls"], panel);
  let zoomIn = addSvgElement("zoom-in", ["zoom-in", "controls__icon"], controls);
  zoomIn.addEventListener("click", (event) => zoom(event));
  let zoomOut = addSvgElement("zoom-out", ["zoom-out", "controls__icon"], controls);
  zoomOut.addEventListener("click", (event) => zoom(event));
  let resetView = addSvgElement("reset-view", ["controls__icon"], controls);

  return {
    getZoomLevelMax,
    setZoomLevelMax,
    getZoomLevelMin,
    setZoomLevelMin,
    get zoomScaleFactor() {
      return zoomScaleFactor;
    },
    getViewWidth,
    setViewWidth,
    getViewHeight,
    setViewHeight,
    getBounded,
    setBounded,
    appendChild,
  };
}
