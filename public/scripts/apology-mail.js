const state = {
  length: "medium",
};

const el = {
  situation: document.getElementById("situation"),
  recipient: document.getElementById("recipient"),
  whatHappened: document.getElementById("whatHappened"),
  nextAction: document.getElementById("nextAction"),
  prevention: document.getElementById("prevention"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  lateReply: {
    situation: "lateReply",
    recipient: "external",
    whatHappened: "ご連絡への返信が遅くなってしまいました。",
    nextAction: "いただいた内容を確認し、本日中に改めてご連絡いたします。",
    prevention: "今後は確認のタイミングを見直し、早めの返信を徹底いたします。",
  },
  delay: {
    situation: "delay",
    recipient: "external",
    whatHappened: "ご依頼いただいた資料の送付が予定より遅れております。",
    nextAction: "本日18時までに内容を確認し、修正版をお送りいたします。",
    prevention: "進行管理と確認手順を見直し、同様の遅れが起きないよう注意いたします。",
  },
  attachment: {
    situation: "attachment",
    recipient: "external",
    whatHappened: "先ほどのメールに資料を添付し忘れておりました。",
    nextAction: "本メールにて、改めて資料を添付いたします。",
    prevention: "送信前の添付確認を徹底し、再発防止に努めます。",
  },
};

const situationText = {
  lateReply: {
    subject: "返信遅れのお詫び",
    apology: "ご返信が遅くなり、誠に申し訳ございません。",
  },
  delay: {
    subject: "対応遅延のお詫び",
    apology: "予定より対応が遅れており、誠に申し訳ございません。",
  },
  mistake: {
    subject: "内容誤りのお詫び",
    apology: "こちらの確認不足により誤りがありましたこと、深くお詫び申し上げます。",
  },
  attachment: {
    subject: "添付漏れのお詫び",
    apology: "添付漏れがありましたこと、心よりお詫び申し上げます。",
  },
  schedule: {
    subject: "日程変更のお願いとお詫び",
    apology: "こちらの都合によりご迷惑をおかけし、誠に申し訳ございません。",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function greeting() {
  if (el.recipient.value === "boss" || el.recipient.value === "internal") {
    return "お疲れさまです。";
  }
  return "いつもお世話になっております。";
}

function closing() {
  if (state.length === "short") return "よろしくお願いいたします。";
  if (state.length === "long") return "このたびはご迷惑をおかけしましたこと、重ねてお詫び申し上げます。何卒よろしくお願い申し上げます。";
  return "ご迷惑をおかけし恐縮ですが、何卒よろしくお願いいたします。";
}

function sentence(text) {
  const value = text.trim();
  if (!value) return "";
  return /[。！？!?]$/.test(value) ? value : `${value}。`;
}

function generate() {
  const situation = situationText[el.situation.value];
  const happened = el.whatHappened.value.trim();
  const action = el.nextAction.value.trim();
  const prevention = el.prevention.value.trim();

  const parts = [
    `件名：${situation.subject}`,
    "",
    greeting(),
  ];

  if (happened) parts.push("", sentence(happened));
  parts.push(happened ? situation.apology : `このたびは、${situation.apology}`);
  if (action) parts.push("", sentence(action));
  if (prevention && state.length !== "short") parts.push("", sentence(prevention));

  if (state.length === "long" && !prevention) {
    parts.push("", "今後は同様のことがないよう、確認と共有を徹底してまいります。");
  }

  parts.push("", closing());
  el.output.textContent = parts.join("\n");
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に謝罪文を作ってください");
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
    el.situation.value = sample.situation;
    el.recipient.value = sample.recipient;
    el.whatHappened.value = sample.whatHappened;
    el.nextAction.value = sample.nextAction;
    el.prevention.value = sample.prevention;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.whatHappened.value = "";
  el.nextAction.value = "";
  el.prevention.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.situation, el.recipient, el.whatHappened, el.nextAction, el.prevention].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.whatHappened.value = templates.lateReply.whatHappened;
el.nextAction.value = templates.lateReply.nextAction;
el.prevention.value = templates.lateReply.prevention;
generate();
