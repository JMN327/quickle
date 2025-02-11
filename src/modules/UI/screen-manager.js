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
  // lock the screen from portrait orientation
  let oppositeOrientation = "landscape";
  screen.orientation
    .lock(oppositeOrientation)
    .then(() => {
      console.log.textContent = `Locked to ${oppositeOrientation}\n`;
    })
    .catch((error) => {
      console.log.textContent += `${error}\n`;
    });

  let gridSizePx = 100;
  let globalContainerDiv = document.querySelector("body");

  //module scoped variables
  let game = GameManager(); // maybe player details and start game
  let players; // setup players
  let playerUI = []; // setup player spaces

  let zpwUI = ZoomPanWindow(globalContainerDiv);
  zpwUI.bounded = false;
  let board = game.board;
  let boardUI = setupBoard();
  zpwUI.appendChildToView(boardUI);
  let gameWidgetUI = setupGameWidgetUI(); // = setup rackDivs
  zpwUI.appendChildToPanel(gameWidgetUI.widgetDiv);
  let scoreSheetUI = setupScoreSheet();
  zpwUI.appendChildToPanel(scoreSheetUI);
  let bagUI = setupBag()
  zpwUI.appendChildToPanel(bagUI);
  
  // setup Game
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  displayRack();
  displayBag() 
  displayBoard();
  displayPlacedAndFixedTilesOnBoard();

  function setupBoard() {
    let boardDiv = addBasicElement("div", ["board"], globalContainerDiv);
    boardDiv.addEventListener("mouseup", (event) => {
      if (!event.target.closest(".valid-space")) {
        return;
      }
      let gridPos = [
        Math.floor(
          (event.clientY - boardDiv.getBoundingClientRect().top) /
            gridSizePx /
            zpwUI.zoomScale
        ),
        Math.floor(
          (event.clientX - boardDiv.getBoundingClientRect().left) /
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
    return boardDiv;
  }

  function setupGameWidgetUI() {
    let widgetDiv = addBasicElement("div", ["widget"]);

    ///// rack /////
    let rackDiv = addBasicElement("div", ["rack"], widgetDiv);
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
      if (selectedItemIndex == game.currentPlayer.rack.selectionIndexes[0]) {
        Array.from(rackDiv.children).forEach((child) =>
          child.classList.remove("not-selected")
        );
        rackDiv.querySelector(".selected")?.classList.remove("selected");
        game.currentPlayer.rack.deselectSingle(selectedItemIndex);
        removeValidEmptySpacesOnBoardForSelectedTile();
        return;
      }
      game.currentPlayer.rack.selectSingle(selectedItemIndex);
      Array.from(rackDiv.children).forEach((child) =>
        child.classList.add("not-selected")
      );
      rackDiv.querySelector(".selected")?.classList.remove("selected");
      item.classList.add("selected");
      item.classList.remove("not-selected");
      displayPlayableTilesForSelection();
    });

    for (let i = 0; i < 6; i++) {
      let tileSpace = addTileElement(5, 5, rackDiv, "rack");
      tileSpace.classList.add("null-tile");
      Add_Component_Drag_Drop_Item(tileSpace);
    }

    ///// buttons /////
    /* let buttonsDiv = addBasicElement("div", ["widget__buttons"], widget); */
    let buttonContainer = addBasicElement(
      "div",
      ["widget__button-container"],
      widgetDiv
    );
    let bagButton = addBasicElement(
      "div",
      ["widget__button", "bag"],
      buttonContainer
    );
    let bagIcon = addSvgElement("bag", ["button-icon"], bagButton);
    let scoreButton = addBasicElement(
      "div",
      ["widget__button", "score"],
      buttonContainer
    );

    let scoreIcon = addSvgElement("score", ["button-icon"], scoreButton);
    let swapButton = addBasicElement(
      "div",
      ["widget__button", "swap"],
      buttonContainer
    );
    let swapIcon = addSvgElement("swap", ["button-icon"], swapButton);

    let playButton = addBasicElement(
      "div",
      ["widget__button", "play"],
      buttonContainer
    );
    let playIcon = addSvgElement("play", ["button-icon"], playButton);

    bagButton.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      console.log("bag Click");
      event.stopImmediatePropagation();
    });
    bagButton.addEventListener("mouseup", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      bagUI.classList.toggle("scoreTable__hidden");
      displayBag();
    });
    scoreButton.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      console.log("score Click");
      event.stopImmediatePropagation();
    });
    scoreButton.addEventListener("mouseup", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      scoreSheetUI.classList.toggle("scoreTable__hidden");
      displayScoreSheet();
    });

    swapButton.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      console.log("swap Click");
      event.stopImmediatePropagation();
    });
    playButton.addEventListener("mousedown", (event) => {
      if (event.button !== 0) {
        console.log(event.button )
        return;
      }
      console.log("play Click");
      event.stopImmediatePropagation();
    });
    playButton.addEventListener("mouseup", () =>{
      confirmTurn();
      displayRack();

    })

    return { widgetDiv, rackDiv };
  }

  function setupScoreSheet() {
    return addBasicElement("div", ["scoreSheet"]);
  }
  function setupBag() {
    return addBasicElement("div", ["bag-sheet"]);
  }

  function displayBag() {
    removeAllChildNodes(bagUI);
    let bagInfoDiv= addBasicElement("div", ["bag-info"], bagUI);
    let info = new Array(6).fill().map(() => new Array(6).fill(0))
    game.bag.tiles.forEach((tile)=>{
      info[tile.color][tile.shape]++
    })
    console.log(`inactive players amount: ${game.inactivePlayers.length}`)
    game.inactivePlayers.forEach((player)=>{
      player.rack.tiles.forEach((tile)=>{
        info[tile.color][tile.shape]++
      })
    })
    console.table(info)
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
         let tile = addTileElement(
          i,
          j,
          bagInfoDiv,
          "bag"
        );
       addBasicElement("div",["bag-text"],tile, info[i][j])
      }
      
    }
  }

  function displayScoreSheet() {
    removeAllChildNodes(scoreSheetUI);
    let scoreTableDiv = addBasicElement("div", ["scoreSheet__table"], scoreSheetUI);
    scoreTableDiv.style.gridTemplateColumns = "repeat(6,1fr)"; //`repeat(${players.playerCount*2}, 1fr)`
    game.scores.forEach((round) => {
      for (let i = 0; i < round.length; i++) {
        if ((scoreTableDiv, round[i] != undefined)) {
          addBasicElement("span", ["scoreSheet__cell"], scoreTableDiv, round[i]);
        }
      }
    });
    for (let i = 0; i < game.playerManager.playerCount; i++) {
      scoreTableDiv.children[i].classList.add("scoreSheet__header");
    }
  }

  function displayRack() {
    let rack = game.currentPlayer.rack;
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
    removeAllChildNodesByCssClass(boardUI, "tile");
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
        "board",
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

  function reverseEnum(e, value) {
    for (let k in e) if (e[k] == value) return k;
  }
}
