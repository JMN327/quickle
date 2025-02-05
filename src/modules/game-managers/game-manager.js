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
  let gameCounter = _gameCounter();
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
    playerManager.setStartPlayer(
      startWordLengths.indexOf(Math.max(...startWordLengths))
    );
    currentPlayer = playerManager.active;
    console.log(`GAME STARTED  Start player is ${currentPlayer.name}`);
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
    console.log(currentPlayer.rack.selection);
    let tile = currentPlayer.rack.selection;
    if (tile == undefined) {
      return;
    }
    return board.playableCells(tile);
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
    board.fixTiles();
    currentPlayer.score.add(score);
    currentPlayer.rack.drawTiles(bag.draw(currentPlayer.rack.spaces.count));
    playerManager.changeActivePlayer();
    currentPlayer = playerManager.active;
    console.table(scores.rounds());
    gameCounter.incrementTurn();
    console.log(`CurrentPlayer ${currentPlayer.name}`);
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

  function _gameCounter() {
    let turnNumber = 1;
    function incrementTurn() {
      turnNumber++;
    }
    function reset() {
      turnNumber = 1;
    }
    function roundNumber() {
      return (
        Math.ceil(turnNumber / playerManager.playerCount)
      );
    }

    return {
      get turnNumber() {
        return turnNumber;
      },
      get roundNumber() {
        return roundNumber();
      },
      incrementTurn,
      reset,
    };
  }

  //score sheet
  function scores() {
    let names =[]
    let headers = [];
    let rounds = [];

    playerManager.players.forEach((player) => {
      names.push(player.name)
      names.push(null)
      headers.push("score");
      headers.push("total");
    });

    rounds.push(names);
    rounds.push(headers);
    console.log(gameCounter.roundNumber);
    for (let i = 0; i < gameCounter.roundNumber; i++) {
      let round = [];
      playerManager.players.forEach((player) => {
        round.push(player.score.turnScores[i] || null);
        round.push(player.score.accumulatedScores[i] || null);
      });
      rounds.push(round);
    }
    return {rounds}
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
      return playerManager;
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
      return state;
    },
    get scores() {
      return scores()
    },
    addPlayer,
    startGame,
    confirmTurn,
    selectTileOnRack,
    rearrangeTilesOnRack,
    playableTilesForSelection,
    placeSelectedTileOnBoard,
  };
}
