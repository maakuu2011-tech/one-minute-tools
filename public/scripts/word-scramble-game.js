const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "word-scramble";
const bestKey = "one-minute-game-word-scramble-best";
const words = ["メール", "チャット", "メモ", "時計", "仕事", "集中", "返信", "確認", "整理", "休憩", "道具", "文章"];

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let answer = words[0];

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

function scramble(word) {
  const chars = [...word];
  let shuffled = shuffle(chars).join("");
  if (shuffled === word && chars.length > 1) {
    shuffled = chars.slice(1).join("") + chars[0];
  }
  return shuffled;
}

function optionsFor(word) {
  return shuffle([word, ...shuffle(words.filter((item) => item !== word)).slice(0, 3)]);
}

function nextRound() {
  answer = words[Math.floor(Math.random() * words.length)];
  const scrambled = scramble(answer);
  const options = optionsFor(answer);
  board.className = "game-board word-board";
  board.innerHTML = `
    <div class="word-card">
      <p>正しい言葉を選ぶ</p>
      <strong>${scrambled}</strong>
      <div class="word-options">
        ${options.map((word) => `<button class="word-choice" type="button" data-word="${word}">${word}</button>`).join("")}
      </div>
    </div>
  `;

  board.querySelectorAll(".word-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (!running) return;
      if (button.dataset.word === answer) {
        score += 1;
        button.classList.add("correct");
      } else {
        score = Math.max(0, score - 1);
        button.classList.add("wrong");
      }
      renderStats();
      setTimeout(nextRound, 120);
    });
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
  board.innerHTML = `<div class="game-ready"><img src="/images/mascot-thinking.png" alt="1分ツールのマスコットキャラクター" /><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
