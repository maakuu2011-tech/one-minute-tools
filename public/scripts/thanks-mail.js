const state = {
  length: "medium",
};

const el = {
  scene: document.getElementById("scene"),
  recipient: document.getElementById("recipient"),
  thanksFor: document.getElementById("thanksFor"),
  detail: document.getElementById("detail"),
  nextStep: document.getElementById("nextStep"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  meeting: {
    scene: "meeting",
    recipient: "external",
    thanksFor: "本日の打ち合わせのお時間をいただいたこと",
    detail: "課題の整理方法について具体的にご説明いただき、とても参考になりました。",
    nextStep: "いただいた内容をもとに社内で確認し、改めてご連絡いたします。",
  },
  introduction: {
    scene: "introduction",
    recipient: "external",
    thanksFor: "ご担当者様をご紹介いただいたこと",
    detail: "こちらの状況を踏まえておつなぎいただき、大変助かりました。",
    nextStep: "先方へご連絡のうえ、進捗がありましたら改めてご報告いたします。",
  },
  support: {
    scene: "support",
    recipient: "internal",
    thanksFor: "急ぎの件に対応していただいたこと",
    detail: "短い時間の中で確認いただき、とても助かりました。",
    nextStep: "いただいた内容を反映して進めます。",
  },
};

const sceneText = {
  meeting: {
    subject: "本日のお打ち合わせのお礼",
    opening: "本日はお忙しいところ、お打ち合わせのお時間をいただきありがとうございました。",
  },
  interview: {
    subject: "本日の面談のお礼",
    opening: "本日はお忙しいところ、面談のお時間をいただきありがとうございました。",
  },
  introduction: {
    subject: "ご紹介のお礼",
    opening: "このたびはご紹介いただき、誠にありがとうございました。",
  },
  support: {
    subject: "ご対応のお礼",
    opening: "このたびはご対応いただき、ありがとうございました。",
  },
  gift: {
    subject: "お心遣いのお礼",
    opening: "このたびは温かいお心遣いをいただき、誠にありがとうございました。",
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
  if (state.length === "short") return "引き続き、よろしくお願いいたします。";
  if (state.length === "long") return "今後とも何卒よろしくお願い申し上げます。";
  return "引き続き、どうぞよろしくお願いいたします。";
}

function generate() {
  const scene = sceneText[el.scene.value];
  const thanksFor = el.thanksFor.value.trim();
  const detail = el.detail.value.trim();
  const nextStep = el.nextStep.value.trim();

  const parts = [
    `件名：${scene.subject}`,
    "",
    greeting(),
    "",
    scene.opening,
  ];

  if (thanksFor && state.length !== "short") {
    parts.push("", `${thanksFor}について、改めてお礼申し上げます。`);
  }

  if (detail) {
    parts.push("", detail);
  }

  if (nextStep) {
    parts.push("", nextStep);
  }

  if (state.length === "long") {
    parts.push("", "今後の進め方についても、引き続き丁寧に確認しながら対応してまいります。");
  }

  parts.push("", closing());
  el.output.textContent = parts.join("\n");
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先にお礼メールを作ってください");
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
    el.scene.value = sample.scene;
    el.recipient.value = sample.recipient;
    el.thanksFor.value = sample.thanksFor;
    el.detail.value = sample.detail;
    el.nextStep.value = sample.nextStep;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.thanksFor.value = "";
  el.detail.value = "";
  el.nextStep.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.scene, el.recipient, el.thanksFor, el.detail, el.nextStep].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.thanksFor.value = templates.meeting.thanksFor;
el.detail.value = templates.meeting.detail;
el.nextStep.value = templates.meeting.nextStep;
generate();
