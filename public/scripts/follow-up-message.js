const state = {
  tone: "gentle",
  length: "short",
};

const el = {
  target: document.getElementById("target"),
  scene: document.getElementById("scene"),
  relationship: document.getElementById("relationship"),
  deadline: document.getElementById("deadline"),
  note: document.getElementById("note"),
  output: document.getElementById("output"),
  toast: document.getElementById("toast"),
};

const templates = {
  reply: {
    scene: "reply",
    relationship: "work",
    target: "先日お送りした資料について、確認状況を知りたい",
    deadline: "可能であれば本日中に返信がほしい",
    note: "行き違いでしたら申し訳ありません",
  },
  client: {
    scene: "check",
    relationship: "client",
    target: "見積書の内容について、ご確認状況を伺いたい",
    deadline: "今週金曜までに方向性を確認したい",
    note: "追加で必要な情報があればすぐに送ります",
  },
  boss: {
    scene: "approval",
    relationship: "boss",
    target: "申請内容の承認状況を確認したい",
    deadline: "本日中に次の作業へ進めたい",
    note: "お忙しいところ恐縮ですが、確認をお願いしたい",
  },
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 1700);
}

function opener() {
  if (el.relationship.value === "boss") return "お疲れさまです。";
  if (state.tone === "firm") return "お世話になっております。";
  return "お忙しいところ恐れ入ります。";
}

function requestLine() {
  const target = el.target.value.trim();
  const base = target || "先日ご相談していた件";
  if (state.tone === "gentle") return `${base}について、念のため確認させていただけますでしょうか。`;
  if (state.tone === "firm") return `${base}について、ご確認状況をお知らせいただけますでしょうか。`;
  return `${base}について、確認させてください。`;
}

function deadlineLine() {
  const value = el.deadline.value.trim();
  if (!value) return "";
  if (state.tone === "gentle") return `もし可能でしたら、${value}。`;
  return value;
}

function noteLine() {
  const value = el.note.value.trim();
  if (!value) return state.tone === "gentle" ? "行き違いでしたら申し訳ありません。" : "";
  return value;
}

function closing() {
  if (state.length === "long") return "お手数をおかけしますが、何卒よろしくお願い申し上げます。";
  return "お手数ですが、よろしくお願いいたします。";
}

function generate() {
  const parts = [opener(), "", requestLine()];
  const deadline = deadlineLine();
  const note = noteLine();
  if (deadline) parts.push("", deadline);
  if (state.length !== "short" && note) parts.push("", note);
  if (state.length === "long") parts.push("", "こちらで対応できることがありましたら、すぐに進めます。");
  parts.push("", closing());
  el.output.textContent = parts.join("\n");
}

async function copyOutput() {
  const text = el.output.textContent.trim();
  if (!text) {
    showToast("先に催促文を作ってください");
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
    el.target.value = sample.target;
    el.deadline.value = sample.deadline;
    el.note.value = sample.note;
    generate();
  });
});

document.getElementById("generateBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("clearBtn").addEventListener("click", () => {
  el.target.value = "";
  el.deadline.value = "";
  el.note.value = "";
  el.output.textContent = "";
  showToast("クリアしました");
});

[el.target, el.scene, el.relationship, el.deadline, el.note].forEach((input) => {
  input.addEventListener("input", generate);
  input.addEventListener("change", generate);
});

el.target.value = templates.reply.target;
el.deadline.value = templates.reply.deadline;
el.note.value = templates.reply.note;
generate();
