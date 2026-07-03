const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "janken-reaction";
const bestKey = "one-minute-game-janken-reaction-best";
const hands = [
  { key: "rock", label: "グー", icon: "✊", winsTo: "scissors" },
  { key: "scissors", label: "チョキ", icon: "✌", winsTo: "paper" },
  { key: "paper", label: "パー", icon: "✋", winsTo: "rock" },
];

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let opponent = hands[0];

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

function winningHand(target) {
  return hands.find((hand) => hand.winsTo === target.key);
}

function nextRound() {
  opponent = hands[Math.floor(Math.random() * hands.length)];
  board.className = "game-board janken-board";
  board.innerHTML = `
    <div class="janken-card">
      <p>この手に勝つ手を選ぶ</p>
      <strong>${opponent.icon}</strong>
      <span>${opponent.label}</span>
      <div class="janken-options">
        ${hands
          .map(
            (hand) => `
              <button class="janken-choice" type="button" data-hand="${hand.key}">
                <span>${hand.icon}</span>
                ${hand.label}
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;

  board.querySelectorAll(".janken-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (!running) return;
      const correct = winningHand(opponent);
      if (button.dataset.hand === correct.key) {
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
  board.innerHTML = `<div class="game-ready"><img src="/images/mascot-game.png" alt="1分ツールのマスコットキャラクター" /><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
