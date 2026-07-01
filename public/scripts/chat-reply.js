const state = {
  tone: "polite",
  length: "short",
};

const el = {
  incoming: document.getElementById("incoming"),
  purpose: document.getElementById("purpose"),
  relationship: document.getElementById("relationship"),
  detail: document.getElementById("detail"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  schedule: {
    incoming: "明日の打ち合わせ、30分早めることってできますか？",
    purpose: "confirm",
    relationship: "work",
    detail: "15時以降なら可能。難しければ別日でも大丈夫。",
  },
  decline: {
    incoming: "今週末、手伝ってもらえない？",
    purpose: "decline",
    relationship: "friend",
    detail: "予定が入っていて難しい。別の日なら相談できる。",
  },
  late: {
    incoming: "この件、確認できた？",
    purpose: "apology",
    relationship: "work",
    detail: "返信が遅れたことを謝って、今日中に確認して連絡する。",
  },
};

const purposeLine = {
  ok: "大丈夫です。",
  decline: "申し訳ありませんが、今回は難しそうです。",
  delay: "少し確認してから、改めて返信します。",
  confirm: "確認します。",
  thanks: "ありがとうございます。",
  apology: "返信が遅くなり、すみません。",
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function starter() {
  const relation = el.relationship.value;
  const purpose = el.purpose.value;

  if (state.tone === "casual" && (relation === "friend" || relation === "family")) {
    if (purpose === "apology") return "ごめん、返信遅くなった。";
    if (purpose === "thanks") return "ありがとう。";
    if (purpose === "decline") return "ごめん、今回はちょっと難しい。";
    return "了解。";
  }

  if (state.tone === "soft") {
    if (purpose === "decline") return "すみません、今回は少し難しそうです。";
    if (purpose === "delay") return "確認してから、改めて返信しますね。";
    if (purpose === "apology") return "返信が遅くなってしまい、すみません。";
    return purposeLine[purpose];
  }

  return purposeLine[purpose];
}

function closing() {
  if (state.tone === "casual" && (el.relationship.value === "friend" || el.relationship.value === "family")) {
    if (state.length === "long") return "またわかったら連絡するね。";
    return "";
  }
  if (state.length === "long") return "お手数ですが、よろしくお願いします。";
  if (state.length === "medium") return "よろしくお願いします。";
  return "";
}

function normalizeDetail(text) {
  const value = text.trim();
  if (!value) return "";
  if (state.tone === "casual" && (el.relationship.value === "friend" || el.relationship.value === "family")) {
    return value.replaceAll("。", "。");
  }
  return value;
}

function generate() {
  const parts = [starter()];
  const detail = normalizeDetail(el.detail.value);

  if (detail) parts.push(detail);

  if (state.length === "long" && el.incoming.value.trim()) {
    parts.push("いただいた内容を確認したうえで、無理のない形で進められればと思います。");
  }

  const end = closing();
  if (end) parts.push(end);

  el.output.textContent = parts.join("\n");
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に返信文を作ってください");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("コピーしました");
}

document.querySelectorAll(".segmented").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state[group.dataset.group] = button.dataset.value;
    generate();
  });
});

document.querySelectorAll(".template-button").forEach((button) => {
  button.addEventListener("click", () => {
    const sample = templates[button.dataset.template];
    el.incoming.value = sample.incoming;
    el.purpose.value = sample.purpose;
    el.relationship.value = sample.relationship;
    el.detail.value = sample.detail;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.incoming.value = "";
  el.detail.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.incoming, el.purpose, el.relationship, el.detail].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.incoming.value = templates.schedule.incoming;
el.detail.value = templates.schedule.detail;
generate();
