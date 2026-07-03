const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const size = 6;
const shipSizes = [3, 2, 2, 1];
const gameSlug = "sea-battle";
const bestKey = "one-minute-game-sea-battle-best";

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let cells = [];
let ships = [];

function setBest(value) {
  const best = Math.max(Number(localStorage.getItem(bestKey) || 0), value);
  localStorage.setItem(bestKey, String(best));
  bestEl.textContent = String(best);
}

function renderStats() {
  timeEl.textContent = String(timeLeft);
  scoreEl.textContent = String(score);
  bestEl.textContent = localStorage.getItem(bestKey) || "0";
}

function indexOf(row, col) {
  return row * size + col;
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function canPlace(startRow, startCol, length, horizontal) {
  const indexes = [];
  for (let i = 0; i < length; i += 1) {
    const row = startRow + (horizontal ? 0 : i);
    const col = startCol + (horizontal ? i : 0);
    if (row >= size || col >= size) return null;
    const index = indexOf(row, col);
    if (cells[index].shipId !== null) return null;
    indexes.push(index);
  }
  return indexes;
}

function placeShips() {
  ships = [];
  shipSizes.forEach((length, shipId) => {
    const starts = shuffle(Array.from({ length: size * size }, (_, index) => index));
    for (const start of starts) {
      const row = Math.floor(start / size);
      const col = start % size;
      const directions = shuffle([true, false]);
      const indexes = directions.map((horizontal) => canPlace(row, col, length, horizontal)).find(Boolean);
      if (!indexes) continue;
      indexes.forEach((index) => {
        cells[index].shipId = shipId;
      });
      ships.push({ id: shipId, length, hits: 0, indexes });
      return;
    }
  });
}

function createCells() {
  cells = Array.from({ length: size * size }, (_, index) => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
    shipId: null,
    open: false,
  }));
  placeShips();
}

function paintCell(cell) {
  const button = board.querySelector(`[data-index="${cell.index}"]`);
  if (!button) return;
  button.classList.toggle("open", cell.open);
  if (!cell.open) {
    button.textContent = "";
    return;
  }
  if (cell.shipId === null) {
    button.classList.add("miss");
    button.textContent = "・";
    return;
  }
  const ship = ships.find((item) => item.id === cell.shipId);
  const sunk = ship && ship.hits >= ship.length;
  button.classList.add(sunk ? "sunk" : "hit");
  button.textContent = sunk ? "沈" : "命";
}

function paintShip(ship) {
  ship.indexes.forEach((index) => paintCell(cells[index]));
}

function buildBoard() {
  createCells();
  board.className = "game-board sea-battle-board";
  board.innerHTML = `
    <div class="sea-battle-status">
      <span>敵艦</span>
      <strong id="shipStatus">0/${ships.length} 撃沈</strong>
    </div>
    <div class="sea-grid">
      ${cells
        .map(
          (cell) => `
            <button class="sea-cell" type="button" data-index="${cell.index}" aria-label="海域 ${cell.row + 1}-${cell.col + 1}"></button>
          `,
        )
        .join("")}
    </div>
  `;

  board.querySelectorAll(".sea-cell").forEach((button) => {
    button.addEventListener("click", () => attack(Number(button.dataset.index)));
  });
}

function updateShipStatus() {
  const sunk = ships.filter((ship) => ship.hits >= ship.length).length;
  const status = document.getElementById("shipStatus");
  if (status) status.textContent = `${sunk}/${ships.length} 撃沈`;
}

function attack(index) {
  if (!running) return;
  const cell = cells[index];
  if (!cell || cell.open) return;

  cell.open = true;
  if (cell.shipId === null) {
    score = Math.max(0, score - 1);
    paintCell(cell);
    renderStats();
    return;
  }

  const ship = ships.find((item) => item.id === cell.shipId);
  ship.hits += 1;
  score += 5;

  if (ship.hits >= ship.length) {
    score += 10;
    paintShip(ship);
  } else {
    paintCell(cell);
  }

  updateShipStatus();
  renderStats();

  if (ships.every((item) => item.hits >= item.length)) {
    score += timeLeft;
    renderStats();
    endGame();
  }
}

function revealAll() {
  cells.forEach((cell) => {
    if (cell.shipId !== null) {
      cell.open = true;
      paintCell(cell);
    }
  });
}

function endGame() {
  running = false;
  clearInterval(timerId);
  setBest(score);
  window.OneMinuteRanking?.record(gameSlug, score);
  board.className = "game-board";
  board.innerHTML =
    window.OneMinuteRanking?.resultHtml(score) ||
    `<div class="game-ready"><strong>終了！</strong><p>スコアは ${score} でした。</p></div>`;
  window.OneMinuteRanking?.bindResultActions(startGame);
  startButton.textContent = "もう一回";
}

function startGame() {
  clearInterval(timerId);
  score = 0;
  timeLeft = 60;
  running = true;
  startButton.textContent = "プレイ中";
  renderStats();
  buildBoard();
  timerId = setInterval(() => {
    timeLeft -= 1;
    renderStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function resetGame() {
  clearInterval(timerId);
  score = 0;
  timeLeft = 60;
  running = false;
  renderStats();
  board.className = "game-board";
  board.innerHTML = `<div class="game-ready"><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
