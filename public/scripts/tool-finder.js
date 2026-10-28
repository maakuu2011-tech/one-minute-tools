const searchInput = document.getElementById("toolSearch");
const categoryButtons = Array.from(document.querySelectorAll(".category-pill"));
const toolItems = Array.from(document.querySelectorAll(".tool-item"));
const toolCount = document.getElementById("toolCount");
const emptyState = document.getElementById("emptyState");
const searchUseLink = document.getElementById("searchUseLink");
const featuredToolsSection = document.getElementById("featuredToolsSection");

let activeCategory = "すべて";

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q");
const initialCategory = params.get("category");

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/柔らか/g, "やわらか")
    .replace(/未入金/g, "未払い")
    .replace(/返事/g, "返信")
    .replace(/命令口調/g, "命令");
}

const helperWords = new Set(["メール", "例文", "文例", "文章", "ツール", "メーカー"]);

function queryTerms(value) {
  const normalized = normalize(value)
    .replace(/(?:時|とき)の返し方/g, "返し方")
    .trim();
  if (!normalized) return [];

  const terms = normalized.split(/[\s　、,・/／|｜]+/).filter(Boolean);
  if (terms.length === 1) return terms;
  const concreteTerms = terms.filter((term) => !helperWords.has(term));
  return concreteTerms.length ? concreteTerms : terms;
}

function applyFilters() {
  const terms = queryTerms(searchInput.value);
  let visibleCount = 0;

  toolItems.forEach((item) => {
    const category = item.dataset.category;
    const text = normalize([
      item.dataset.title,
      item.dataset.description,
      item.dataset.category,
      item.dataset.keywords,
    ].join(" "));
    const compactText = text.replace(/[\s　、,・/／|｜]+/g, "");

    const categoryMatches = activeCategory === "すべて" || category === activeCategory;
    const queryMatches = terms.length === 0 || terms.every((term) => {
      const compactTerm = term.replace(/[\s　、,・/／|｜]+/g, "");
      return text.includes(term) || compactText.includes(compactTerm);
    });
    const visible = categoryMatches && queryMatches;

    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  toolCount.textContent = String(visibleCount);
  emptyState.hidden = visibleCount !== 0;
  const filtering = terms.length > 0 || activeCategory !== "すべて";
  document.documentElement.classList.toggle("tools-filtering", filtering);
  if (featuredToolsSection) featuredToolsSection.hidden = filtering;
  if (searchUseLink) {
    searchUseLink.href = `/use/?q=${encodeURIComponent(searchInput.value.trim())}`;
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    applyFilters();
  });
});

if (initialQuery) {
  searchInput.value = initialQuery;
}

if (initialCategory) {
  const matched = categoryButtons.find((button) => button.dataset.category === initialCategory);
  if (matched) {
    activeCategory = initialCategory;
    categoryButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === matched)));
  }
}

searchInput.addEventListener("input", applyFilters);
applyFilters();
