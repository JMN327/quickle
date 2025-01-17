export default function Player() {

  // MOST OF THIS TO ME MOVED TO PLAYER MANAGER CONTROLLER

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