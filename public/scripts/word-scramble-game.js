const board = document.getElementById("gameBoard");
const startButton = document.getElementById("gameStart");
const resetButton = document.getElementById("gameReset");
const timeEl = document.getElementById("gameTime");
const scoreEl = document.getElementById("gameScore");
const bestEl = document.getElementById("gameBest");

const gameSlug = "word-scramble";
const bestKey = "one-minute-game-word-scramble-best";
const words = [
  "メモ",
  "時計",
  "仕事",
  "集中",
  "返信",
  "確認",
  "整理",
  "休憩",
  "道具",
  "文章",
  "予定",
  "資料",
  "相談",
  "連絡",
  "報告",
  "期限",
  "会議",
  "承認",
  "メール",
  "ボタン",
  "ゲーム",
  "タスク",
  "データ",
  "コピー",
  "スコア",
  "リンク",
  "チャット",
  "ブラウザ",
  "リセット",
  "アイデア",
  "シンプル",
  "タイマー",
];

let timerId = null;
let score = 0;
let timeLeft = 60;
let running = false;
let answer = words[0];
let previousAnswer = "";
let roundTimerId = null;

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
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
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
  const length = [...word].length;
  const sameLengthWords = words.filter((item) => item !== word && [...item].length === length);
  return shuffle([word, ...shuffle(sameLengthWords).slice(0, 3)]);
}

function nextRound() {
  if (!running) return;

  const candidates = words.filter((word) => word !== previousAnswer);
  answer = candidates[Math.floor(Math.random() * candidates.length)];
  previousAnswer = answer;
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
      <p class="word-feedback" role="status" aria-live="polite"></p>
    </div>
  `;

  board.querySelectorAll(".word-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (!running) return;

      const choices = [...board.querySelectorAll(".word-choice")];
      const isCorrect = button.dataset.word === answer;
      choices.forEach((choice) => {
        choice.disabled = true;
        if (choice.dataset.word === answer) choice.classList.add("correct");
      });

      if (isCorrect) {
        score += 1;
      } else {
        score = Math.max(0, score - 1);
        button.classList.add("wrong");
      }
      const feedback = board.querySelector(".word-feedback");
      feedback.textContent = isCorrect ? "正解！ +1" : `正解は「${answer}」 -1`;
      renderStats();
      roundTimerId = setTimeout(nextRound, 450);
    });
  });
}

function endGame() {
  running = false;
  clearInterval(timerId);
  clearTimeout(roundTimerId);
  startButton.disabled = false;
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
  clearTimeout(roundTimerId);
  score = 0;
  timeLeft = 60;
  running = true;
  previousAnswer = "";
  startButton.disabled = true;
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
  clearTimeout(roundTimerId);
  score = 0;
  timeLeft = 60;
  running = false;
  previousAnswer = "";
  startButton.disabled = false;
  renderStats();
  board.className = "game-board";
  board.innerHTML = `<div class="game-ready"><img src="/images/mascot-thinking.png" alt="1分ツールのマスコットキャラクター" /><p>スタートを押して遊んでください。</p></div>`;
  startButton.textContent = "スタート";
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
renderStats();
