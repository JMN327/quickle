import {
  addBasicElement,
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
  let gridSizePX = 100;
  let body = document.querySelector("body");
  let frame = addBasicElement("div", ["zpw"], body);
  let frameH = 900;
  let frameW = 900;
  setDivSize([frame, frameH, frameW]);
  let zpw = ZoomPanWindow(frame);
  zpw.bounded = true;

  let boardDiv = addBasicElement("div", ["board"], body);
  zpw.appendChild(boardDiv);

  let game = GameManager();

  // make setup function
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  let racks = [];
  let rackDivs = [];
  
  setupRacks();

  function displayBoard() {
    let boardSizeW = game.board.bounds.hSize * gridSizePX;
    let boardSizeH = game.board.bounds.vSize * gridSizePX;
    let styles = boardDiv.style;
    styles.width = `${boardSizeW}px`;
    styles.height = `${boardSizeH}px`;
    console.log(zpw.viewWidth / 2 - boardSizeW / 2);
    styles.left = `${zpw.viewWidth / 2 - boardSizeW / 2}px`;
    styles.top = `${zpw.viewHeight / 2 - boardSizeH / 2}px`;
  }

  function displayPlacedAndFixedTilesOnBoard() {
    removeAllChildNodesByCssClass(boardDiv,"svg-tile")
    let tilePositionsOnBoard = [
      ...game.board.positionsByCellState(CellState.PLACED),
      ...game.board.positionsByCellState(CellState.FIXED),
    ];
    console.log(tilePositionsOnBoard);
    tilePositionsOnBoard.forEach((pos) => {
      let tile = game.board.cells[pos[0]][pos[1]].tile;
      console.log(game.board.cells[pos[0]][pos[1]].tile);
      addTileElement(
        tile.color,
        tile.shape,
        boardDiv,
        pos[0] * gridSizePX,
        pos[1] * gridSizePX
      );
    });
  }

  function displayValidEmptySpacesOnBoardForSelectedTile() {
    console.log(`VALID SPACES FOR SELECTED TILE:`)
    console.table(game.playableTilesForSelection())
    removeAllChildNodesByCssClass(boardDiv,"valid-space")
    game.playableTilesForSelection().forEach((pos)=>{
      console.log(pos)
      addValidSpaceElement(
        boardDiv,
        pos[0] * gridSizePX,
        pos[1] * gridSizePX
      );
    })
  }
  function removeValidEmptySpacesOnBoardForSelectedTile() {
    removeAllChildNodesByCssClass(boardDiv,"valid-space")
  }


  function setupRacks() {
    game.playerManager.players.forEach((player) => {
      racks.push(player.rack);
    });
    racks.forEach((rack) => {
      let rackDiv = addBasicElement("div", ["rack"], body);
      Add_Component_Drag_Drop_Container(rackDiv, []);
      rackDiv.addEventListener("dragDrop", (event) => {
        console.log(
          `Switching item: ${event.detail.pickup} with item ${event.detail.swap}`
        );
        //rackDiv.querySelector(".selected")?.classList.remove("selected")
        //rack.deselectAll()
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
          Array.from(rackDiv.children).forEach((child) =>child.classList.remove("not-selected"))
          rackDiv.querySelector(".selected")?.classList.remove("selected");
          rack.deselectSingle(selectedItemIndex);
          removeValidEmptySpacesOnBoardForSelectedTile()
          return;
        }
        rack.selectSingle(selectedItemIndex);
        Array.from(rackDiv.children).forEach((child) =>child.classList.add("not-selected"))
        rackDiv.querySelector(".selected")?.classList.remove("selected");
        item.classList.add("selected");
        item.classList.remove("not-selected");
        displayValidEmptySpacesOnBoardForSelectedTile()
      });
      rackDivs.push(rackDiv);
      rack.tiles.forEach((tile) => {
        let tileDiv = addTileElement(tile.color, tile.shape, rackDiv);
        Add_Component_Drag_Drop_Item(tileDiv);
      });
    });
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
