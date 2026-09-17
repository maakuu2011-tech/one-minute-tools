const state = {
  tone: "natural",
  length: "short",
  template: "invite",
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
  invite: {
    incoming: "今週どこかでご飯行かない？",
    purpose: "ok",
    relationship: "friend",
    detail: "金曜なら空いている。時間は夜がいい。",
  },
  decline: {
    incoming: "明日ちょっと手伝ってもらえない？",
    purpose: "decline",
    relationship: "friend",
    detail: "予定があって難しい。別の日なら相談できる。",
  },
  late: {
    incoming: "昨日送った件、見た？",
    purpose: "apology",
    relationship: "acquaintance",
    detail: "返信が遅れたことを謝って、今から確認する。",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function extractTiming(text) {
  const normalized = text.replace(/\s+/g, "");
  const date = normalized.match(/(?:\d{1,2}月\d{1,2}日|今日|明日|明後日|今週末?|来週末?|再来週|[月火水木金土日](?:曜|曜日))/)?.[0] ?? "";
  const time = normalized.match(/(?:午前|午後|夕方|夜)?\d{1,2}(?::\d{2}|時(?:半|\d{1,2}分)?)/)?.[0] ?? "";

  if (date && time) return `${date}${time}`;
  return date || time;
}

function baseLine() {
  const polite = state.tone === "polite" || el.relationship.value === "work" || el.relationship.value === "acquaintance";
  const soft = state.tone === "soft" || el.relationship.value === "partner";
  const incoming = el.incoming.value.trim();
  const timing = extractTiming(incoming);
  const mentionsSentItem = /送(?:った|って|付|信)|資料|内容|確認|見た[？?]?/.test(incoming);

  if (el.purpose.value === "ok") {
    if (timing) return polite ? `${timing}で大丈夫です。` : soft ? `${timing}なら大丈夫だよ、ありがとう。` : `${timing}で大丈夫だよ。`;
    return polite ? "大丈夫です。" : soft ? "いいよ、ありがとう。" : "いいよ。";
  }
  if (el.purpose.value === "decline") {
    if (timing) return polite ? `すみません、${timing}は難しそうです。` : soft ? `ごめん、${timing}はちょっと難しそう。` : `ごめん、${timing}は難しい。`;
    return polite ? "すみません、今回は難しそうです。" : soft ? "ごめん、今回はちょっと難しそう。" : "ごめん、今回は難しい。";
  }
  if (el.purpose.value === "wait") {
    if (mentionsSentItem) return polite ? "送っていただいた内容を確認してから返信します。" : "送ってくれた内容を確認してから返すね。";
    return polite ? "少し確認してから返信します。" : "ちょっと確認してから返すね。";
  }
  if (el.purpose.value === "thanks") {
    if (mentionsSentItem) return polite ? "お送りいただきありがとうございます。" : "送ってくれてありがとう。";
    return polite ? "ありがとうございます。" : "ありがとう。";
  }
  if (el.purpose.value === "apology") {
    const apology = polite ? "返信が遅くなってすみません。" : "返信遅くなってごめん。";
    if (mentionsSentItem) return polite ? `${apology}送っていただいた内容を今から確認します。` : `${apology}送ってくれた内容、今から確認するね。`;
    return apology;
  }
  if (el.purpose.value === "ask") {
    if (timing) return polite ? `${timing}で合っていますか？` : `${timing}で合ってる？`;
    return polite ? "確認させてください。" : "ちょっと確認してもいい？";
  }
  return "了解です。";
}

function ending() {
  if (state.length === "short") return "";
  if (state.tone === "polite" || el.relationship.value === "work") return "よろしくお願いします。";
  if (el.relationship.value === "partner") return "また連絡するね。";
  return "また確認して連絡するね。";
}

function generate() {
  const detail = el.detail.value.trim();
  const parts = [baseLine()];
  if (detail) parts.push(detail);
  if (state.length === "long") {
    if (el.purpose.value === "decline") parts.push("誘ってくれたのにごめんね。");
    if (el.purpose.value === "ok") parts.push("楽しみにしてる。");
  }
  const end = ending();
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
    state.template = button.dataset.template;
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
  state.template = null;
  el.output.textContent = "";
  showToast("クリアしました");
});

el.incoming.addEventListener("input", () => {
  const sample = state.template ? templates[state.template] : null;
  if (sample && el.incoming.value !== sample.incoming && el.detail.value === sample.detail) {
    el.detail.value = "";
    state.template = null;
  }
  generate();
});

[el.purpose, el.relationship, el.detail].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.incoming.value = templates.invite.incoming;
el.detail.value = templates.invite.detail;
generate();
