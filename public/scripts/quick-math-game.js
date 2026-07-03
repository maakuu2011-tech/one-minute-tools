const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "quick-math";
const bestKey = "one-minute-game-quick-math-best";
let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let answer = 0;

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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createProblem() {
  const type = random(0, 2);
  let left = random(2, 29);
  let right = random(2, 19);
  let symbol = "+";

  if (type === 0) {
    answer = left + right;
    symbol = "+";
  } else if (type === 1) {
    if (right > left) [left, right] = [right, left];
    answer = left - right;
    symbol = "-";
  } else {
    left = random(2, 12);
    right = random(2, 9);
    answer = left * right;
    symbol = "×";
  }

  return `${left} ${symbol} ${right}`;
}

function renderProblem() {
  const problem = createProblem();
  board.className = "game-board quick-math-board";
  board.innerHTML = `
    <div class="quick-math-card">
      <p>答えを入力</p>
      <strong>${problem}</strong>
      <form class="quick-math-form" id="quickMathForm">
        <input id="quickMathAnswer" type="number" inputmode="numeric" autocomplete="off" aria-label="答え" />
        <button class="button primary" type="submit">答える</button>
      </form>
      <small>Enterでも回答できます</small>
    </div>
  `;

  const form = document.getElementById("quickMathForm");
  const input = document.getElementById("quickMathAnswer");
  input.focus();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!running) return;
    if (Number(input.value) === answer) {
      score += 1;
    } else {
      score = Math.max(0, score - 1);
    }
    renderStats();
    renderProblem();
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
  renderProblem();
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
