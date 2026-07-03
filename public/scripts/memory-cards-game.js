const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "memory-cards";
const bestKey = "one-minute-game-memory-cards-best";
const icons = ["★", "●", "◆", "▲", "♣", "♥", "☀", "♪"];
let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let firstCard = null;
let lock = false;
let matched = 0;

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

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

function buildBoard() {
  firstCard = null;
  lock = false;
  matched = 0;
  board.innerHTML = "";
  board.classList.add("memory-board");
  const cards = shuffle([...icons, ...icons]);

  cards.forEach((icon) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "memory-card";
    card.dataset.icon = icon;
    card.textContent = "?";
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (!running || lock || card.classList.contains("open") || card.classList.contains("matched")) return;
  card.classList.add("open");
  card.textContent = card.dataset.icon;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  if (firstCard.dataset.icon === card.dataset.icon) {
    firstCard.classList.add("matched");
    card.classList.add("matched");
    score += 3;
    matched += 2;
    firstCard = null;
    renderStats();
    if (matched === 16) {
      score += 10;
      renderStats();
      setTimeout(buildBoard, 450);
    }
    return;
  }

  score = Math.max(0, score - 1);
  renderStats();
  lock = true;
  setTimeout(() => {
    firstCard.classList.remove("open");
    card.classList.remove("open");
    firstCard.textContent = "?";
    card.textContent = "?";
    firstCard = null;
    lock = false;
  }, 650);
}

function endGame() {
  running = false;
  clearInterval(timerId);
  setBest(score);
  window.OneMinuteRanking?.record(gameSlug, score);
  board.classList.remove("memory-board");
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
  board.classList.remove("memory-board");
  renderStats();
  board.innerHTML = `<div class="game-ready"><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
