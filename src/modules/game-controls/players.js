import Player from "../game-objects/player.js";

export default function Players() {
  let activePlayerIndex = 0;
  let players = [];

  function addPlayer({ PlayerType, name }) {
    if (players.length == 4) {
      throw new Error("There are already 4 players at this table");
            
    }
    players.push(Player(PlayerType, name));
  }

  function nextPlayer() {
    if (!activePlayerIndex) {
      throw new Error(
        "Turn cannot be switch as the active player has not been defined"
      );
    }
    activePlayerIndex = (activePlayerIndex + 1) % players.length;
  }

  let p = Player()
  p.rack.longestWordLength


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

  function setStartPlayer(index) {
    activePlayerIndex = index
  }

  return {
    get active() {
      return players[activePlayerIndex] || null;
    },
    get playerCount() {
      return players.length
    },
    addPlayer,
    randomizePlayerOrder,
    nextPlayer,
    setStartPlayer,
  };
}
