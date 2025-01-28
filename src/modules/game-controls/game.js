import PlayerManager from "./player-manager.js";
import Board from "../game-objects/board";
import Bag from "../game-objects/bag";
import { GameState } from "../enums/game-state.js";
import { Color } from "../enums/color.js";

export default function Game() {
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
      player.rack.addTiles(bag.draw(player.rack.spaces.count));
    });
    let startWordLengths = [];
    pm.players.forEach((player) => {
      startWordLengths.push(player.rack.longestWordLength());
    });
    console.log(startWordLengths.indexOf(Math.max(...startWordLengths)));
    pm.setStartPlayer(startWordLengths.indexOf(Math.max(...startWordLengths)));
    currentPlayer = pm.active;
    switchGameState(GameState.PLAYER_TURN);
  }

  //PLAYING

  function selectTile(index) {
    //xSelects the tile at the given index on the players rack
    function validTilesForSelection() {
      //shows the valid tiles for the selected tiles
    }
  }

  function placeTileOnBoard(row, col) {
    //places the selected tile on the board
  }

  function confirmTurn() {
    // fixes placed tiles and updates scores
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
  };
}
