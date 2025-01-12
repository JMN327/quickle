import { addBasicElement } from "./elements.js";

export default function zoomPanWindow(div) {
  if (!div) {
    return null;
  }

  ///// outer /////
  const outer = addBasicElement("div", ["outer"], div);
  let outerLimits = outer.getBoundingClientRect();
  const outerL = outerLimits.left;
  const outerT = outerLimits.top;
  const outerW = outerLimits.width;
  const outerH = outerLimits.height;

  ///// inner /////
  let inner = addBasicElement("div", ["inner"], outer);
  let innerH = 1600;
  let innerW = 1600;
  let innerR;
  let innerB;
  setDivSize([inner, innerH, innerW]);

  ///// transform matrix /////
  let scale = 1;
  let matrix = new DOMMatrix([scale, 0, 0, scale, 0, 0]);

  setTransformOrigin({ x: 0, y: 0 });

  ///// positions /////
  let mousedownPos = { x: 0, y: 0 };
  let mousemovePos = { x: 0, y: 0 };
  let innerMovingPos = { x: 0, y: 0 };
  let innerPos = { x: 0, y: 0 };
  let innerMouseDown = false;
  let bounded = true;

  ///// zoom /////
  let zoomLevelMax = 10;
  let zoomLevelMin = -10;
  let zoomLevel = 0;
  let zoomParity;
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
    if (y != null) {
      matrix.f = y;
    }
    inner.style.transform = matrix;
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

  function getInnerWidth() {
    return innerW;
  }
  function setInnerWidth(width) {
    if (typeof width != "number") {
      throw new Error("Parameter is not a number!");
    }
    if (width < outerW && bounded === true) {
      throw new Error(
        "You cannot set the inner width as less than the outer width for a bounded window"
      );
    }
    innerW = width;
    setDivSize([inner, innerH, innerW]);
  }

  function getInnerHeight() {
    return innerH;
  }
  function setInnerHeight(height) {
    if (typeof height != "number") {
      throw new Error("Parameter is not a number!");
    }
    if (height < outerH && bounded === true) {
      throw new Error(
        "You cannot set the inner height as less than the outer height for a bounded window"
      );
    }
    innerH = height;
    setDivSize([inner, innerH, innerW]);
  }

  function appendChild(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error("Parameter is not an HTML Element");
    }
    inner.appendChild(div);
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
  outer.addEventListener("wheel", (event) => zoom(event), { passive: false });

  function zoom(event) {
    event.preventDefault();

    if (event.deltaY < 0) {
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

    scale *= scaleFactor ** zoomParity;

    if (innerW * scale < outerW || innerH * scale < outerH) {
      scale *= (scaleFactor ** zoomParity) ** -1;
      return;
    }

    mousemovePos = getMousePos(event);
    let d = { x: mousemovePos.x - innerPos.x, y: mousemovePos.y - innerPos.y };
    innerPos.x += d.x - d.x * scaleFactor ** zoomParity;
    innerPos.y += d.y - d.y * scaleFactor ** zoomParity;

    if (bounded) {
      innerPos = checkBounds({ x: innerPos.x, y: innerPos.y });
    }

    setTransform({ scale: scale, x: innerPos.x, y: innerPos.y });
  }

  ///// panning /////
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

    innerMovingPos = {
      x: innerPos.x + mousemovePos.x - mousedownPos.x,
      y: innerPos.y + mousemovePos.y - mousedownPos.y,
    };

    if (bounded) {
      innerMovingPos = checkBounds({
        x: innerMovingPos.x,
        y: innerMovingPos.y,
      });
    }

    setTransform(innerMovingPos);
  });

  document.body.addEventListener("mouseup", (event) => {
    innerMouseDown = false;
    innerPos = innerMovingPos;
  });

  ///// bounds /////
  function checkBounds({ x, y }) {
    x = x > 0 ? 0 : x;
    y = y > 0 ? 0 : y;

    innerR = x + innerW * scale;
    innerB = y + innerH * scale;

    x = innerR < outerW ? outerW - innerW * scale : x;
    y = innerB < outerH ? outerH - innerH * scale : y;

    return { x, y };
  }

  ///// control panel /////

  let controls = addBasicElement("div", ["control-panel"], outer);
  let styles = controls.style;
  styles.position = "absolute";
  styles.margin = "30px";
  styles.padding = "1rem";
  styles.right = outer.style.left + outer.style.width;
  console.log(outer.style.left + outer.style.width);
  styles.width = "minmax(50px, min-content)";
  styles.top = outer.style.top;
  styles.height = "minmax(50px, min-content)";
  styles.backgroundColor = "white";

  return {
    getZoomLevelMax,
    setZoomLevelMax,
    getZoomLevelMin,
    setZoomLevelMin,
    getInnerWidth,
    setInnerWidth,
    getInnerHeight,
    setInnerHeight,
    getBounded,
    setBounded,
    appendChild,
  };
}
