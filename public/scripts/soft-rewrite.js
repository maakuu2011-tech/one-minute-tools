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
    sourceText: "ここが間違っています。すぐ直してください。",
    target: "work",
    purpose: "feedback",
    note: "修正してほしいが、責める感じにはしたくない",
  },
  remind: {
    sourceText: "まだ返事がありません。いつ対応できますか？",
    target: "client",
    purpose: "remind",
    note: "確認状況と対応できる時期を知りたい",
  },
};

const formalReplacements = [
  ["何度も同じことを言っています", "以前にもお伝えしている内容となりますので、念のためご確認をお願いいたします"],
  ["前にも言いました", "以前にもお伝えしている内容となりますので、念のためご確認をお願いいたします"],
  ["まだ返事がありません", "行き違いでしたら申し訳ありません。現在のご返信状況を確認させてください"],
  ["まだですか", "現在のご状況をお知らせいただけますでしょうか"],
  ["いつ対応できますか", "ご対応可能な時期をお知らせいただけますでしょうか"],
  ["ここが間違っています", "こちらの箇所について、一部確認が必要なようです"],
  ["間違っています", "一部確認が必要な箇所があるようです"],
  ["できていません", "まだ確認できていない箇所があるようです"],
  ["このやり方では困ります", "現在の方法では対応が難しい状況です"],
  ["困ります", "対応が難しい状況です"],
  ["別の方法でやってください", "別の進め方について一度ご相談できますでしょうか"],
  ["すぐ直してください", "可能でしたら早めにご修正いただけますでしょうか"],
  ["確認してください", "ご確認いただけますでしょうか"],
  ["修正してください", "ご修正いただけますでしょうか"],
  ["返信してください", "ご返信いただけますでしょうか"],
  ["連絡してください", "ご連絡いただけますでしょうか"],
  ["提出してください", "ご提出いただけますでしょうか"],
  ["対応してください", "ご対応いただけますでしょうか"],
  ["送ってください", "お送りいただけますでしょうか"],
  ["教えてください", "お知らせいただけますでしょうか"],
  ["待ってください", "お待ちいただけますでしょうか"],
  ["見てください", "ご確認いただけますでしょうか"],
  ["やってください", "ご対応いただけますでしょうか"],
  ["必ず", ""],
  ["ちゃんと", "念のため"],
  ["早く", "可能でしたら早めに"],
  ["すぐに", "可能でしたら早めに"],
  ["すぐ", "可能でしたら早めに"],
  ["あなたのミスです", "確認の過程で行き違いがあったようです"],
  ["なぜできないのですか", "難しい事情がございましたらお知らせください"],
];

const casualReplacements = [
  ["何度も同じことを言っています", "前にも伝えた内容だから、もう一度確認してもらえると助かる"],
  ["まだ返事がありません", "まだ返事を確認できていないんだけど"],
  ["まだですか", "今どんな状況か教えてもらえる？"],
  ["いつ対応できますか", "いつごろ対応できそう？"],
  ["ここが間違っています", "ここだけ少し確認してもらいたいところがあるよ"],
  ["間違っています", "少し確認してもらいたいところがあるよ"],
  ["このやり方では困ります", "今のやり方だと少し難しそう"],
  ["別の方法でやってください", "別のやり方を一緒に考えてもらえる？"],
  ["すぐ直してください", "できれば早めに直してもらえる？"],
  ["確認してください", "確認してもらえる？"],
  ["修正してください", "直してもらえる？"],
  ["返信してください", "返信してもらえる？"],
  ["連絡してください", "連絡してもらえる？"],
  ["対応してください", "対応してもらえる？"],
  ["送ってください", "送ってもらえる？"],
  ["教えてください", "教えてもらえる？"],
  ["待ってください", "少し待ってもらえる？"],
  ["見てください", "見てもらえる？"],
  ["やってください", "対応してもらえる？"],
  ["早く", "できれば早めに"],
  ["すぐ", "できれば早めに"],
  ["必ず", "できれば"],
  ["ちゃんと", "念のため"],
];

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function normalizeText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/。{2,}/g, "。")
    .trim();
}

function replaceAll(text, replacements) {
  return replacements.reduce(
    (result, [before, after]) => result.split(before).join(after),
    text,
  );
}

function extractDeadline(note) {
  const match = note.match(
    /(本日中|今日中|明日中|明日まで|今週中|今週末まで|\d{1,2}月\d{1,2}日まで|\d{1,2}日まで)/,
  );
  if (!match) return "";
  if (match[1] === "今日中") return "本日中";
  return match[1];
}

function deadlineAdverb(deadline) {
  if (!deadline) return "";
  if (deadline.endsWith("まで")) return `${deadline}に`;
  return `${deadline}に`;
}

