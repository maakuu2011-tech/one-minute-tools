const searchInput = document.getElementById("toolSearch");
const categoryButtons = Array.from(document.querySelectorAll(".category-pill"));
const toolItems = Array.from(document.querySelectorAll(".tool-item"));
const toolCount = document.getElementById("toolCount");
const emptyState = document.getElementById("emptyState");

let activeCategory = "すべて";

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function applyFilters() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  toolItems.forEach((item) => {
    const category = item.dataset.category;
    const text = normalize([
      item.dataset.title,
      item.dataset.description,
      item.dataset.category,
      item.dataset.keywords,
    ].join(" "));

    const categoryMatches = activeCategory === "すべて" || category === activeCategory;
    const queryMatches = !query || text.includes(query);
    const visible = categoryMatches && queryMatches;

    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  toolCount.textContent = String(visibleCount);
  emptyState.hidden = visibleCount !== 0;
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);
applyFilters();
