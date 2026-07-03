(function () {
  function readGames() {
    const source = document.getElementById("games-data");
    if (!source) return [];
    try {
      return JSON.parse(source.textContent || "[]");
    } catch {
      return [];
    }
  }

  function render() {
    const games = readGames();
    const ranking = window.OneMinuteRanking;
    if (!ranking) return;

    games.forEach((game) => {
      const list = document.querySelector(`[data-ranking-board="${game.slug}"]`);
      const globalList = document.querySelector(`[data-global-ranking-board="${game.slug}"]`);
      ranking.renderList(list, ranking.list(game.slug));
      if (globalList) {
        globalList.innerHTML = `<li class="ranking-empty">読み込み中です。</li>`;
        ranking.fetchGlobal(game.slug).then((payload) => ranking.renderGlobalList(globalList, payload));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
