import {
  addBasicElement,
  addTileElement,
  removeAllChildNodes,
} from "../UI/DOM-elements";
import ZoomPanWindow from "../UI/ui-zoom-pan-window";
import GameManager from "./game-manager";
import { PlayerType } from "../enums/player-type";
import { CellState } from "../enums/cell-state";
import Add_Component_Drag_Drop_Container from "../UI/Component_Drag_Drop_List.js"

export default function screenManager() {
  let tileSize = 100;
  let body = document.querySelector("body");
  let frame = addBasicElement("div", ["zpw"], body);
  let frameH = 900;
  let frameW = 900;
  setDivSize([frame, frameH, frameW]);
  let zpw = ZoomPanWindow(frame);
  zpw.bounded = true;

  let rack = addBasicElement("div", ["rack"], body);
  let tile1 = addBasicElement("div", ["rTile", "grid-item"], rack);
  let tile2 = addBasicElement("div", ["rTile", "grid-item"], rack);
  let tile3 = addBasicElement("div", ["rTile", "grid-item"], rack);
  let tile4 = addBasicElement("div", ["rTile", "grid-item"], rack);
  let tile5 = addBasicElement("div", ["rTile", "grid-item"], rack);
  let tile6 = addBasicElement("div", ["rTile", "grid-item"], rack);

  Add_Component_Drag_Drop_Container(rack,[]);

  let boardDiv = addBasicElement("div", ["board"], body);
  zpw.appendChild(boardDiv);

  let game = GameManager();

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

  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Elspeth" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Jinny" });
  game.addPlayer({ PlayerType: PlayerType.HUMAN, name: "Rose" });
  game.startGame();
  console.log(game.currentPlayer.name);
  console.table(game.currentPlayer.rack.tiles);
  game.selectTileOnRack(1);
  console.table(game.playableTilesForSelection());
  game.placeSelectedTileOnBoard(0, 0);

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
