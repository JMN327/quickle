export default function Player() {

  // MOST OF THIS TO BE MOVED TO PLAYER MANAGER CONTROLLER

  // player handles the movement of tiles and owns a score sheet

  // tile moving to board validity check functions to be handled
  // here and removed from board.  BUT board needs to transmit
  // validity for a given tile based on currently placed tiles
  // - so another board function needed

    let players = [
      {
        name: "Player One",
        rack: [],
        score: 0,
        index: 0,
      },
      {
        name: "Player Two",
        rack: [],
        score: 0,
        index: 1,
      },
    ];

    let startPlayer = Math.round(Math.random());
    let activePlayer = players[startPlayer];

    const switchStartPlayer = () => {
      startPlayer = startPlayer === players[0] ? players[1] : players[0];
      activePlayer = startPlayer;
    };

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const setPlayerNames = (playerOneName = "Player One" , playerTwoName = "Player Two" ) => {
      players[0].name = playerOneName 
      players[1].name = playerTwoName
    };
    const setPlayerMarks = (playerOneMark, playerTwoMark) => {
      players[0].mark = playerOneMark;
      players[1].mark = playerTwoMark;
    };
    const incrementScores = (playerIndex) => {
      players[playerIndex].score++;
    };
    const resetScores = () => {
      players[0].score = 0;
      players[1].score = 0;
    };
    const getPlayers = () => players;

    return {

    };
  }