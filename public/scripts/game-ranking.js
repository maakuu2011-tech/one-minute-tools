(function () {
  const storageKey = "one-minute-game-rankings-v1";
  const playerKey = "one-minute-game-player-v1";

  function playerId() {
    try {
      const current = localStorage.getItem(playerKey);
      if (current) return current;
      const next = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `player-${Date.now()}-${Math.random()}`;
      localStorage.setItem(playerKey, next);
      return next;
    } catch {
      return "anonymous";
    }
  }

  function readData() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function writeData(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // localStorage may be unavailable in private modes. The game still works.
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function list(slug) {
    return readData()[slug] || [];
  }

  function renderList(element, rows) {
    if (!element) return;
    if (!rows.length) {
      element.innerHTML = `<li class="ranking-empty">まだ記録がありません。1回遊ぶとここに残ります。</li>`;
      return;
    }

    element.innerHTML = rows
      .map(
        (row, index) => `
          <li>
            <span>${index + 1}</span>
            <strong>${row.score}</strong>
            <time datetime="${row.date}">${formatDate(row.date)}</time>
          </li>
        `,
      )
      .join("");
  }

  function renderGlobalList(element, payload) {
    if (!element) return;
    if (!payload || payload.enabled === false) {
      element.innerHTML = `<li class="ranking-empty">共通ランキングは準備中です。Cloudflare D1をつなぐと表示されます。</li>`;
      return;
    }
    renderList(element, payload.rows || []);
  }

  async function fetchGlobal(slug) {
    if (!slug) return { enabled: false, rows: [] };
    try {
      const response = await fetch(`/api/rankings?game=${encodeURIComponent(slug)}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) return { enabled: false, rows: [] };
      return await response.json();
    } catch {
      return { enabled: false, rows: [] };
    }
  }

  async function submitGlobal(slug, score) {
    try {
      await fetch("/api/rankings", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ game: slug, score: Number(score), playerId: playerId() }),
      });
    } catch {
      // Global ranking is optional. Local ranking remains the fallback.
    }
  }

  function renderCurrent(slug) {
    const rankingList = document.getElementById("rankingList");
    const globalRankingList = document.getElementById("globalRankingList");
    if (!slug) return;
    renderList(rankingList, list(slug));
    if (globalRankingList) {
      globalRankingList.innerHTML = `<li class="ranking-empty">読み込み中です。</li>`;
      fetchGlobal(slug).then((payload) => renderGlobalList(globalRankingList, payload));
    }
  }

  function record(slug, score) {
    const value = Number(score);
    if (!slug || !Number.isFinite(value)) return;
    const data = readData();
    const rows = data[slug] || [];
    rows.push({ score: value, date: new Date().toISOString() });
    data[slug] = rows.sort((a, b) => b.score - a.score).slice(0, 10);
    writeData(data);
    renderCurrent(slug);
    submitGlobal(slug, value).then(() => renderCurrent(slug));
  }

  function resultHtml(score) {
    return `
      <div class="game-result">
        <img class="game-result__mascot" src="/images/mascot-cheer.png" alt="1分ツールのマスコットキャラクター" />
        <strong>終了！</strong>
        <p>スコアは <span>${score}</span> でした。</p>
        <div class="actions game-result__actions">
          <button class="button primary" type="button" data-game-replay>もう一回</button>
          <a class="button secondary" href="/games/ranking/">ランキング</a>
          <a class="button secondary" href="/games/">別ゲーム</a>
        </div>
      </div>
    `;
  }

  function bindResultActions(replay) {
    const button = document.querySelector("[data-game-replay]");
    if (!button || typeof replay !== "function") return;
    button.addEventListener("click", replay);
  }

  function currentSlug() {
    const meta = document.getElementById("game-meta");
    if (!meta) return "";
    try {
      return JSON.parse(meta.textContent || "{}").slug || "";
    } catch {
      return "";
    }
  }

  window.OneMinuteRanking = {
    record,
    list,
    fetchGlobal,
    all: readData,
    renderCurrent,
    renderList,
    renderGlobalList,
    resultHtml,
    bindResultActions,
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderCurrent(currentSlug());
  });
})();
