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
  "断り方": { purpose: "decline", detail: "今回は対応が難しいため、失礼のない形で断りたい。" },
  "催促": { purpose: "remind", detail: "確認状況を知りたいので、返信をお願いしたい。" },
  "言い換え": { purpose: "rewrite", detail: "相手にきつく見えない、やわらかい表現にしたい。" },
  "謝罪": { purpose: "apology", detail: "迷惑をかけたことを謝り、次の対応を伝えたい。" },
  "お礼": { purpose: "thanks", detail: "対応してもらったことへの感謝と、次の対応を伝えたい。" },
  "チャット": { purpose: "reply", detail: "短く自然に返したい。" },
  "日程調整": { purpose: "request", detail: "候補日を伝えて、都合の良い日時を確認したい。" },
  "依頼": { purpose: "request", detail: "無理のない範囲で対応をお願いしたい。" },
  "連絡": { purpose: "reply", detail: "状況と次の対応を、簡潔に伝えたい。" },
  "返信": { purpose: "reply", detail: "問い合わせへの返信として、丁寧に対応したい。" },
  "報告": { purpose: "report", detail: "現在の状況、影響、次にやることを簡潔に報告したい。" },
  "メール": { purpose: "reply", detail: "用件が伝わるよう、丁寧なメール文にしたい。" },
};

const templateText = {
  work: "ご相談いただいた件について、状況を確認したうえで返信したいです。",
  chat: "相手から急ぎで返事がほしいと言われています。",
  careful: "失礼がないよう、少し丁寧な文章にしたいです。",
};

