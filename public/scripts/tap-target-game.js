const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "tap-target";
const bestKey = "one-minute-game-tap-target-best";
let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;

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

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeTarget() {
  if (!running) return;
  board.innerHTML = "";
  const target = document.createElement("button");
  target.type = "button";
  target.className = "tap-target";
  target.setAttribute("aria-label", "ターゲット");
  const size = randomBetween(46, 74);
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${randomBetween(8, Math.max(8, board.clientWidth - size - 8))}px`;
  target.style.top = `${randomBetween(8, Math.max(8, board.clientHeight - size - 8))}px`;
  target.addEventListener("click", () => {
    score += 1;
    renderStats();
    placeTarget();
  });
  board.appendChild(target);
}

function endGame() {
  running = false;
  clearInterval(timerId);
  setBest(score);
  window.OneMinuteRanking?.record(gameSlug, score);
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
  placeTarget();
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
  board.innerHTML = `<div class="game-ready"><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
