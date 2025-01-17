export default function Board() {
  const rows = 3;
  const columns = 3;
  const board = [];

  //populate board array with Cell objects
  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
    console.log("board initialized");
  };

  const getBoard = () => board;

  const markBoard = (row, column, playerMark) => {
    let currentValue = board[row][column].getValue();
    console.log(currentValue);
    if (currentValue !== "") {
      return false;
    }
    board[row][column].mark(playerMark);
    return true;
  };

  resetBoard();

  return { getBoard, markBoard, resetBoard };
}
