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

export function addTileElement(shape, color, parent = null) {
  const svgTile = document.createElement("div");
  svgTile.classList.add("svg-tile");
  svgTile.classList.add(shape);
  svgTile.classList.add(color);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("svg-tile__svg");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${shape}`);
  svg.appendChild(use);
  svgTile.appendChild(svg);
  if (parent) {
    parent.appendChild(svgTile);
  }
  return svgTile;
}

export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
