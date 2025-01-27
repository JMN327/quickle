import { PlayerType } from "../enums/player-type";
import { Player } from "../game-objects/player";

export default function Players(humanCount, botCount) {
  if (humanCount > 4 || humanCount < 2) {
    throw new Error("the count of human players is not valid");
  }
  if (humanCount + botCount > 4) {
    throw new Error("the count of human and bot players is not valid");
  }
  let players = [];
  for (let index = 0; index < humanCount; index++) {
    players.push(Player(PlayerType.HUMAN));
  }
  for (let index = 0; index < botCount; index++) {
    players.push(Player(PlayerType.BOT));
  }
  randomizePlayerOrder();

  let activePlayerIndex = 0;
  function switchTurn() {
    activePlayerIndex = (activePlayerIndex + 1) % 4;
  }

  function randomizePlayerOrder() {
    let m = players.length;
    let t;
    let i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = players[m];
      players[m] = players[i];
      players[i] = t;
    }
  }

  return {
    get players() {
      return players;
    },
    get active() {
      return players[activePlayerIndex];
    },
    switchTurn,
  };
}
