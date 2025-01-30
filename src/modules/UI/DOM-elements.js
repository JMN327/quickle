import { Color } from "../enums/color";
import { Shape } from "../enums/shape";

export function addBasicElement(
  tag = "div",
  classes = [],
  parent = null,
  textContent = ""
) {
  let element = document.createElement(tag);
  classes.forEach((cssClass) => {
    element.classList.add(cssClass);
  });

  if (textContent) {
    element.textContent = textContent;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

export function addSvgElement(shape, classes = [], parent = null) {
  const svgElement = document.createElement("div");
  svgElement.classList.add("svg-element");
  classes.forEach((cssClass) => {
    svgElement.classList.add(cssClass);
  });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("svg-element__svg");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${shape}`);
  svg.appendChild(use);
  svgElement.appendChild(svg);
  if (parent) {
    parent.appendChild(svgElement);
  }
  return svgElement;
}

export function addTileElement(color, shape, parent = null, left, top) {
  const svgTile = document.createElement("div");
  svgTile.classList.add("svg-tile");
  svgTile.classList.add(reverseEnum(Shape, shape));
  svgTile.classList.add(reverseEnum(Color, color));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("svg-tile__svg");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${reverseEnum(Shape, shape)}`);
  svg.appendChild(use);
  svgTile.appendChild(svg);
  if (left && top) {
    svgTile.style.left = `${left}px`;
    svgTile.style.top = `${top}px`;
    svgTile.style.position = "absolute"
  }

  if (parent) {
    parent.appendChild(svgTile);
  }
  return svgTile;
}

export function addValidSpaceElement(parent = null, left, top) {
  const space = document.createElement("div")
  space.classList.add("valid-space")
  space.style.left = `${left}px`;
  space.style.top = `${top}px`;
  space.style.position = "absolute"

  if (parent) {
    parent.appendChild(space);
  }
}

export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
export function removeAllChildNodesByCssClass(parent, cssClass) {
  Array.from(parent.children).forEach((child)=>{
    if (child.classList.contains(cssClass)) {
      parent.removeChild(child)
    }
  })
}

function reverseEnum(e, value) {
  for (let k in e) if (e[k] == value) return k;
}
