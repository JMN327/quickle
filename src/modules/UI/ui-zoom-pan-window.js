import { addBasicElement, addSvgElement } from "./DOM-elements.js";

export default function ZoomPanWindow(containerDiv) {
  if (!containerDiv) {
    return null;
  }

  ///// set up zoom pan window /////
  let zpw = addBasicElement("div", ["zpw"], containerDiv);
  /*   let zpwH = 900;
  let zpwW = 900;
  setDivSizePx([zpw, zpwH, zpwW]); */
  zpw.style.width = "100vw";
  zpw.style.height = "100vh";

  ///// Setup frame div /////
  const frame = addBasicElement("div", ["frame"], zpw);
  let frameLimits = frame.getBoundingClientRect();
  const frameL = frameLimits.left;
  const frameT = frameLimits.top;
  const frameW = frameLimits.width;
  const frameH = frameLimits.height;

  ///// Setup view div /////
  let view = addBasicElement("div", ["view"], frame);
  let viewH = 5000;
  let viewW = 5000;
  let viewR;
  let viewB;
  setDivSizePx([view, viewH, viewW]);
  let viewMouseDown = false;
  let bounded = true;

  ///// transform matrix /////
  let scale = 1;
  let matrix = new DOMMatrix([scale, 0, 0, scale, 0, 0]);
  setTransformOrigin({ x: 0, y: 0 });

  ///// initialize positions /////
  function center() {
    return {
      x: frameW / 2 - (viewW / 2) * scale,
      y: frameH / 2 - (viewH / 2) * scale,
    };
  }
  let centered = center();
  let mousedownPos = center();
  let mousemovePos = center();
  let viewMovingPos = center();
  let viewPos = center();
  setTransform({ scale: scale, x: viewPos.x, y: viewPos.y });

  function centerView() {
    console.log("centered:", viewPos == centered);

    if (viewPos != centered) {
      let thisCenter = center();
      let animation = view.animate(
        [
          {
            transform: `matrix(${scale}, 0, 0, ${scale}, ${matrix.e}, ${matrix.f})`,
          },
          {
            transform: `matrix(${scale}, 0, 0, ${scale}, ${thisCenter.x}, ${thisCenter.y})`,
          },
        ],
        300
      );
      animation.onfinish = () => {
        mousedownPos = center();
        mousemovePos = center();
        viewMovingPos = center();
        viewPos = center();
        setTransform({ scale: scale, x: viewPos.x, y: viewPos.y });
      };
    }
  }
  centerView();

  ///// zoom /////
  let zoomLevelMax = 3;
  let zoomLevelMin = -7;
  let zoomLevel = 0;
  let zoomParity;
  let zoomScaleFactor = 1.18;

  ///// utilities /////
  function setDivSizePx([div, h, w]) {
    if (h) {
      div.style.height = h + "px";
    }
    if (w) {
      div.style.width = w + "px";
    }
  }

  function getMousePos(event) {
    console.log("getting mouse position");
    if (!event) {
      return { x: 0, y: 0 };
    }
    switch (event.type) {
      case "click":
        console.log("getMousePos by control panel ");
        return { x: frameW / 2, y: frameH / 2 };
        break;
      default:
        console.log("getMousePos by pan or mouse zoom ");
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

  ///// zooming /////
  frame.addEventListener("wheel", (event) => zooming(event), {
    passive: false,
  });

  function zooming(event) {
    //set condition for if zooming in/out based on event type
    let condition;
    switch (event.type) {
      case "wheel":
        event.preventDefault();
        console.log(event.type);
        condition = event.deltaY < 0;
        break;
      case "click":
        console.log(event.type);
        condition = event.target
          .closest(".controls__icon")
          .classList.contains("zoom-in");
        break;
      default:
        return;
    }

    //set zooming in/out params
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

    //update scale
    scale *= zoomScaleFactor ** zoomParity;

    //undo scale updates if bounded and width or height too small
    if (bounded && (viewW * scale < frameW || viewH * scale < frameH)) {
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
    console.log("Panning");
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
    if (!viewMouseDown) {
      return;
    }
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
  let zoomInButton = addSvgElement(
    "zoom-in",
    ["zoom-in", "controls__icon"],
    controls
  );
  zoomInButton.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });
  zoomInButton.addEventListener("click", (event) => zooming(event));
  let zoomOutButton = addSvgElement(
    "zoom-out",
    ["zoom-out", "controls__icon"],
    controls
  );
  zoomOutButton.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });
  zoomOutButton.addEventListener("click", (event) => zooming(event));
  let centerViewButton = addSvgElement(
    "reset-view",
    ["controls__icon"],
    controls
  );
  centerViewButton.addEventListener("mousedown", (event) => {
    event.stopPropagation();
  });
  centerViewButton.addEventListener("click", centerView);

  ///// exposed functions /////

  function appendChildToView(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error("Parameter is not an HTML Element");
    }
    view.appendChild(div);
  }
  function appendChildToPanel(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error("Parameter is not an HTML Element");
    }
    panel.appendChild(div);
  }

  return {
    get zoomScale() {
      return zoomScaleFactor ** zoomLevel;
    },
    get zoomLevelMax() {
      return zoomLevelMax;
    },
    set zoomLevelMax(max) {
      if (typeof max != "number") {
        throw new Error("Parameter is not a number!");
      }
      max = max < 0 ? 0 : max;
      zoomLevelMax = max;
    },
    get zoomLevelMin() {
      return zoomLevelMin;
    },
    set zoomLevelMin(min) {
      if (typeof max != "number") {
        throw new Error("Parameter is not a number!");
      }
      min = min > 0 ? 0 : min;
      zoomLevelMin = min;
    },
    get zoomScaleFactor() {
      return zoomScaleFactor;
    },
    set zoomScaleFactor(factor) {
      if (typeof factor != "number") {
        throw new Error("Parameter is not a number!");
      }
      factor = factor > 2 ? 2 : factor;
      factor = factor < 1 ? 1 : factor;
      zoomScaleFactor = factor;
    },
    get viewWidth() {
      return viewW;
    },
    set viewWidth(width) {
      if (typeof width != "number") {
        throw new Error("Parameter is not a number!");
      }
      if (width < frameW && bounded === true) {
        throw new Error(
          "You cannot set the view width as less than the frame width for a bounded window"
        );
      }
      viewW = width;
      setDivSizePx([view, viewH, viewW]);
    },
    get viewHeight() {
      return viewH;
    },
    set viewHeight(height) {
      if (typeof height != "number") {
        throw new Error("Parameter is not a number!");
      }
      if (height < frameH && bounded === true) {
        throw new Error(
          "You cannot set the view height as less than the frame height for a bounded window"
        );
      }
      viewH = height;
      setDivSizePx([view, viewH, viewW]);
    },
    get bounded() {
      let isBounded = bounded ? true : false;
      return isBounded;
    },
    set bounded(bool) {
      if (typeof bool == "boolean") {
        bounded = bool;
      }
    },
    appendChildToView,
    appendChildToPanel,
  };
}
