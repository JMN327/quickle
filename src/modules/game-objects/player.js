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
      score.turnScores.push(newScore);
      score.accumulatedScores.push(
        newScore + (score.accumulatedScores[score.accumulatedScores.length - 1] || 0)
      );
      console.log(score.turnScores[score.turnScores.length - 2]);
      console.table(score.turnScores);
      console.table(score.accumulatedScores);
    },
    reset: () => {
      turnScores = [];
      accumulatedScores = [];
    },
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
