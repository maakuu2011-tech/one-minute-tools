const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "color-match";
const bestKey = "one-minute-game-color-match-best";
const colors = [
  { key: "red", label: "赤", value: "#ef4444" },
  { key: "blue", label: "青", value: "#2563eb" },
  { key: "green", label: "緑", value: "#059669" },
  { key: "yellow", label: "黄", value: "#f59e0b" },
];

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let target = colors[0];

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

function nextRound() {
  target = colors[Math.floor(Math.random() * colors.length)];
  const options = shuffle(colors);
  board.className = "game-board color-match-board";
  board.innerHTML = `
    <div class="color-match-card">
      <p>この色を選ぶ</p>
      <strong>${target.label}</strong>
      <div class="color-options">
        ${options
          .map(
            (color) => `
              <button class="color-choice" type="button" data-color="${color.key}" style="background:${color.value}">
                ${color.label}
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;

  board.querySelectorAll(".color-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (!running) return;
      if (button.dataset.color === target.key) {
        score += 1;
      } else {
        score = Math.max(0, score - 1);
      }
      renderStats();
      nextRound();
    });
  });
}

function endGame() {
  running = false;
  clearInterval(timerId);
  setBest(score);
  window.OneMinuteRanking?.record(gameSlug, score);
  board.className = "game-board";
  board.innerHTML = window.OneMinuteRanking?.resultHtml(score) || `<div class="game-ready"><strong>終了！</strong><p>スコアは ${score} でした。</p></div>`;
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
  nextRound();
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
