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
  let playerManager = PlayerManager();
  let currentPlayer;

  //PRE_GAME
  function addPlayer({ PlayerType, name }) {
    checkGameState(GameState.PRE_GAME);
    playerManager.addPlayer({ PlayerType, name });
  }

  function startGame() {
    checkGameState(GameState.PRE_GAME);
    if (playerManager.playerCount < 2) {
      throw new Error("Cannot start a game with less than two players");
    }
    playerManager.randomizePlayerOrder();
    playerManager.players.forEach((player) => {
      player.rack.drawTiles(bag.draw(player.rack.spaces.count));
    });
    let startWordLengths = [];
    playerManager.players.forEach((player) => {
      startWordLengths.push(player.rack.longestWordLength());
    });
    console.log(startWordLengths.indexOf(Math.max(...startWordLengths)));
    playerManager.setStartPlayer(startWordLengths.indexOf(Math.max(...startWordLengths)));
    currentPlayer = playerManager.active;
    switchGameState(GameState.PLAYING);
  }

  //PLAYING

  function selectTileOnRack(index) {
    currentPlayer.rack.selectSingle(index);
  }
  function rearrangeTilesOnRack(playerIndex, from, to) {
    playerManager.players[playerIndex].rack.rearrangeTiles(from, to);
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
    currentPlayer = playerManager.nextPlayer;
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
    playerManager.nextPlayer;
    currentPlayer = playerManager.active;
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
    get playerManager() {
      return playerManager
    },
    get bag() {
      return bag;
    },
    get board() {
      return board;
    },
    get currentPlayer() {
      return currentPlayer;
    },
    get state() {
      return state
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
