(function () {
  const storageKey = "one-minute-game-rankings-v1";

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

  function renderCurrent(slug) {
    const rankingList = document.getElementById("rankingList");
    if (!rankingList || !slug) return;
    renderList(rankingList, list(slug));
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
    all: readData,
    renderCurrent,
    renderList,
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderCurrent(currentSlug());
  });
})();
