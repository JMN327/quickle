import { PlayerType } from "../enums/player-type";
import Rack from "./rack";

export default function Player(playerType = PlayerType.HUMAN, name = "Human") {
  // MOST OF THIS TO BE MOVED TO PLAYER MANAGER CONTROLLER

  // player handles the movement of tiles and owns a score sheet

  // tile moving to board validity check functions to be handled
  // here and removed from board.  BUT board needs to transmit
  // validity for a given tile based on currently placed tiles
  // - so another board function needed

  let rack = Rack();

  let score = {
    turnScores: [],
    accumulatedScores: [],
    add: (newScore) => {
      turnScores.push(newScore);
      accumulatedScores.push(newScore + turnScores[turnScores.length - 1]);
    },
    reset: () => {
      turnScores = []
      accumulatedScores = []
    }
  };

  if (playerType == PlayerType.BOT) {
    // do bot stuff
  }

  return {
    get rack() {
      return rack;
    },
    get score() {
      return score;
    },
    get playerType() {
      return playerType;
    },
    get name() {
      return name;
    },
    set name(newName) {
      name = newName;
    },
  };
}
