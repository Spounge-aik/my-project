const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;

function checkWinner() {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(cell => cell !== null)) return { winner: 'draw' };
  return null;
}

function handleClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer.toLowerCase());
  e.target.disabled = true;

  const result = checkWinner();
  if (result) {
    gameOver = true;
    if (result.winner === 'draw') {
      status.textContent = "It's a draw!";
    } else {
      status.textContent = `Player ${result.winner} wins!`;
      result.line.forEach(i => cells[i].classList.add('winning'));
    }
    cells.forEach(cell => cell.disabled = true);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = `Player ${currentPlayer}'s turn`;
}

function reset() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  status.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
  });
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBtn.addEventListener('click', reset);
