class GameBoard {
  #columns = 3;
  #rows = 3;
  #board;

  build = () => {
    this.#board = [];
    for (let column = 0; column < this.#columns; column++) {
      this.#board[column] = [];
      for (let row = 0; row < this.#rows; row++) {
        this.#board[column].push(new Cell());
      }
    }
  }

  update = (posX, posY, token) => {
    if (this.#board[posX][posY].getValue() === "") {
      this.#board[posX][posY].setValue(token);
      return true;
    }
    return false;
  }

  getBoard = () => {
    const boardValues = [];
    for (let column = 0; column < this.#columns; column++) {
      boardValues[column] = [];
      for (let row = 0; row < this.#rows; row++) {
        let cellValue = "";
        if (this.#board) {
          cellValue = this.#board[column][row].getValue();
        }
        boardValues[column].push(cellValue);
      }
    }
    return boardValues;
  }

  checkWin = () => {
    const boardValues = this.getBoard();

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

  checkTie = () => {
    if (this.checkWin()) {
      return false;
    }
    const boardValuesReduced = this.getBoard().reduce((a, b) => a.concat(b));
    for (const value of boardValuesReduced) {
      if (!value) {
        return false;
      }
    }
    return true;
  }
}

class Cell {
  #value = "";
  getValue = () => {
    return this.#value;
  }
  setValue = (token) => {
    this.#value = token;
  }
}

class Player {
  #name;
  #score = 0;
  #color;
  id;
  token;

  constructor(id, token) {
    this.id = id;
    this.token = token;
    this.#name = `Player ${id}`;
  }

  getName = () => {
    return this.#name;
  }

  setName = (newName) => {
    this.#name = newName;
  }

  getScore = () => {
    return this.#score;
  }

  incrementScore = () => {
    this.#score++;
  }

  resetScore = () => {
    this.#score = 0;
  }

  getColor = () => {
    return this.#color;
  }

  setColor = (hex) => {
    this.#color = hex;
  }
};

const gameBoard = new GameBoard();

class GameController {
  #players = [
    new Player(1, "X"),
    new Player(2, "O")
  ];

  #activePlayer;

  switchPlayer = () => {
    this.#activePlayer = this.#activePlayer === this.#players[0] ? this.#players[1] : this.#players[0];
  }

  getPlayerName = (playerId) => {
    return this.#players[playerId - 1].getName();
  }

  setPlayerName = (playerId, newName) => {
    this.#players[playerId - 1].setName(newName);
  }

  getPlayerScore = (playerId) => {
    return this.#players[playerId - 1].getScore();
  }

  getPlayerColor = (playerId) => {
    return this.#players[playerId - 1].getColor();
  }

  setPlayerColor = (playerId, newColor) => {
    this.#players[playerId - 1].setColor(newColor);
  }

  /**
   * gameState: 0 (paused) | 1 (in progress)
   */
  #gameState = 0;
  /**
   * status: 'turn' | 'occupied' | 'win' | 'tie'
   */
  #status;

