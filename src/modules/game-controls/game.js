import Players from "./players";
import Board from "../game-objects/board";
import Bag from "../game-objects/bag";
import { GameState } from "../enums/game-state.js";
import { Color } from "../enums/color.js";

export default function Game() {
  let state = GameState.PRE_GAME;
  let board = Board();
  let bag = Bag();
  bag.fill();
  let players = Players();
  let currentPlayer;

  //PRE_GAME
  function addPlayer({ PlayerType, name }) {
    checkGameState(GameState.PRE_GAME);
    players.addPlayer({ PlayerType, name });
  }

  function startGame() {
    checkGameState(GameState.PRE_GAME);
    if (players.playerCount < 2) {
      throw new Error("Cannot start a game with less than two players");
    }
    players.randomizePlayerOrder;
    players.forEach((player) => {
      player.rack.addTiles(bag.draw(player.rack.spaces.count));
    });
    let startWordLengths = [];
    players.forEach((player) => {
      startWordLengths.push(player.rack.longestWordLength);
    });
    players.setStartPlayer(
      startWordLengths.indexOf(Math.max(...startWordLengths))
    );
    currentPlayer = players.active;
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
    // puts current players rack into swapmode (need to implement)
  }

  function swapSelect(index) {
    // selects the tile at index for swapping 
  }

  function swapSelection() {
    // swaps all the selected tiles for new ones in the bag
  }


  function nextTurn() {
    checkGameState(GameState.PLAYER_TURN);
    players.nextPlayer;
    currentPlayer = players.active;
  }

  //GAME STATE
  function switchGameState(gameState) {
    state = gameState;
  }
  function checkGameState(gameState) {
    if (state == gameState) {
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
    addPlayer,
    startGame,
    nextTurn,
  };
}
