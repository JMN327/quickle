import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
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
  let tileSize = 100;
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
  game.playerManager.players.forEach((player) => {
    racks.push(player.rack);
  });
  displayRacks();

  function displayBoard() {
    let boardSizeW = game.board.bounds.hSize * tileSize;
    let boardSizeH = game.board.bounds.vSize * tileSize;
    let styles = boardDiv.style;
    styles.width = `${boardSizeW}px`;
    styles.height = `${boardSizeH}px`;
    console.log(zpw.viewWidth / 2 - boardSizeW / 2);
    styles.left = `${zpw.viewWidth / 2 - boardSizeW / 2}px`;
    styles.top = `${zpw.viewHeight / 2 - boardSizeH / 2}px`;
  }

  function displayPlacedAndFixedTiles() {
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
        pos[0] * tileSize,
        pos[1] * tileSize
      );
    });
  }

  function displayRacks() {
    racks.forEach((rack) => {
      let rackDiv = addBasicElement("div", ["rack"], body);
      Add_Component_Drag_Drop_Container(rackDiv, []);
      rackDiv.addEventListener("dragDrop", (event) => {
        console.log(
          `Switching item: ${event.detail.pickup} with item ${event.detail.swap}`
        );
        rack.rearrange(event.detail.pickup, event.detail.swap);
        
      });
      rackDiv.addEventListener("mouseup", (event) => {
        let item = event.target.closest(".grid-item");
        let selectedItemIndex = [...rackDiv.children].indexOf(item);
        console.log(`selected item ${selectedItemIndex}`);
      });
      rackDivs.push(rackDiv);
      rack.tiles.forEach((tile) => {
        let tileDiv = addTileElement(tile.color, tile.shape, rackDiv);
        Add_Component_Drag_Drop_Item(tileDiv);
      });
    });
  }


  /*   game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  console.log(game.currentPlayer.name);
  console.table(game.currentPlayer.rack.tiles);
  game.selectTileOnRack(1);
  console.table(game.playableTilesForSelection());
  game.placeSelectedTileOnBoard(0, 0); */

  displayBoard();
  displayPlacedAndFixedTiles();

  function setDivSize([div, h, w]) {
    if (h) {
      div.style.height = h + "px";
    }
    if (w) {
      div.style.width = w + "px";
    }
  }
}
