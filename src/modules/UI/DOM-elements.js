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

  if (textContent != undefined) {
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

export function addTileElement(color, shape, parent = null, type, top, left) {
  const svgTile = document.createElement("div");
  svgTile.classList.add("tile");
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
  } 
  switch (type) {
    case "board":
      svgTile.classList.add("board-tile");
      break;
      case "bag":
        svgTile.classList.add("bag-tile");
      break;
      case "rack":
        svgTile.classList.add("rack-tile");
      break;
  }

  if (parent) {
    parent.appendChild(svgTile);
  }
  return svgTile;
}
export function addTileGlowElement(parent = null, top, left) {
  const glowTile = document.createElement("div");
  glowTile.classList.add("board-tile");
  glowTile.classList.add("placed-tile__glow");
  if (left && top) {
    glowTile.style.left = `${left}px`;
    glowTile.style.top = `${top}px`;
  } 

  if (parent) {
    parent.appendChild(glowTile);
  }
  return glowTile;
}
export function addTileScoreElement(parent = null, top, left) {
  const scoreDiv = document.createElement("div");
  scoreDiv.classList.add("placed-tile__score");
  if (parent) {
    parent.appendChild(scoreDiv);
  }
  if (left && top) {
    scoreDiv.style.left = `${left - scoreDiv.getBoundingClientRect().width / 3}px`;
    scoreDiv.style.top = `${top - scoreDiv.getBoundingClientRect().height / 3}px`;
  } 

  return scoreDiv;
}

export function addNullRackTile(parent = null) {
  const nullTile = document.createElement("div");
  nullTile.classList.add("null-tile");
  if (parent) {
    parent.appendChild(nullTile);
  }
  return nullTile;
}

export function addValidSpaceElement(parent = null, top, left) {
  const space = document.createElement("div")
  const border = document.createElement("div")
  border.classList.add("valid-space__border")
  space.appendChild(border)
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
export function removeAllNodesByCssClass( cssClass) {
  document.querySelectorAll(cssClass).forEach(e => e.remove())
}

function reverseEnum(e, value) {
  for (let k in e) if (e[k] == value) return k;
}
