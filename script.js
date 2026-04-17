const gameBoard = (() => {
  const columns = 3;
  const rows = 3;
  let board;

  const build = () => {
    board = [];
    for (let column = 0; column < columns; column++) {
      board[column] = [];
      for (let row = 0; row < rows; row++) {
        board[column].push(Cell());
      }
    }
  }

  const update = (posX, posY, token) => {
    if (board[posX][posY].getValue() === "") {
      board[posX][posY].setValue(token);
      return true;
    }
    return false;
  }

  const getBoard = () => {
    const boardValues = [];
    for (let column = 0; column < columns; column++) {
      boardValues[column] = [];
      for (let row = 0; row < rows; row++) {
        let cellValue = "";
        if (board) {
          cellValue = board[column][row].getValue();
        }
        boardValues[column].push(cellValue);
      }
    }
    return boardValues;
  }

  const checkWin = () => {
    const boardValues = gameBoard.getBoard();

    //Horizontal and vertical three-in-a-row checks
    for (let i = 0; i < 3; i++) {
      if (
        boardValues[i][0] &&
        boardValues[i][0] === boardValues[i][1] &&
        boardValues[i][0] === boardValues[i][2]
      ) {
        return boardValues[i][0];
      }
      if (
        boardValues[0][i] &&
        boardValues[0][i] === boardValues[1][i] &&
        boardValues[0][i] === boardValues[2][i]
      ) {
        return boardValues[0][i];
      }
    }

    //Diagonal checks
    if (boardValues[1][1]) {
      if (
        boardValues[1][1] === boardValues[0][0] &&
        boardValues[1][1] === boardValues[2][2]
      ) {
        return boardValues[1][1];
      }
      if (
        boardValues[1][1] === boardValues[2][0] &&
        boardValues[1][1] === boardValues[0][2]
      ) {
        return boardValues[1][1];
      }
    }

    return false;
  }

  const checkTie = () => {
    if (checkWin()) {
      return false;
    }
    const boardValuesReduced = gameBoard.getBoard().reduce((a, b) => a.concat(b));
    for (const value of boardValuesReduced) {
      if (!value) {
        return false;
      }
    }
    return true;
  }

  return { build, update, getBoard, checkWin, checkTie };
})();

const Cell = () => {
  let value = "";

  const getValue = () => {
    return value;
  }

  const setValue = (token) => {
    value = token;
  }

  return { getValue, setValue }
};

const Player = (id, token) => {
  let name = `Player ${id}`;
  let color;

  const getName = () => {
    return name;
  }

  const setName = (newName) => {
    name = newName;
  }

  const getColor = () => {
    return color;
  }

  const setColor = (hex) => {
    color = hex;
  }

  return { id, token, getName, setName, getColor, setColor };
};

const gameController = (() => {
  const player = [
    Player(1, "X"),
    Player(2, "O")
  ];

  let activePlayer;

  const switchPlayer = () => {
    activePlayer = activePlayer === player[0] ? player[1] : player[0];
  }

  const setPlayerName = (playerId, newName) => {
    player[playerId - 1].setName(newName);
  }

  const getPlayerColor = (playerId) => {
    return player[playerId - 1].getColor();
  }

  const setPlayerColor = (playerId, newColor) => {
    player[playerId - 1].setColor(newColor);
  }

  /**
   * gameState: 0 (paused) | 1 (in progress)
   */
  let gameState = 0;
  /**
   * status: 'turn' | 'occupied' | 'win' | 'tie'
   */
  let status;

  const playRound = (posX, posY) => {
    if (!gameState) {
      buildGame();
    } else if (!gameBoard.update(posX, posY, activePlayer.token)) {
      status = 'occupied';
    } else {
      if (gameBoard.checkWin()) {
        gameState = 0;
        status = 'win';
      } else if (gameBoard.checkTie()) {
        gameState = 0;
        status = 'tie';
      } else {
        switchPlayer();
        status = 'turn';
      }
    }
  }

  const getStatus = () => {
    const playerName = activePlayer.getName();
    const playerToken = activePlayer.token;
    switch (status) {
      case 'turn':
        return `${playerName}'s (${playerToken}) turn.`;
      case 'occupied':
        return `Invalid move. Space occupied. ${playerName}'s (${playerToken}) turn.`;
      case 'win':
        return `${playerName} won! Press anywhere to start the next round.`;
      case 'tie':
        return `Game tied! Press anywhere to start the next round.`;
    }
  }

  const getBoard = () => {
    board = gameBoard.getBoard();
    return board;
  }

  const buildGame = () => {
    gameBoard.build();
    gameState = 1;
    activePlayer = player[0];
    status = 'turn';
  }

  return { playRound, getBoard, getStatus, setPlayerName, getPlayerColor, setPlayerColor }
})();

const displayController = (() => {
  console.log(gameController.getBoard());
})();