function applyDeadline(text, deadline) {
  if (!deadline || text.includes(deadline)) return text;
  const timing = deadlineAdverb(deadline);
  if (text.includes("可能でしたら早めに")) {
    return text.replace("可能でしたら早めに", `可能でしたら、${timing}`);
  }
  if (text.includes("できれば早めに")) {
    return text.replace("できれば早めに", `できれば、${timing}`);
  }
  return text;
}

function cleanPunctuation(text) {
  return text
    .replace(/？[。？]+/g, "？")
    .replace(/！[。！]+/g, "！")
    .replace(/。{2,}/g, "。");
}

function softenFormal(text) {
  let result = replaceAll(text, formalReplacements);

  result = result
    .replace(/([^\s。！？、]{1,20})してください/g, "$1していただけますでしょうか")
    .replace(/([^\s。！？、]{1,20})しなさい/g, "$1していただけますでしょうか")
    .replace(/([^\s。！？、]{1,20})しろ/g, "$1していただけますでしょうか")
    .replace(/([^\s。！？、]{1,20})ないでください/g, "$1ないようお願いいたします")
    .replace(/可能でしたら早めに可能でしたら早めに/g, "可能でしたら早めに")
    .replace(/可能でしたら早めに、?/g, "可能でしたら早めに")
    .replace(/、、+/g, "、");

  if (state.softness === "light") {
    result = result
      .replace(/ご確認いただけますでしょうか/g, "ご確認をお願いします")
      .replace(/ご修正いただけますでしょうか/g, "ご修正をお願いします")
      .replace(/ご返信いただけますでしょうか/g, "ご返信をお願いします")
      .replace(/ご対応いただけますでしょうか/g, "ご対応をお願いします");
  }

  if (state.softness === "very") {
    result = result
      .replace(/可能でしたら/g, "差し支えなければ")
      .replace(/ご確認いただけますでしょうか/g, "ご確認いただけますと幸いです")
      .replace(/ご修正いただけますでしょうか/g, "ご修正いただけますと幸いです")
      .replace(/ご返信いただけますでしょうか/g, "ご返信いただけますと幸いです");
  }

  return result;
}

function softenCasual(text) {
  let result = replaceAll(text, casualReplacements);
  result = result
    .replace(/([^\s。！？、]{1,20})してください/g, "$1してもらえる？")
    .replace(/([^\s。！？、]{1,20})しなさい/g, "$1してもらえる？")
    .replace(/([^\s。！？、]{1,20})しろ/g, "$1してもらえる？")
    .replace(/できれば早めにできれば早めに/g, "できれば早めに");

  if (state.softness === "very") {
    result = result.replace(/できれば/g, "無理のない範囲で");
  }

  return result;
}

function greeting() {
  if (el.target.value === "friend") return "";
  if (el.target.value === "work") return "お疲れさまです。";
  if (el.target.value === "boss") return "お忙しいところ恐れ入ります。";
  return "お世話になっております。";
}

function contextLine() {
  if (el.target.value === "friend") return "";
  if (el.purpose.value === "feedback") return "認識違いでしたら申し訳ありません。";
  if (el.purpose.value === "remind") return "すでにご対応済みでしたら、行き違いをご容赦ください。";
  if (el.purpose.value === "decline") return "せっかくお声がけいただいたところ恐縮ですが、";
  if (el.purpose.value === "apology") return "こちらの確認不足により、ご迷惑をおかけしました。";
  return "ご都合もあるかと存じますので、難しい場合はお知らせください。";
}

function closing() {
  if (state.length === "short") return "";
  if (el.target.value === "friend") return "確認してもらえると助かります。";
  if (state.length === "long") return "お手数をおかけしますが、何卒よろしくお願いいたします。";
  return "よろしくお願いいたします。";
}

function buildResult() {
  const source = normalizeText(el.sourceText.value);
  if (!source) return "";

  const deadline = extractDeadline(el.note.value);
  const softened =
    el.target.value === "friend" ? softenCasual(source) : softenFormal(source);
  const core = cleanPunctuation(applyDeadline(softened, deadline));

  if (state.length === "short") return core;

  const parts = [greeting()];
  if (state.length === "long") parts.push(contextLine());
  parts.push(core, closing());

  return parts
    .filter(Boolean)
    .filter((part, index, items) => index === 0 || part !== items[index - 1])
    .join("\n\n");
}

function generate() {
  const result = buildResult();
  el.output.textContent = result || "左側に言い換えたい文章を入力してください。";
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text || !el.sourceText.value.trim()) {
    showToast("先に文章を入力してください");
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