const relationshipLabels = {
  work: "仕事相手",
  boss: "上司",
  client: "取引先",
  customer: "お客様",
  friend: "友達",
  unknown: "まだ関係が浅い相手",
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function defaultSubject() {
  if (tool.id.includes("health")) return "本日の勤務について";
  if (tool.id.includes("late-arrival")) return "到着遅れのご連絡";
  if (tool.id.includes("paid-leave")) return "休暇取得のご相談";
  if (tool.id.includes("document-send")) return "資料送付のご連絡";
  if (tool.id.includes("estimate")) return "お見積もりのお願い";
  if (tool.id.includes("handover")) return "引き継ぎ事項";
  if (tool.id.includes("trouble")) return "状況のご報告";
  if (tool.category === "催促") return "ご確認のお願い";
  if (tool.category === "お礼") return "お礼";
  if (tool.category === "謝罪") return "お詫び";
  if (tool.category === "依頼") return "お願い";
  if (tool.category === "報告") return "進捗のご報告";
  if (tool.category === "日程調整") return "日程調整のお願い";
  return tool.title.replace("メーカー", "").replace("ツール", "");
}

function isChatLike() {
  return ["チャット", "断り方", "言い換え", "連絡"].includes(tool.category) && el.relationship.value === "friend";
}

function opener(purpose) {
  const friend = el.relationship.value === "friend";
  const casual = state.tone === "casual" || friend;
  if (casual) {
    return {
      reply: "連絡ありがとう。",
      decline: "誘ってくれてありがとう。",
      request: "ちょっとお願いがあります。",
      remind: "念のため確認させてください。",
      thanks: "対応してくれてありがとう。",
      apology: "連絡が遅くなってごめんなさい。",
      report: "今の状況を共有します。",
      rewrite: "",
    }[purpose];
  }
  return {
    reply: "ご連絡いただきありがとうございます。",
    decline: "お声がけいただきありがとうございます。",
    request: "お忙しいところ恐れ入ります。",
    remind: "お忙しいところ恐れ入ります。念のため確認させてください。",
    thanks: "このたびはご対応いただき、ありがとうございます。",
    apology: "このたびはご迷惑をおかけし、申し訳ございません。",
    report: "現在の状況についてご報告いたします。",
    rewrite: "",
  }[purpose];
}

function closing() {
  const friend = el.relationship.value === "friend";
  if (friend || state.tone === "casual") {
    if (state.length === "short") return "";
    return "また確認して連絡します。";
  }
  if (state.length === "short") return "よろしくお願いいたします。";
  if (state.length === "medium") return "お手数をおかけしますが、よろしくお願いいたします。";
  return "お忙しいところ恐れ入りますが、何卒よろしくお願い申し上げます。";
}

function soften(text) {
  let result = text;
  if (state.tone === "soft") {
    result = result
      .replaceAll("対応が難しいです", "対応が少し難しい状況です")
      .replaceAll("確認してください", "ご確認いただけますと幸いです")
      .replaceAll("お願いします", "お願いいたします")
      .replaceAll("できません", "難しい状況です");
  }
  if (state.tone === "casual" || el.relationship.value === "friend") {
    result = result
      .replaceAll("ご連絡いただきありがとうございます。", "連絡ありがとう。")
      .replaceAll("申し訳ございません", "ごめんなさい")
      .replaceAll("恐れ入ります。", "")
      .replaceAll("よろしくお願いいたします。", "よろしくお願いします。");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

function rewriteOriginal(incoming, detail) {
  const base = incoming || detail || "伝えたい内容を、相手に配慮した表現に整えたいです。";
  return cleanText(base)
    .replaceAll("早く", "可能でしたら早めに")
    .replaceAll("してください", "していただけますでしょうか")
    .replaceAll("できません", "対応が難しい状況です")
    .replaceAll("無理です", "今回は難しい状況です")
    .replaceAll("ちゃんと", "念のため")
    .replaceAll("なぜ", "差し支えなければ、理由を");
}

function splitSentences(value) {
  return cleanText(value)
    .split(/[。！？!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function politeSentence(sentence) {
  let text = sentence.trim();
  text = text
    .replaceAll("返信してほしい", "ご返信いただけますでしょうか")
    .replaceAll("確認してほしい", "ご確認いただけますでしょうか")
    .replaceAll("送ってほしい", "お送りいただけますでしょうか")
    .replaceAll("してほしい", "していただけますでしょうか")
    .replaceAll("してもらいたい", "していただけますでしょうか")
    .replaceAll("教えてほしい", "教えていただけますでしょうか")
    .replaceAll("お願いしたい", "お願いできますでしょうか")
    .replaceAll("やってほしい", "ご対応いただけますでしょうか")
    .replaceAll("問題があれば", "問題がございましたら")
    .replaceAll("不明点があれば", "不明点がございましたら")
    .replaceAll("急がせすぎず、", "")
    .replaceAll("急がせず、", "");

  if (/(明日中|本日中|今日中|今週中|来週中|午前中|午後中)/.test(text) && !/いただけ|ください|でしょうか|幸いです/.test(text)) {
    text = `${text}ご確認いただけますでしょうか`;
  }

  if (!/[。！？!?]$/.test(text)) text += "。";
  return text;
}

function humanizeCore(source, purpose) {
  const sentences = splitSentences(source);
  if (!sentences.length) return "";

  if (purpose === "request") {
    const result = sentences.map(politeSentence);
    if (!result.some((line) => line.includes("幸いです") || line.includes("お願いいたします"))) {
      result.push("ご都合のよいタイミングでご対応いただけますと幸いです。");
    }
    return result;
  }

  if (purpose === "remind") {
    return sentences.map((sentence) => {
      const text = politeSentence(sentence);
      return text.includes("確認") ? text : `念のため、${text}`;
    });
  }

  if (purpose === "apology") {
    return sentences.map((sentence) => {
      const text = politeSentence(sentence);
      return text.includes("申し訳") || text.includes("お詫び") ? text : `${text.replace(/。$/, "")}。申し訳ございません。`;
    });
  }

  if (purpose === "report") {
    return sentences.map((sentence) => politeSentence(sentence));
  }

  return sentences.map(politeSentence);
}

function bodyLines(purpose, incoming, detail) {
  const defaultDetail = (categoryDefaults[tool.category] || categoryDefaults["チャット"]).detail;
  const userDetail = detail && detail !== defaultDetail ? detail : "";
  const core = userDetail || incoming || detail || "用件について確認したうえで、あらためてご連絡します。";
  const polishedCore = humanizeCore(core, purpose);
  const conciseCore = polishedCore.length ? polishedCore.join("\n") : cleanText(core);

  if (purpose === "rewrite") {
    return [rewriteOriginal(incoming, detail)];
  }

  if (purpose === "decline") {
    const reason = userDetail || incoming || "今回は都合が合わず、対応が難しい状況です。";
    const polishedReason = humanizeCore(reason, "decline").join("\n");
    return state.length === "short"
      ? [polishedReason, "また機会がありましたら、ぜひお願いいたします。"]
      : [
          polishedReason,
          "せっかくお声がけいただいたところ恐縮ですが、今回は見送らせていただけますと幸いです。",
          "また別の機会がありましたら、ぜひお願いいたします。",
        ];
  }

  if (purpose === "remind") {
    return state.length === "short"
      ? [conciseCore, "可能な範囲でご確認いただけますでしょうか。"]
      : [
          conciseCore,
          "行き違いでしたら申し訳ありません。",
          "お手すきの際に、現在の状況だけでもご共有いただけますと助かります。",
        ];
  }

  if (purpose === "apology") {
    return state.length === "short"
      ? [conciseCore, "今後は同じことがないよう注意いたします。"]
      : [conciseCore, "現在、必要な対応を進めております。", "今後は確認を徹底し、再発防止に努めます。"];
  }

  if (purpose === "thanks") {
    return state.length === "short"
      ? [conciseCore || "ご対応いただき、大変助かりました。"]
      : [conciseCore || "ご対応いただき、大変助かりました。", "引き続き、どうぞよろしくお願いいたします。"];
  }

  if (purpose === "request") {
    const follow = conciseCore.includes("いただけますでしょうか")
      ? ""
      : "可能でしたらご対応をお願いいたします。";
    return state.length === "short"
      ? [conciseCore, follow]
      : [
          conciseCore,
          "ご都合のよいタイミングでご確認いただけますと幸いです。",
        ];
  }

  if (purpose === "report") {
    return state.length === "short"
      ? [conciseCore]
      : [conciseCore, "現時点で大きな懸念があれば、あわせて共有いたします。", "次の対応が決まり次第、続けてご報告します。"];
  }

  return state.length === "short"
    ? [conciseCore]
    : [conciseCore, "確認が必要な点があれば、あらためて共有いたします。"];
}

function generate() {
  const purpose = el.purpose.value;
  const incoming = cleanText(el.incoming.value);
  const detail = cleanText(el.detail.value);
  const lines = [];

  if (!isChatLike()) {
    lines.push(`件名：${defaultSubject()}`, "");
  }

  const first = opener(purpose);
  if (first) lines.push(first);

  const bodies = bodyLines(purpose, incoming, detail);
  bodies.forEach((line) => {
    if (!line) return;
    lines.push("", line);
  });

  const end = closing();
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
