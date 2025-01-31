import {
  addBasicElement,
  addNullRackTile,
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
import Rack from "../game-objects/rack.js";

export default function screenManager() {
  let gridSizePx = 100;
  let containerDiv = document.querySelector("body");

  //module scoped variables
  let game = GameManager(); // maybe player details and start game
  let players = []; // setup players
  let playerDivs = []; // setup player spaces
  let board = game.board;
  let boardDiv = addBasicElement("div", ["board"], containerDiv); //setup board
  let racks = []; // = setup racks
  let rackDivs = []; // = setup rackDivs

  //setup zpw
  let frame = addBasicElement("div", ["zpw"], containerDiv);
  let frameH = 900;
  let frameW = 900;
  setDivSize([frame, frameH, frameW]);
  let zpw = ZoomPanWindow(frame);
  zpw.bounded = true;

  zpw.appendChild(boardDiv);

  // setup Game
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  setupRacks();
  setupBoard();

  function setupBoard() {
    boardDiv.addEventListener("mouseup", (event) => {
      let gridPos = [
        Math.floor(
          (event.clientY - boardDiv.getBoundingClientRect().top) / gridSizePx
        ),
        Math.floor(
          (event.clientX - boardDiv.getBoundingClientRect().left) / gridSizePx
        ),
      ];
      console.log(gridPos);
      game.placeSelectedTileOnBoard(gridPos[0], gridPos[1]);
      displayBoard();
      displayPlacedAndFixedTilesOnBoard();
      displayRacks();
      displayPlayableTilesForSelection();
    });
  }

  function setupRacks() {
    game.playerManager.players.forEach((player) => {
      racks.push(player.rack);
    });
    racks.forEach((rack) => {
      let rackDiv = addBasicElement("div", ["rack"], containerDiv);
      Add_Component_Drag_Drop_Container(rackDiv, []);
      rackDiv.addEventListener("dragDrop", (event) => {
        console.log(
          `Switching item: ${event.detail.pickup} with item ${event.detail.swap}`
        );
        rack.rearrange(event.detail.pickup, event.detail.swap);
      });
      rackDiv.addEventListener("mouseup", (event) => {
        let item = event.target.closest(".grid-item");
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
      rackDivs.push(rackDiv);
    });
    displayRacks();
  }

  function displayBoard() {
    let boardSizeW = board.bounds.hSize * gridSizePx;
    let boardSizeH = board.bounds.vSize * gridSizePx;
    let leftOffset = board.bounds.left * gridSizePx;
    let topOffset = board.bounds.top * gridSizePx;
    let styles = boardDiv.style;
    styles.width = `${boardSizeW}px`;
    styles.height = `${boardSizeH}px`;
    let centre = [zpw.viewWidth / 2, zpw.viewHeight / 2];
    console.log(zpw.viewWidth / 2 - boardSizeW / 2);
    styles.left = `${zpw.viewWidth / 2 + leftOffset - gridSizePx / 2}px`;
    styles.top = `${zpw.viewHeight / 2 + topOffset - gridSizePx / 2}px`;
  }

  function displayRacks() {
    for (let i = 0; i < rackDivs.length; i++) {
      removeAllChildNodes(rackDivs[i]);
      racks[i].tiles.forEach((tile) => {
        let tileDiv;
        if (tile == null) {
          tileDiv = addNullRackTile(rackDivs[i]);
        } else {
          tileDiv = addTileElement(tile.color, tile.shape, rackDivs[i]);
        }
        Add_Component_Drag_Drop_Item(tileDiv);
      });
    }
  }

  function displayPlacedAndFixedTilesOnBoard() {
    removeAllChildNodesByCssClass(boardDiv, "svg-tile");
    let tilePositionsOnBoard = [
      ...board.positionsByCellState(CellState.PLACED),
      ...board.positionsByCellState(CellState.FIXED),
    ];
    console.log(tilePositionsOnBoard);
    tilePositionsOnBoard.forEach((pos) => {
      let tile = board.cells[pos[0]][pos[1]].tile;
      console.log(board.cells[pos[0]][pos[1]].tile);
      addTileElement(
        tile.color,
        tile.shape,
        boardDiv,
        pos[0] * gridSizePx,
        pos[1] * gridSizePx
      );
    });
  }

  function displayPlayableTilesForSelection() {
    console.log(`VALID SPACES FOR SELECTED TILE:`);
    console.table(game.playableTilesForSelection());
    removeAllChildNodesByCssClass(boardDiv, "valid-space");
    game.playableTilesForSelection()?.forEach((pos) => {
      console.log(pos);
      addValidSpaceElement(boardDiv, pos[0] * gridSizePx, pos[1] * gridSizePx);
    });
  }
  function removeValidEmptySpacesOnBoardForSelectedTile() {
    removeAllChildNodesByCssClass(boardDiv, "valid-space");
  }

  /*   console.log(game.currentPlayer.name);
    console.table(game.currentPlayer.rack.tiles);
    game.selectTileOnRack(1);
    console.table(game.playableTilesForSelection());
    game.placeSelectedTileOnBoard(0, 0); */

  displayBoard();
  displayPlacedAndFixedTilesOnBoard();

  function setDivSize([div, h, w]) {
    if (h) {
      div.style.height = h + "px";
    }
    if (w) {
      div.style.width = w + "px";
    }
  }
}
