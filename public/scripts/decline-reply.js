const state = {
  tone: "polite",
  length: "short",
};

const el = {
  incoming: document.getElementById("incoming"),
  scene: document.getElementById("scene"),
  relationship: document.getElementById("relationship"),
  reason: document.getElementById("reason"),
  alternative: document.getElementById("alternative"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  invitation: {
    scene: "invitation",
    relationship: "friend",
    incoming: "今週末の飲み会、来られそう？",
    reason: "先約があり参加が難しい",
    alternative: "また別の機会があればぜひ声をかけてほしい",
  },
  work: {
    scene: "work",
    relationship: "work",
    incoming: "今週中にこの資料もお願いできますか？",
    reason: "今週は別件の対応が詰まっていて追加対応が難しい",
    alternative: "来週以降であれば対応可否を確認できます",
  },
  sales: {
    scene: "sales",
    relationship: "unknown",
    incoming: "弊社サービスについて一度お打ち合わせできませんか？",
    reason: "現時点では導入予定がない",
    alternative: "必要になった際はこちらから連絡する",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function opener() {
  const casual = state.tone === "casual" && el.relationship.value === "friend";
  if (casual) return "誘ってくれてありがとう。";
  if (el.scene.value === "sales") return "ご連絡いただきありがとうございます。";
  if (el.scene.value === "work") return "ご相談いただきありがとうございます。";
  return "お声がけいただきありがとうございます。";
}

function declineLine() {
  const reason = el.reason.value.trim();
  const casual = state.tone === "casual" && el.relationship.value === "friend";
  if (casual) return reason ? `${reason}ので、今回は行けなさそう。` : "今回はちょっと難しそう。";
  if (state.tone === "soft") return reason ? `${reason}ため、今回は少し難しそうです。` : "申し訳ありませんが、今回は少し難しそうです。";
  return reason ? `${reason}ため、今回は対応が難しい状況です。` : "申し訳ありませんが、今回は対応が難しい状況です。";
}

function alternativeLine() {
  const value = el.alternative.value.trim();
  if (!value) return "";
  const casual = state.tone === "casual" && el.relationship.value === "friend";
  if (casual) return value;
  if (state.length === "short") return value;
  return `もし可能でしたら、${value}。`;
}

function closing() {
  const casual = state.tone === "casual" && el.relationship.value === "friend";
  if (casual) return "またタイミング合うときによろしく。";
  if (state.length === "long") return "せっかくお声がけいただいたところ恐縮ですが、何卒よろしくお願いいたします。";
  return "ご希望に添えず恐縮ですが、よろしくお願いいたします。";
}

function generate() {
  const parts = [opener(), "", declineLine()];
  const alternative = alternativeLine();
  if (alternative) parts.push("", alternative);
  if (state.length === "long") parts.push("", "また機会がございましたら、ぜひご相談いただけますと幸いです。");
  parts.push("", closing());
  el.output.textContent = parts.join("\n");
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に断り文を作ってください");
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
    el.relationship.value = sample.relationship;
    el.incoming.value = sample.incoming;
    el.reason.value = sample.reason;
    el.alternative.value = sample.alternative;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.incoming.value = "";
  el.reason.value = "";
  el.alternative.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.incoming, el.scene, el.relationship, el.reason, el.alternative].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.incoming.value = templates.invitation.incoming;
el.reason.value = templates.invitation.reason;
el.alternative.value = templates.invitation.alternative;
generate();
