const gameCategoryButtons = Array.from(document.querySelectorAll(".game-category-pill"));
const gameItems = Array.from(document.querySelectorAll(".game-filter-item"));
const gameCount = document.getElementById("gameCount");

function showGameGroup(group) {
  let visibleCount = 0;

  gameItems.forEach((item) => {
    const visible = group === "all" || item.dataset.gameGroup === group;
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  gameCategoryButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.gameGroup === group));
  });
  gameCount.textContent = String(visibleCount);
}

gameCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => showGameGroup(button.dataset.gameGroup));
});
