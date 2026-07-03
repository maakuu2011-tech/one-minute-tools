const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");
const actions = document.querySelector(".game-actions");

const size = 8;
const mineCount = 10;
const totalSafeCells = size * size - mineCount;
const bestKey = "one-minute-game-minesweeper-best";

let timerId = null;
let timeLeft = 60;
let score = 0;
let running = false;
let boardReady = false;
let flagMode = false;
let cells = [];

const flagButton = document.createElement("button");
flagButton.className = "button secondary";
flagButton.type = "button";
flagButton.textContent = "旗モード: OFF";
actions.insertBefore(flagButton, resetButton);

function renderStats() {
  timeEl.textContent = String(timeLeft);
  scoreEl.textContent = String(score);
  bestEl.textContent = localStorage.getItem(bestKey) || "0";
}

function setBest(value) {
  const best = Math.max(Number(localStorage.getItem(bestKey) || 0), value);
  localStorage.setItem(bestKey, String(best));
  bestEl.textContent = String(best);
}

function indexOf(row, col) {
  return row * size + col;
}

function neighbors(row, col) {
  const result = [];
  for (let y = row - 1; y <= row + 1; y += 1) {
    for (let x = col - 1; x <= col + 1; x += 1) {
      if (y === row && x === col) continue;
      if (y < 0 || y >= size || x < 0 || x >= size) continue;
      result.push(indexOf(y, x));
    }
  }
  return result;
}

function createEmptyCells() {
  cells = Array.from({ length: size * size }, (_, index) => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
    mine: false,
    count: 0,
    open: false,
    flagged: false,
  }));
}

function placeMines(firstIndex) {
  const first = cells[firstIndex];
  const safeZone = new Set([firstIndex, ...neighbors(first.row, first.col)]);
  const candidates = cells.map((cell) => cell.index).filter((index) => !safeZone.has(index));
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  candidates.slice(0, mineCount).forEach((index) => {
    cells[index].mine = true;
  });
  cells.forEach((cell) => {
    cell.count = neighbors(cell.row, cell.col).filter((index) => cells[index].mine).length;
  });
  boardReady = true;
}

function buildBoard() {
  createEmptyCells();
  boardReady = false;
  board.className = "game-board minesweeper-board";
  board.innerHTML = "";

  cells.forEach((cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mine-cell";
    button.dataset.index = String(cell.index);
    button.setAttribute("aria-label", `マス ${cell.row + 1}-${cell.col + 1}`);
    button.addEventListener("click", () => handleCell(cell.index));
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleFlag(cell.index);
    });
    board.appendChild(button);
  });
}

function paintCell(cell) {
  const button = board.querySelector(`[data-index="${cell.index}"]`);
  if (!button) return;
  button.classList.toggle("open", cell.open);
  button.classList.toggle("flagged", cell.flagged);
  button.classList.toggle("mine-hit", cell.mine && cell.open);
  if (cell.open) {
    button.textContent = cell.mine ? "×" : cell.count ? String(cell.count) : "";
    button.dataset.count = String(cell.count);
  } else {
    button.textContent = cell.flagged ? "⚑" : "";
    delete button.dataset.count;
  }
}

function paintAll() {
  cells.forEach(paintCell);
}

function toggleFlag(index) {
  if (!running) return;
  const cell = cells[index];
  if (cell.open) return;
  cell.flagged = !cell.flagged;
  paintCell(cell);
}

function openCell(index) {
  const cell = cells[index];
  if (cell.open || cell.flagged) return;
  cell.open = true;
  if (!cell.mine) score += 1;
  if (!cell.mine && cell.count === 0) {
    neighbors(cell.row, cell.col).forEach(openCell);
  }
}

function revealMines() {
  cells.forEach((cell) => {
    if (cell.mine) cell.open = true;
  });
  paintAll();
}

function endGame(message) {
  running = false;
  clearInterval(timerId);
  setBest(score);
  if (message) {
    const notice = document.createElement("div");
    notice.className = "mine-result";
    notice.textContent = message;
    board.appendChild(notice);
  }
  startButton.textContent = "もう一回";
}

function handleCell(index) {
  if (!running) return;
  if (flagMode) {
    toggleFlag(index);
    return;
  }
  if (!boardReady) placeMines(index);
  const cell = cells[index];
  if (cell.flagged || cell.open) return;
  if (cell.mine) {
    cell.open = true;
    revealMines();
    renderStats();
    endGame(`地雷でした。スコア ${score}`);
    return;
  }
  openCell(index);
  paintAll();
  renderStats();
  if (score >= totalSafeCells) {
    score += timeLeft;
    renderStats();
    endGame(`クリア！ スコア ${score}`);
  }
}

function tick() {
  timeLeft -= 1;
  renderStats();
  if (timeLeft <= 0) {
    revealMines();
    endGame(`終了！ スコア ${score}`);
  }
}

function startGame() {
  clearInterval(timerId);
  timeLeft = 60;
  score = 0;
  running = true;
  flagMode = false;
  flagButton.textContent = "旗モード: OFF";
  startButton.textContent = "プレイ中";
  renderStats();
  buildBoard();
  timerId = setInterval(tick, 1000);
}

function resetGame() {
  clearInterval(timerId);
  timeLeft = 60;
  score = 0;
  running = false;
  flagMode = false;
  boardReady = false;
  flagButton.textContent = "旗モード: OFF";
  renderStats();
  board.className = "game-board";
  board.innerHTML = `<div class="game-ready"><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

flagButton.addEventListener("click", () => {
  flagMode = !flagMode;
  flagButton.textContent = flagMode ? "旗モード: ON" : "旗モード: OFF";
});
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
