const state = {
  softness: "normal",
  length: "short",
};

const el = {
  sourceText: document.getElementById("sourceText"),
  target: document.getElementById("target"),
  purpose: document.getElementById("purpose"),
  note: document.getElementById("note"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  request: {
    sourceText: "早く確認してください。何度も同じことを言っています。",
    target: "work",
    purpose: "request",
    note: "今日中に確認してほしいが、急かしすぎたくない",
  },
  feedback: {
    sourceText: "この資料、前にも指摘したところが直っていません。",
    target: "work",
    purpose: "feedback",
    note: "修正してほしいが、責める感じにはしたくない",
  },
  remind: {
    sourceText: "まだ返事がありません。いつ対応できますか？",
    target: "client",
    purpose: "remind",
    note: "確認状況を知りたい",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function starter() {
  if (el.purpose.value === "feedback") return "確認ありがとうございます。";
  if (el.purpose.value === "remind") return "お忙しいところ恐れ入ります。";
  if (el.purpose.value === "decline") return "お声がけいただきありがとうございます。";
  if (el.purpose.value === "apology") return "ご迷惑をおかけして申し訳ありません。";
  return "恐れ入ります。";
}

function rewriteCore() {
  const source = el.sourceText.value.trim();
  const note = el.note.value.trim();

  if (el.purpose.value === "request") {
    if (state.softness === "very") return "お手すきの際にご確認いただけますと助かります。";
    if (state.softness === "light") return "お時間のあるときに確認をお願いします。";
    return "可能でしたら、本日中にご確認いただけますでしょうか。";
  }

  if (el.purpose.value === "feedback") {
    if (state.softness === "very") return "一点だけ、念のため再度確認いただきたい箇所があります。";
    if (state.softness === "light") return "前回お伝えした箇所について、もう一度確認をお願いします。";
    return "以前お伝えした箇所が一部残っているようでしたので、ご確認いただけますでしょうか。";
  }

  if (el.purpose.value === "remind") {
    if (state.softness === "very") return "行き違いでしたら申し訳ありません。状況だけ確認させていただけますと幸いです。";
    if (state.softness === "light") return "状況についてご返信いただけますでしょうか。";
    return "念のため、現在のご確認状況をお知らせいただけますでしょうか。";
  }

  if (el.purpose.value === "decline") {
    return "せっかくお声がけいただいたところ恐縮ですが、今回は見送らせていただけますと幸いです。";
  }

  if (el.purpose.value === "apology") {
    return "こちらの確認不足でご迷惑をおかけしました。今後は同じことがないよう注意いたします。";
  }

  return source || "相手に伝わりやすいよう、やわらかい表現に整えます。";
}

function closing() {
  if (state.length === "short") return "";
  if (state.length === "long") return "お手数をおかけしますが、何卒よろしくお願いいたします。";
  return "よろしくお願いいたします。";
}

function generate() {
  const parts = [starter(), "", rewriteCore()];
  const note = el.note.value.trim();
  if (note && state.length !== "short") parts.push("", `補足：${note}`);
  const end = closing();
  if (end) parts.push("", end);
  el.output.textContent = parts.join("\n");
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
    const sample = templates[button.dataset.template];
    el.sourceText.value = sample.sourceText;
    el.target.value = sample.target;
    el.purpose.value = sample.purpose;
    el.note.value = sample.note;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.sourceText.value = "";
  el.note.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.sourceText, el.target, el.purpose, el.note].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.sourceText.value = templates.request.sourceText;
el.note.value = templates.request.note;
generate();
