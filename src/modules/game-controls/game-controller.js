function GameController() {
    let players = Player();
    let winLine = {};
    const board = Gameboard();
    const turnCounter = TurnCounter();
    let gameActiveState = false;

    const checkForWin = () => {
        const checkLines = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ];
    
        const flatBoard = board
          .getBoard()
          .map((row) => row.map((cell) => cell.getValue()))
          .flat(1);
        for (const checkLine of checkLines) {
          const a = flatBoard[checkLine[0]];
          const b = flatBoard[checkLine[1]];
          const c = flatBoard[checkLine[2]];
          const match = a === b && b === c && c != "";
          if (match) {
            return { gameWon: true, start: checkLine[0], end: checkLine[2] };
          }
        }
        return { gameWon: false };
      };
    
      const setWinLine = (start, end) => {
        winLine = { start, end };
      };
    
      const toggleGameActiveState = () => {
        gameActiveState ? (gameActiveState = false) : (gameActiveState = true);
      };
    
      const getGameActiveState = () => gameActiveState;
    
      const getWinLine = () => winLine;
    
      const resetGame = () => {
        winLine = {};
        turnCounter.reset();
        board.resetBoard();
        players.switchStartPlayer();
    
        console.log(players.getActivePlayer().name);
        Info.setInfo(`Game begins! ${players.getActivePlayer().name}'s turn...`);
      };
    
      const playRound = (row, column) => {
        console.log("playing round");
        const validMove = board.markBoard(
          row,
          column,
          players.getActivePlayer().mark
        );
        if (!validMove) {
          return;
        }
        winCheck = checkForWin();
        if (winCheck.gameWon) {
          Info.setInfo(`A win! 1 point to ${players.getActivePlayer().name}!`);
          setWinLine(winCheck.start, winCheck.end);
          players.incrementScores(players.getActivePlayer().index);
          console.log(players.getPlayers()[0].score, players.getPlayers()[1].score);
          toggleGameActiveState();
          return;
        }
        if (turnCounter.turn() === 9) {
          Info.setInfo("Draw game!");
          console.log("Draw!");
          toggleGameActiveState();
          return;
        }
        // Initialize next round
        turnCounter.increment();
        console.log(`Turn Number ${turnCounter.turn()}`);
        players.switchPlayerTurn();
        Info.setInfo(`${players.getActivePlayer().name}'s turn...`);
      };
    
      // Initial play game message
    
      return {
        setPlayerNames: players.setPlayerNames,
        setPlayerMarks: players.setPlayerMarks,
        incrementScores: players.incrementScores,
        resetScores: players.resetScores,
        getPlayers: players.getPlayers,
        playRound,
        getBoard: board.getBoard,
        getWinLine,
        resetGame,
        toggleGameActiveState,
        getGameActiveState,
      };
}