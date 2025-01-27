import PlayerManager from "./player-manager.js";
import Board from "../game-objects/board.js";
import Bag from "../game-objects/bag.js";
import { GameState } from "../enums/game-state.js";
import { Color } from "../enums/color.js";
import { CellState } from "../enums/cell-state.js";

export default function GameManager() {
  let state = GameState.PRE_GAME;
  let board = Board();
  let bag = Bag();
  bag.fill();
  bag.shuffle();
  let pm = PlayerManager();
  let currentPlayer;

  //PRE_GAME
  function addPlayer({ PlayerType, name }) {
    checkGameState(GameState.PRE_GAME);
    pm.addPlayer({ PlayerType, name });
  }

  function startGame() {
    checkGameState(GameState.PRE_GAME);
    if (pm.playerCount < 2) {
      throw new Error("Cannot start a game with less than two players");
    }
    pm.randomizePlayerOrder();
    pm.players.forEach((player) => {
      player.rack.drawTiles(bag.draw(player.rack.spaces.count));
    });
    let startWordLengths = [];
    pm.players.forEach((player) => {
      startWordLengths.push(player.rack.longestWordLength());
    });
    console.log(startWordLengths.indexOf(Math.max(...startWordLengths)));
    pm.setStartPlayer(startWordLengths.indexOf(Math.max(...startWordLengths)));
    currentPlayer = pm.active;
    switchGameState(GameState.PLAYING);
  }

  //PLAYING

  function selectTileOnRack(index) {
    currentPlayer.rack.selectSingle(index);
  }
  function rearrangeTilesOnRack(playerIndex, from, to) {
    pm.players[playerIndex].rack.rearrangeTiles(from, to);
  }

  function playableTilesForSelection() {
    console.log(currentPlayer.rack.selection)
    let tile = currentPlayer.rack.selection
    return board.playableCells(tile) ;
  }

  function placeSelectedTileOnBoard(row, col) {
    board.addTile(currentPlayer.rack.pickUpSelection(), row, col);
    //places the selected tile on the board
  }

  function confirmTurn() {
    if (board.cellsByCellState(CellState.PLACED).length < 1) {
      throw new Error("cannot confirm turn while no cells have been placed");
    }
    let score = board.score;
    board.fixTiles;
    currentPlayer.score.add(score);
    currentPlayer = pm.nextPlayer;
  }

  // SWAP_MODE

  function toggleSwapMode() {
    // puts current players rack into swapMode (need to implement)
  }

  function swapSelect(index) {
    // selects the tile at index for swapping
  }

  function swapSelection() {
    // swaps all the selected tiles for new ones in the bag
  }

  function nextTurn() {
    checkGameState(GameState.PLAYER_TURN);
    pm.nextPlayer;
    currentPlayer = pm.active;
  }

  //GAME STATE
  function switchGameState(gameState) {
    state = gameState;
  }
  function checkGameState(gameState) {
    if (state != gameState) {
      throw new Error(
        `The game is not in the right game state.  Checked state: ${gameState}  Current state: ${state}`
      );
    }
  }
  return {
    get bag() {
      return bag;
    },
    get board() {
      return board;
    },
    get currentPlayer() {
      return currentPlayer;
    },
    addPlayer,
    startGame,
    nextTurn,
    selectTileOnRack,
    rearrangeTilesOnRack,
    playableTilesForSelection,
    placeSelectedTileOnBoard,
  };
}