  playRound = (posX, posY) => {
    if (!this.#gameState) {
      this.#buildGame();
    } else if (!gameBoard.update(posX, posY, this.#activePlayer.token)) {
      this.#status = 'occupied';
    } else {
      if (gameBoard.checkWin()) {
        this.#gameState = 0;
        this.#status = 'win';
        for (const player in this.#players) {
          if (this.#players[player].token === gameBoard.checkWin()) {
            this.#players[player].incrementScore();
          }
        }
      } else if (gameBoard.checkTie()) {
        this.#gameState = 0;
        this.#status = 'tie';
      } else {
        this.switchPlayer();
        this.#status = 'turn';
      }
    }
  }

  getStatus = () => {
    if (!this.#status) {
      return "Press Start to start game.";
    }
    const playerName = this.#activePlayer.getName();
    const playerToken = this.#activePlayer.token;
    switch (this.#status) {
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

  getBoard = () => {
    const board = gameBoard.getBoard();
    return board;
  }

  #buildGame = () => {
    gameBoard.build();
    this.#gameState = 1;
    this.#activePlayer = this.#players[0];
    this.#status = 'turn';
  }

  resetGame = () => {
    for (const player in this.#players) {
      this.#players[player].resetScore();
    }
    gameBoard.build();
    this.#gameState = 0;
    this.#status = null;
  }
};

const gameController = new GameController();

class DisplayController {
  #boardDisplay = document.querySelector("div#board");
  #statusDisplay = document.querySelector("div#status");
  #playerOneScore = document.querySelector("p#player-one-score");
  #playerTwoScore = document.querySelector("p#player-two-score");

  buildDisplay = () => {
    this.#boardDisplay.innerHTML = "";
    const board = gameController.getBoard();
    for (let row = 0; row < board.length; row++) {
      for (let column = 0; column < board[row].length; column++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.column = column;
        cell.dataset.row = row;
        cell.addEventListener("click", this.#clickCell);
        this.#boardDisplay.appendChild(cell);
      }
    }

    const status = gameController.getStatus();
    this.#statusDisplay.textContent = status;
    this.#playerOneScore.textContent = gameController.getPlayerScore(1);
    this.#playerTwoScore.textContent = gameController.getPlayerScore(2);
  }

  #updateDisplay = () => {
    const board = gameController.getBoard();
    const cells = document.querySelectorAll('div.cell');
    for (const cell of cells) {
      const column = cell.dataset.column;
      const row = cell.dataset.row;
      cell.textContent = board[column][row];
    }

    const status = gameController.getStatus();
    this.#statusDisplay.textContent = status;
    this.#playerOneScore.textContent = gameController.getPlayerScore(1);
    this.#playerTwoScore.textContent = gameController.getPlayerScore(2);
  }

  #clickCell = (event) => {
    if (!this.#gameStarted) {
      return;
    }
    const posX = event.target.dataset.column;
    const posY = event.target.dataset.row;
    gameController.playRound(posX, posY);
    this.#updateDisplay();
  }

  #gameStarted;

  flipStart = () => {
    this.#gameStarted = !this.#gameStarted;
    if (this.#gameStarted) {
      gameController.playRound(0, 0);
    }
    this.#boardDisplay.classList.toggle('disabled');
  }
}

class InputController {
  #playerOneInput = document.querySelector('input#player-one');
  #playerTwoInput = document.querySelector('input#player-two');
  #startRestart = document.querySelector('button#start-restart');
  #playerOneName = document.querySelector("p#player-one-name");
  #playerTwoName = document.querySelector("p#player-two-name");

  #content = ['Start', 'Restart'];

  doTheThing() {
    this.#startRestart.addEventListener("click", this.#clickStartRestart);
  }

  #clickStartRestart = () => {
    if (!this.#playerOneInput.disabled && this.#playerOneInput.value) {
      gameController.setPlayerName(1, (this.#playerOneInput.value));
      this.#playerOneName.textContent = gameController.getPlayerName(1);
    } else if (!this.#playerOneInput.value) {
      gameController.setPlayerName(1, `Player 1`);
      this.#playerOneName.textContent = `Player 1`;
    }
    if (!this.#playerTwoInput.disabled && this.#playerTwoInput.value) {
      gameController.setPlayerName(2, (this.#playerTwoInput.value));
      this.#playerTwoName.textContent = gameController.getPlayerName(2);
    } else if (!this.#playerTwoInput.value) {
      gameController.setPlayerName(2, `Player 2`);
      this.#playerTwoName.textContent = `Player 2`;
    }
    this.#playerOneInput.disabled = !this.#playerOneInput.disabled
    this.#playerTwoInput.disabled = !this.#playerTwoInput.disabled
    this.#startRestart.textContent = this.#startRestart.textContent === this.#content[0] ? this.#content[1] : this.#content[0];
    gameController.resetGame();
    displayController.flipStart();
    displayController.buildDisplay();
  }
}

const displayController = new DisplayController();
const inputController = new InputController();
inputController.doTheThing();

displayController.buildDisplay();