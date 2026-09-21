const gameCategoryButtons = Array.from(document.querySelectorAll(".game-category-pill"));
const gameItems = Array.from(document.querySelectorAll(".game-filter-item"));
const gameCount = document.getElementById("gameCount");

function showGameCategory(category) {
  let visibleCount = 0;

  gameItems.forEach((item) => {
    const visible = category === "すべて" || item.dataset.gameCategory === category;
    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  gameCategoryButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.gameCategory === category));
  });
  gameCount.textContent = String(visibleCount);
}

gameCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => showGameCategory(button.dataset.gameCategory));
});
