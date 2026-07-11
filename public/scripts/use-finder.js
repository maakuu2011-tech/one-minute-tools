const useSearch = document.getElementById("useSearch");
const useCategoryButtons = Array.from(document.querySelectorAll(".use-category-pill"));
const useGroups = Array.from(document.querySelectorAll("[data-use-group]"));
const useItems = Array.from(document.querySelectorAll(".use-filter-item"));
const useCount = document.getElementById("useCount");
const useEmptyState = document.getElementById("useEmptyState");
const featuredUseList = document.getElementById("featuredUseList");
const featuredSection = featuredUseList ? featuredUseList.closest("section") : null;

let activeUseCategory = "\u3059\u3079\u3066";

function normalizeUseText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function applyUseFilters() {
  const query = normalizeUseText(useSearch.value);
  let visibleCount = 0;

  useItems.forEach((item) => {
    const group = item.closest("[data-use-group]");
    const category = group ? group.dataset.useGroup : "";
    const text = normalizeUseText([
      item.dataset.useTitle,
      item.dataset.useDescription,
      item.dataset.useLabel,
      item.dataset.useKeywords,
    ].join(" "));
    const categoryMatches = activeUseCategory === "\u3059\u3079\u3066" || category === activeUseCategory;
    const queryMatches = !query || text.includes(query);
    const visible = categoryMatches && queryMatches;

    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  useGroups.forEach((group) => {
    group.hidden = !group.querySelector(".use-filter-item:not([hidden])");
  });

  const filtering = Boolean(query) || activeUseCategory !== "\u3059\u3079\u3066";
  if (featuredSection) featuredSection.hidden = filtering;
  useCount.textContent = String(visibleCount);
  useEmptyState.hidden = visibleCount !== 0;
}

useCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeUseCategory = button.dataset.useCategory;
    useCategoryButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    applyUseFilters();
  });
});

useSearch.addEventListener("input", applyUseFilters);
applyUseFilters();
