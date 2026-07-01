const tool = JSON.parse(document.getElementById("tool-data").textContent);

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

const categoryDefaults = {
  "断り方": { purpose: "decline", detail: "今回は都合が合わず難しいため、失礼のない形で断りたい。" },
  "催促": { purpose: "remind", detail: "確認状況を知りたいので、返信をお願いしたい。" },
  "言い換え": { purpose: "rewrite", detail: "相手にきつく見えない、やわらかい表現にしたい。" },
  "謝罪": { purpose: "apology", detail: "返信が遅れたことを謝り、今後の対応を伝えたい。" },
  "お礼": { purpose: "thanks", detail: "対応してもらったことへの感謝と、次の対応を伝えたい。" },
  "チャット": { purpose: "reply", detail: "短く自然に返したい。" },
  "日程調整": { purpose: "request", detail: "候補日を伝えて、都合の良い日時を確認したい。" },
  "依頼": { purpose: "request", detail: "無理のない範囲で対応をお願いしたい。" },
  "連絡": { purpose: "reply", detail: "欠席や予定変更を、簡潔に伝えたい。" },
  "返信": { purpose: "reply", detail: "問い合わせへの返信として、丁寧に対応したい。" },
  "報告": { purpose: "report", detail: "現在の状況と次にやることを簡潔に報告したい。" },
};

const templateText = {
  work: "ご相談いただいた件について、状況を確認したうえで返信したいです。",
  chat: "相手から急ぎで返事がほしいと言われています。",
  careful: "失礼がないよう、少し丁寧な文章にしたいです。",
};

const purposeStarters = {
  reply: "ご連絡ありがとうございます。",
  decline: "お声がけいただきありがとうございます。申し訳ありませんが、今回は対応が難しい状況です。",
  request: "恐れ入りますが、以下の内容についてご対応いただけますでしょうか。",
  remind: "お忙しいところ恐れ入ります。念のため、状況を確認させてください。",
  thanks: "このたびはご対応いただき、ありがとうございます。",
  apology: "返信が遅くなり、申し訳ありません。",
  report: "現在の状況についてご報告します。",
  rewrite: "以下のようにお伝えすると、やわらかい印象になります。",
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function defaultSubject() {
  if (tool.category === "催促") return "ご確認のお願い";
  if (tool.category === "お礼") return "お礼";
  if (tool.category === "謝罪") return "お詫び";
  if (tool.category === "依頼") return "お願い";
  if (tool.category === "報告") return "進捗のご報告";
  if (tool.category === "日程調整") return "日程調整のお願い";
  return tool.title.replace("メーカー", "").replace("ツール", "");
}

function ending() {
  const casual = state.tone === "casual" && el.relationship.value === "friend";
  if (casual) return state.length === "short" ? "" : "また確認して連絡するね。";
  if (state.length === "short") return "よろしくお願いします。";
  if (state.length === "medium") return "お手数ですが、よろしくお願いいたします。";
  return "お忙しいところ恐れ入りますが、何卒よろしくお願い申し上げます。";
}

function soften(text) {
  if (state.tone === "soft") {
    return text
      .replaceAll("難しい状況です", "少し難しい状況です")
      .replaceAll("確認させてください", "確認させていただけますと幸いです")
      .replaceAll("お願いします", "お願いいたします");
  }
  if (state.tone === "casual") {
    return text
      .replaceAll("ご連絡ありがとうございます。", "連絡ありがとう。")
      .replaceAll("申し訳ありません", "ごめんなさい")
      .replaceAll("恐れ入りますが、", "")
      .replaceAll("よろしくお願いいたします", "よろしくお願いします");
  }
  return text;
}

function generate() {
  const purpose = el.purpose.value;
  const incoming = el.incoming.value.trim();
  const detail = el.detail.value.trim();
  const lines = [];
  const isChatLike = ["チャット", "断り方", "言い換え"].includes(tool.category);

  if (!isChatLike) {
    lines.push(`件名：${defaultSubject()}`, "");
  }

  lines.push(purposeStarters[purpose] || purposeStarters.reply);

  if (incoming && state.length !== "short") {
    lines.push("", `いただいた内容：${incoming}`);
  }

  if (detail) {
    lines.push("", detail);
  }

  if (purpose === "decline" && state.length !== "short") {
    lines.push("", "せっかくお声がけいただいたところ恐縮ですが、今回は見送らせていただけますと幸いです。");
  }

  if (purpose === "remind" && state.length !== "short") {
    lines.push("", "行き違いでしたら申し訳ありません。ご確認いただけますと助かります。");
  }

  if (purpose === "rewrite") {
    lines.push("", "相手の状況にも配慮しつつ、こちらの意図が伝わる表現にしています。");
  }

  const end = ending();
  if (end) lines.push("", end);

  el.output.textContent = soften(lines.join("\n"));
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に文章を作ってください");
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
    const defaults = categoryDefaults[tool.category] || categoryDefaults["チャット"];
    el.incoming.value = templateText[button.dataset.template];
    el.purpose.value = defaults.purpose;
    el.detail.value = defaults.detail;
    el.relationship.value = button.dataset.template === "chat" ? "friend" : "work";
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

const defaults = categoryDefaults[tool.category] || categoryDefaults["チャット"];
el.purpose.value = defaults.purpose;
el.detail.value = defaults.detail;
generate();
