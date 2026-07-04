const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "maze-runner";
const bestKey = "one-minute-game-maze-runner-best";
const size = 7;
const layouts = [
  ["S..#...", "##.#.#.", "...#.#.", ".###.#.", "...#...", ".#.###.", ".#....G"],
  ["S.#....", "..#.##.", "#...#..", "###.#.#", "...#..#", ".#.##..", "...#..G"],
  ["S...#..", "###.#.#", "..#...#", ".#.###.", ".#.....", ".#####.", "......G"],
  ["S.#...#", "..#.#..", "#...#.#", ".###..#", "...##..", "#......", "###.#.G"],
];
const moves = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};
const openFallbackLayout = ["S......", ".......", ".......", ".......", ".......", ".......", "......G"];

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let maze = [];
let player = { row: 0, col: 0 };
let goal = { row: 6, col: 6 };

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

function findPoint(source, marker) {
  for (let row = 0; row < source.length; row += 1) {
    const col = source[row].indexOf(marker);
    if (col !== -1) return { row, col };
  }
  return null;
}

function isReachable(source) {
  const start = findPoint(source, "S");
  const finish = findPoint(source, "G");
  if (!start || !finish) return false;

  const queue = [start];
  const visited = new Set([`${start.row}:${start.col}`]);

  while (queue.length) {
    const current = queue.shift();
    if (current.row === finish.row && current.col === finish.col) return true;

    Object.values(moves).forEach(([rowDelta, colDelta]) => {
      const next = { row: current.row + rowDelta, col: current.col + colDelta };
      const key = `${next.row}:${next.col}`;
      if (next.row < 0 || next.row >= size || next.col < 0 || next.col >= size) return;
      if (visited.has(key) || source[next.row][next.col] === "#") return;
      visited.add(key);
      queue.push(next);
    });
  }

  return false;
}

function pickLayout() {
  const playableLayouts = layouts.filter(isReachable);
  const candidates = playableLayouts.length ? playableLayouts : [openFallbackLayout];
  const source = candidates[Math.floor(Math.random() * candidates.length)];
  maze = source.map((row) => row.split(""));
  source.forEach((row, rowIndex) => {
    [...row].forEach((cell, colIndex) => {
      if (cell === "S") player = { row: rowIndex, col: colIndex };
      if (cell === "G") goal = { row: rowIndex, col: colIndex };
    });
  });
}

function cellClass(row, col) {
  if (player.row === row && player.col === col) return "maze-cell player";
  if (goal.row === row && goal.col === col) return "maze-cell goal";
  if (maze[row][col] === "#") return "maze-cell wall";
  return "maze-cell path";
}

function renderMaze() {
  board.className = "game-board maze-board";
  board.innerHTML = `
    <div class="maze-grid">
      ${maze
        .map((row, rowIndex) =>
          row
            .map((_, colIndex) => `<span class="${cellClass(rowIndex, colIndex)}"></span>`)
            .join(""),
        )
        .join("")}
    </div>
    <div class="maze-controls" aria-label="移動ボタン">
      <button class="maze-move up" type="button" data-move="up">↑</button>
      <button class="maze-move left" type="button" data-move="left">←</button>
      <button class="maze-move down" type="button" data-move="down">↓</button>
      <button class="maze-move right" type="button" data-move="right">→</button>
    </div>
  `;
  board.querySelectorAll(".maze-move").forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.move));
  });
}

function nextMaze() {
  pickLayout();
  renderMaze();
}

function move(direction) {
  if (!running || !moves[direction]) return;
  const [rowDelta, colDelta] = moves[direction];
  const next = { row: player.row + rowDelta, col: player.col + colDelta };
  if (next.row < 0 || next.row >= size || next.col < 0 || next.col >= size) return;
  if (maze[next.row][next.col] === "#") {
    score = Math.max(0, score - 1);
    renderStats();
    return;
  }
  player = next;
  score += 1;
  if (player.row === goal.row && player.col === goal.col) {
    score += 10;
    renderStats();
    nextMaze();
    return;
  }
  renderStats();
  renderMaze();
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowLeft: "left",
  };
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  move(direction);
}

function endGame() {
  running = false;
  clearInterval(timerId);
  window.removeEventListener("keydown", handleKeydown);
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
  window.addEventListener("keydown", handleKeydown);
  nextMaze();
  timerId = setInterval(() => {
    timeLeft -= 1;
    renderStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function resetGame() {
  clearInterval(timerId);
  window.removeEventListener("keydown", handleKeydown);
  score = 0;
  timeLeft = 60;
  running = false;
  renderStats();
  board.className = "game-board";
  board.innerHTML = `<div class="game-ready"><img src="/images/mascot-game.png" alt="1分ツールのマスコットキャラクター" /><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
