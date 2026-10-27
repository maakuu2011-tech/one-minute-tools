const useSearch = document.getElementById("useSearch");
const useCategoryButtons = Array.from(document.querySelectorAll(".use-category-pill"));
const useGroups = Array.from(document.querySelectorAll("[data-use-group]"));
const useItems = Array.from(document.querySelectorAll(".use-filter-item"));
const useCount = document.getElementById("useCount");
const useEmptyState = document.getElementById("useEmptyState");
const searchToolsLink = document.getElementById("searchToolsLink");
const featuredUseList = document.getElementById("featuredUseList");
const featuredSection = featuredUseList ? featuredUseList.closest("section") : null;

let activeUseCategory = "\u3059\u3079\u3066";

function normalizeUseText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/柔らか/g, "やわらか")
    .replace(/未入金/g, "未払い")
    .replace(/返事/g, "返信")
    .replace(/命令口調/g, "命令");
}

const useHelperWords = new Set(["メール", "例文", "文例", "文章", "ツール", "メーカー"]);

function useQueryTerms(value) {
  const normalized = normalizeUseText(value)
    .replace(/(?:時|とき)の返し方/g, "返し方")
    .trim();
  if (!normalized) return [];

  const terms = normalized.split(/[\s　、,・/／|｜]+/).filter(Boolean);
  if (terms.length === 1) return terms;
  const concreteTerms = terms.filter((term) => !useHelperWords.has(term));
  return concreteTerms.length ? concreteTerms : terms;
}

function applyUseFilters() {
  const terms = useQueryTerms(useSearch.value);
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
    const compactText = text.replace(/[\s　、,・/／|｜]+/g, "");
    const categoryMatches = activeUseCategory === "\u3059\u3079\u3066" || category === activeUseCategory;
    const queryMatches = terms.length === 0 || terms.every((term) => {
      const compactTerm = term.replace(/[\s　、,・/／|｜]+/g, "");
      return text.includes(term) || compactText.includes(compactTerm);
    });
    const visible = categoryMatches && queryMatches;

    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  useGroups.forEach((group) => {
    group.hidden = !group.querySelector(".use-filter-item:not([hidden])");
  });

  const filtering = terms.length > 0 || activeUseCategory !== "\u3059\u3079\u3066";
  if (featuredSection) featuredSection.hidden = filtering;
  useCount.textContent = String(visibleCount);
  useEmptyState.hidden = visibleCount !== 0;
  if (searchToolsLink) {
    searchToolsLink.href = `/tools/?q=${encodeURIComponent(useSearch.value.trim())}`;
  }
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

const useParams = new URLSearchParams(window.location.search);
const initialUseQuery = useParams.get("q");
if (initialUseQuery) useSearch.value = initialUseQuery;

useSearch.addEventListener("input", applyUseFilters);
applyUseFilters();
