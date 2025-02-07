import {
  addBasicElement,
  addNullRackTile,
  addSvgElement,
  addTileElement,
  addValidSpaceElement,
  removeAllChildNodes,
  removeAllChildNodesByCssClass,
} from "./DOM-elements.js";
import ZoomPanWindow from "./ui-zoom-pan-window.js";
import GameManager from "../game-managers/game-manager.js";
import { PlayerType } from "../enums/player-type.js";
import { CellState } from "../enums/cell-state.js";
import Add_Component_Drag_Drop_Container, {
  Add_Component_Drag_Drop_Item,
} from "./Component_Drag_Drop_List.js";
import { Color } from "../enums/color.js";
import { Shape } from "../enums/shape.js";

export default function screenManager() {
  let gridSizePx = 100;
  let containerDiv = document.querySelector("body");

  //module scoped variables
  let game = GameManager(); // maybe player details and start game
  let players;// setup players
  let playerUI = []; // setup player spaces
  let board = game.board;
  let boardUI = addBasicElement("div", ["board"], containerDiv); //setup board
  let zpwUI = ZoomPanWindow(containerDiv);
  zpwUI.bounded = false;
  zpwUI.appendChildToView(boardUI);

  // setup Game
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  setupBoard();
  let scoreSheet;
  setupScoreSheet();
  let rack = currentRack();
  let gameWidgetUI = setupGameWidgetUI(); // = setup rackDivs
  displayRack();

  function setupBoard() {
    boardUI.addEventListener("mouseup", (event) => {
      if (!event.target.closest(".valid-space")) {
        return;
      }
      let gridPos = [
        Math.floor(
          (event.clientY - boardUI.getBoundingClientRect().top) /
            gridSizePx /
            zpwUI.zoomScale
        ),
        Math.floor(
          (event.clientX - boardUI.getBoundingClientRect().left) /
            gridSizePx /
            zpwUI.zoomScale
        ),
      ];
      console.log(gridPos);
      game.placeSelectedTileOnBoard(gridPos[0], gridPos[1]);
      displayBoard();
      displayPlacedAndFixedTilesOnBoard();
      displayRack();
      displayPlayableTilesForSelection();
    });
  }

  function setupGameWidgetUI() {
    let widget = addBasicElement("div", ["widget"]);
    zpwUI.appendChildToPanel(widget);

    ///// rack /////
    let rackDiv = addBasicElement("div", ["rack"], widget);
    Add_Component_Drag_Drop_Container(rackDiv, []);
    rackDiv.addEventListener("dragDrop", (event) => {
      console.log(
        `Switching item: ${event.detail.pickup} with item ${event.detail.swap}`
      );
      rack.rearrange(event.detail.pickup, event.detail.swap);
    });
    rackDiv.addEventListener("mousedown", (event) => {
      console.log("Rack Click");
      event.stopImmediatePropagation();
    });
    rackDiv.addEventListener("mouseup", (event) => {
      let item = event.target.closest(".grid-item");
      console.log(item);
      if (!item) {
        return;
      }
      if (item.classList.contains("moving")) {
        console.log(`moving, no select`);
        return;
      }
      let selectedItemIndex = [...rackDiv.children].indexOf(item);
      if (selectedItemIndex == rack.selectionIndexes[0]) {
        Array.from(rackDiv.children).forEach((child) =>
          child.classList.remove("not-selected")
        );
        rackDiv.querySelector(".selected")?.classList.remove("selected");
        rack.deselectSingle(selectedItemIndex);
        removeValidEmptySpacesOnBoardForSelectedTile();
        return;
      }
      rack.selectSingle(selectedItemIndex);
      Array.from(rackDiv.children).forEach((child) =>
        child.classList.add("not-selected")
      );
      rackDiv.querySelector(".selected")?.classList.remove("selected");
      item.classList.add("selected");
      item.classList.remove("not-selected");
      displayPlayableTilesForSelection();
    });

    for (let i = 0; i < 6; i++) {
      let tileSpace = addTileElement(5, 5, rackDiv);
      tileSpace.classList.add("null-tile");
      Add_Component_Drag_Drop_Item(tileSpace);
    }

    ///// buttons /////
    /* let buttonsDiv = addBasicElement("div", ["widget__buttons"], widget); */
    let swapButtonContainer = addBasicElement(
      "div",
      ["widget__button-container", "popup-left"],
      widget
    );
    let swapButton = addBasicElement(
      "div",
      ["widget__button", "swap"],
      swapButtonContainer
    );
    let swapIcon = addSvgElement("swap", ["button-icon"], swapButton);
    widget.insertBefore(swapButtonContainer, widget.firstChild);
    let playButtonContainer = addBasicElement(
      "div",
      ["widget__button-container", "popup-right"],
      widget
    );
    let playButton = addBasicElement(
      "div",
      ["widget__button", "play"],
      playButtonContainer
    );
    let playIcon = addSvgElement("play", ["button-icon"], playButton);

    swapButton.addEventListener("mousedown", (event) => {
      console.log("swap Click");
      event.stopImmediatePropagation();
    });
    playButton.addEventListener("mousedown", (event) => {
      console.log("play Click");
      event.stopImmediatePropagation();
      confirmTurn();
      displayRack();
      displayScoreSheet()
    });

    return { container: widget, rackDiv };
  }

  function setupScoreSheet() {
    scoreSheet = addBasicElement("div", ["scoreSheet"]);
    zpwUI.appendChildToPanel(scoreSheet);
  }

  function displayScoreSheet() {
    removeAllChildNodes(scoreSheet)
    let openCloseButton = addBasicElement(
      "div",
      ["scoreSheet__openCloseButton"],
      scoreSheet
    );
    let scoreTable = addBasicElement("div", ["scoreSheet__table"], scoreSheet);
    console.log(game.playerManager.playerCount*2)
    scoreTable.style.gridTemplateColumns = "repeat(6,1fr)" //`repeat(${players.playerCount*2}, 1fr)`
    game.scores.forEach((round) => {
      for (let i = 0; i < round.length; i++) {
        if (scoreTable,round[i] != undefined) {
          addBasicElement("span", ["scoreSheet__cell"], scoreTable,round[i])
        }
      }
    });
    for (let i = 0; i < game.playerManager.playerCount; i++) {
      scoreTable.children[i].classList.add("scoreSheet__header")
    }
    openCloseButton.addEventListener("mouseup", (event) => {
      scoreTable.classList.toggle("scoreTable__hidden");
    });
  }

  function displayRack() {
    rack = currentRack();
    console.table(rack.tiles);
    for (let i = 0; i < 6; i++) {
      let tile = rack.tiles[i];
      let rackSpaceDivs = Array.from(gameWidgetUI.rackDiv.children);
      rackSpaceDivs[i].classList.remove(
        reverseEnum(Color, Color.RED),
        reverseEnum(Color, Color.ORANGE),
        reverseEnum(Color, Color.YELLOW),
        reverseEnum(Color, Color.GREEN),
        reverseEnum(Color, Color.BLUE),
        reverseEnum(Color, Color.PURPLE),
        "null-tile",
        "not-selected"
      );
      if (tile == null) {
        rackSpaceDivs[i].classList.add("null-tile");
        rackSpaceDivs[i].classList.remove("selected");
      } else {
        rackSpaceDivs[i].classList.add(reverseEnum(Color, tile.color));
        rackSpaceDivs[i]
          .querySelector("use")
          .setAttribute("href", `#${reverseEnum(Shape, tile.shape)}`);
      }
    }
  }
  function displayBoard() {
    let boardSizeW = board.bounds.hSize * gridSizePx;
    let boardSizeH = board.bounds.vSize * gridSizePx;
    let leftOffset = board.bounds.left * gridSizePx;
    let topOffset = board.bounds.top * gridSizePx;
    let styles = boardUI.style;
    styles.width = `${boardSizeW}px`;
    styles.height = `${boardSizeH}px`;
    let centre = [zpwUI.viewWidth / 2, zpwUI.viewHeight / 2];
    console.log(zpwUI.viewWidth / 2 - boardSizeW / 2);
    styles.left = `${zpwUI.viewWidth / 2 + leftOffset - gridSizePx / 2}px`;
    styles.top = `${zpwUI.viewHeight / 2 + topOffset - gridSizePx / 2}px`;
  }

  function displayPlacedAndFixedTilesOnBoard() {
    removeAllChildNodesByCssClass(boardUI, "svg-tile");
    let tilePositionsOnBoard = [
      ...board.positionsByCellState(CellState.PLACED),
      ...board.positionsByCellState(CellState.FIXED),
    ];
    tilePositionsOnBoard.forEach((pos) => {
      let tile = board.cells[pos[0]][pos[1]].tile;
      addTileElement(
        tile.color,
        tile.shape,
        boardUI,
        pos[0] * gridSizePx,
        pos[1] * gridSizePx
      );
    });
  }

  function displayPlayableTilesForSelection() {
    console.log(`VALID SPACES FOR SELECTED TILE:`);
    console.table(game.playableTilesForSelection());
    removeAllChildNodesByCssClass(boardUI, "valid-space");
    game.playableTilesForSelection()?.forEach((pos) => {
      console.log(pos);
      addValidSpaceElement(boardUI, pos[0] * gridSizePx, pos[1] * gridSizePx);
    });
  }
  function removeValidEmptySpacesOnBoardForSelectedTile() {
    removeAllChildNodesByCssClass(boardUI, "valid-space");
  }

  function confirmTurn() {
    game.confirmTurn();
  }

  function currentRack() {
    console.log(game.currentPlayer);
    return game.currentPlayer.rack;
  }

  displayBoard();
  displayPlacedAndFixedTilesOnBoard();

  function reverseEnum(e, value) {
    for (let k in e) if (e[k] == value) return k;
  }
}
