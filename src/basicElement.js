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

export function addTileElement(shape, color, parent = null) {
  const svgTile = document.createElement("div");
  svgTile.classList.add("svg-tile");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add(shape);
  svg.classList.add(color);
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${shape}`);
  svg.appendChild(use);
  svgTile.appendChild(svg);
  if (parent) {
    parent.appendChild(svgTile);
  }
  return svgTile;
}
