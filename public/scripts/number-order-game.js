const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "number-order";
const bestKey = "one-minute-game-number-order-best";
let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let nextNumber = 1;

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

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function buildBoard() {
  nextNumber = 1;
  const numbers = shuffle(Array.from({ length: 25 }, (_, index) => index + 1));
  board.className = "game-board number-order-board";
  board.innerHTML = `
    <div class="number-order-head">
      <span>次に押す数字</span>
      <strong id="nextNumber">1</strong>
    </div>
    <div class="number-grid">
      ${numbers.map((number) => `<button class="number-cell" type="button" data-number="${number}">${number}</button>`).join("")}
    </div>
  `;

  board.querySelectorAll(".number-cell").forEach((button) => {
    button.addEventListener("click", () => {
      if (!running) return;
      const value = Number(button.dataset.number);
      if (value !== nextNumber) {
        score = Math.max(0, score - 1);
        renderStats();
        button.classList.add("miss");
        setTimeout(() => button.classList.remove("miss"), 160);
        return;
      }

      score += 1;
      button.disabled = true;
      button.classList.add("done");
      nextNumber += 1;
      renderStats();

      const nextEl = document.getElementById("nextNumber");
      if (nextEl) nextEl.textContent = nextNumber > 25 ? "OK" : String(nextNumber);
      if (nextNumber > 25) {
        score += 5;
        renderStats();
        setTimeout(buildBoard, 250);
      }
    });
  });
}

function endGame() {
  running = false;
  clearInterval(timerId);
  setBest(score);
  window.OneMinuteRanking?.record(gameSlug, score);
  board.className = "game-board";
  board.innerHTML = `<div class="game-ready"><strong>終了！</strong><p>スコアは ${score} でした。</p></div>`;
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
