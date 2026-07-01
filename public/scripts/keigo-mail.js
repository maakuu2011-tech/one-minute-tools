const state = {
  politeness: "normal",
  length: "medium",
};

const el = {
  incoming: document.getElementById("incoming"),
  purpose: document.getElementById("purpose"),
  relationship: document.getElementById("relationship"),
  details: document.getElementById("details"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const examples = {
  estimate: {
    incoming: "先日ご相談した件ですが、今週中にお見積りをいただくことは可能でしょうか。",
    purpose: "accept",
    relationship: "external",
    details: "本日中に内容を確認し、明日午前中までに見積書を送付する",
  },
  meeting: {
    incoming: "来週どこかで打ち合わせのお時間をいただけますでしょうか。",
    purpose: "ask",
    relationship: "external",
    details: "火曜14時、水曜10時、木曜16時のいずれかで都合を確認したい",
  },
  apology: {
    incoming: "依頼していた資料の共有状況はいかがでしょうか。",
    purpose: "apology",
    relationship: "external",
    details: "確認に時間がかかっており、明日正午までに共有する",
  },
};

const purposeText = {
  accept: {
    subject: "ご依頼の件",
    body: "ご連絡いただきありがとうございます。\nご依頼の件、承知いたしました。",
  },
  delay: {
    subject: "ご依頼の件",
    body: "ご連絡いただきありがとうございます。\n恐れ入りますが、確認に少々お時間をいただけますでしょうか。",
  },
  decline: {
    subject: "ご依頼の件",
    body: "ご連絡いただきありがとうございます。\n大変恐縮ではございますが、今回は対応が難しい状況です。",
  },
  ask: {
    subject: "ご確認のお願い",
    body: "ご連絡いただきありがとうございます。\n対応にあたり、いくつか確認させていただけますでしょうか。",
  },
  apology: {
    subject: "お詫びとご報告",
    body: "ご連絡いただきありがとうございます。\nこのたびは対応が遅くなっており、申し訳ございません。",
  },
  thanks: {
    subject: "御礼",
    body: "ご連絡いただきありがとうございます。\nご対応いただき、誠にありがとうございます。",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function greeting() {
  const relation = el.relationship.value;
  if (relation === "boss" || relation === "colleague") return "お疲れさまです。";
  return "いつもお世話になっております。";
}

function closing() {
  if (state.politeness === "formal") return "何卒よろしくお願い申し上げます。";
  if (state.politeness === "soft") return "どうぞよろしくお願いいたします。";
  return "よろしくお願いいたします。";
}

function soften(text) {
  if (state.politeness === "formal") {
    return text
      .replaceAll("以下の内容で進めます。", "以下の内容にて進めさせていただきます。")
      .replaceAll("送る", "送付いたします");
  }
  if (state.politeness === "soft") {
    return text.replaceAll("恐れ入りますが、", "お手数ですが、");
  }
  return text;
}

function detailsBlock() {
  const details = el.details.value.trim();
  if (!details) return "";
  const prefix = state.politeness === "formal" ? "以下の内容にて進めさせていただきます。" : "以下の内容で進めます。";
  return `${prefix}\n\n${details}`;
}

function extractTopic() {
  const text = el.incoming.value.trim();
  if (!text) return purposeText[el.purpose.value].subject;
  if (text.includes("見積")) return "お見積りの件";
  if (text.includes("打ち合わせ") || text.includes("日程")) return "お打ち合わせの件";
  if (text.includes("資料")) return "資料共有の件";
  if (text.includes("確認")) return "ご確認の件";
  return purposeText[el.purpose.value].subject;
}

function generate() {
  const purpose = purposeText[el.purpose.value];
  const subject = extractTopic();
  const bodyParts = [
    `件名: ${subject}`,
    "",
    greeting(),
    "",
    purpose.body,
  ];

  const detail = detailsBlock();
  if (detail) bodyParts.push("", detail);

  if (el.purpose.value === "delay") bodyParts.push("", "確認でき次第、改めてご連絡いたします。");
  if (el.purpose.value === "decline") bodyParts.push("", "ご期待に沿えず恐縮ですが、何卒ご理解いただけますと幸いです。");
  if (el.purpose.value === "ask") bodyParts.push("", "ご確認いただけますと幸いです。");
  if (state.length === "long") bodyParts.push("", "不足している点がございましたら、お知らせください。確認のうえ対応いたします。");

  bodyParts.push("", closing());
  let output = bodyParts.join("\n");

  if (state.length === "short") {
    output = output
      .replace("\n\n不足している点がございましたら、お知らせください。確認のうえ対応いたします。", "")
      .replace("\n\nご確認いただけますと幸いです。", "");
  }

  el.output.textContent = soften(output);
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
    const sample = examples[button.dataset.template];
    el.incoming.value = sample.incoming;
    el.purpose.value = sample.purpose;
    el.relationship.value = sample.relationship;
    el.details.value = sample.details;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.incoming.value = "";
  el.details.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.incoming, el.purpose, el.relationship, el.details].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.incoming.value = examples.estimate.incoming;
el.details.value = examples.estimate.details;
generate();
