// classifyMessage() và DF_REASON nằm trong classify.js (được nạp trước file này trong popup.html)
const KEY = "dfState";
const DRAFT = "dfDraft";
const $ = (id) => document.getElementById(id);
const PATTERNS = [
  "https://redeem.df.garena.sg/*",
  "https://*.playdeltaforce.com/*cdkgarena*",
  "https://*.garena.com/*cdkgarena*",
];
const REDEEM_URL = "https://redeem.df.garena.sg/vi/cdkgarena.html";
const NEED_PAGE = "Đã tạm dừng: chưa mở trang đổi quà Delta Force. Hãy mở trang rồi bấm Tiếp tục.";

const GROUPS = {
  success: { label: "Thành công", file: "code-thanh-cong.txt" },
  invalid: { label: "Không hợp lệ", file: "code-khong-hop-le.txt" }, // gồm: sai mã, đã dùng, hết hạn, không rõ...
};
const FIELDS = ["delayMin", "delayMax", "cooldown", "maxRetry", "inputSelector", "buttonSelector"];

let currentTab = "success";
let lastState = null;
let connected = false;

const getState = async () => (await chrome.storage.local.get(KEY))[KEY];
const setState = (s) => chrome.storage.local.set({ [KEY]: s });
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
};

// Chỉ 2 nhóm: thành công, còn lại coi là không hợp lệ (lý do chi tiết xem ở nhật ký)
const groupOf = (r) => (classifyMessage(r.msg || "") === "success" ? "success" : "invalid");
const reasonOf = (r) => DF_REASON[classifyMessage(r.msg || "")] || "Không rõ";
const codesOf = (s, key) => (s ? s.results.filter((r) => groupOf(r) === key).map((r) => r.code) : []);

function pushLog(s, level, text) {
  s.log = s.log || [];
  s.log.push({ ts: Date.now(), level, text });
  if (s.log.length > 300) s.log.splice(0, s.log.length - 300);
}

function parseCodes(raw) {
  const list = raw.split(/[\s,;]+/).map((c) => c.trim()).filter((c) => c.length >= 4);
  return [...new Set(list)];
}

function readSettings() {
  const num = (id, def, min) => Math.max(min, Number($(id).value) || def);
  const delayMin = num("delayMin", 4, 1);
  return {
    delayMin,
    delayMax: Math.max(delayMin, num("delayMax", 8, 1)),
    cooldown: num("cooldown", 30, 5),
    maxRetry: Math.max(0, Number($("maxRetry").value) || 0),
    inputSelector: $("inputSelector").value.trim(),
    buttonSelector: $("buttonSelector").value.trim(),
  };
}

function showNote(msg, warn) {
  $("note").textContent = msg;
  $("note").className = warn ? "warn" : "";
}

function downloadFile(name, content, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Lưu nháp (mở lại popup vẫn còn danh sách code, cài đặt, tab đang xem) ----------
function saveDraft() {
  const fields = {};
  FIELDS.forEach((k) => (fields[k] = $(k).value));
  return chrome.storage.local.set({ [DRAFT]: { codes: $("codes").value, fields, tab: currentTab } });
}

function restoreDraft(d) {
  $("codes").value = d.codes || "";
  FIELDS.forEach((k) => {
    if (d.fields && d.fields[k] !== undefined) $(k).value = d.fields[k];
  });
  if (GROUPS[d.tab]) currentTab = d.tab;
}

// ---------- Kiểm tra trang đổi quà đã mở chưa ----------
async function findRedeemTab() {
  let [t] = await chrome.tabs.query({ url: PATTERNS, active: true, currentWindow: true });
  if (!t) [t] = await chrome.tabs.query({ url: PATTERNS });
  return t || null;
}

async function refreshConn() {
  connected = !!(await findRedeemTab());
  const chip = $("chip");
  chip.textContent = connected ? "Đã mở trang" : "Chưa mở trang";
  chip.className = "chip " + (connected ? "on" : "off");
  $("banner").classList.toggle("show", !connected);

  // đang chạy mà mất trang -> tự tạm dừng
  const s = await getState();
  if (s && s.running && !connected) {
    s.running = false;
    s.note = NEED_PAGE;
    pushLog(s, "warn", NEED_PAGE);
    await setState(s);
  }
}

let connTimer = null;
const refreshConnSoon = () => {
  clearTimeout(connTimer);
  connTimer = setTimeout(refreshConn, 250);
};

// ---------- Điều khiển ----------
async function launch() {
  const s = await getState();
  if (!s) return;
  const tab = await findRedeemTab();
  if (!tab) {
    s.running = false;
    s.note = NEED_PAGE;
    pushLog(s, "warn", NEED_PAGE);
    await setState(s);
    return refreshConn();
  }
  s.running = true;
  s.finished = false;
  s.settings = readSettings();
  s.note = "Đang chạy...";
  pushLog(s, "info", s.idx ? `Tiếp tục từ code ${s.idx + 1}/${s.queue.length}` : "Bắt đầu đổi code");
  await setState(s);
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "START" });
  } catch (e) {
    const s2 = await getState();
    s2.running = false;
    s2.note = "Trang đổi quà chưa sẵn sàng. Hãy tải lại trang (F5) rồi bấm Tiếp tục.";
    pushLog(s2, "warn", s2.note);
    await setState(s2);
  }
  refreshConn();
}

async function start() {
  const queue = parseCodes($("codes").value);
  if (!queue.length) return showNote("Chưa có code nào hợp lệ.", true);
  await saveDraft();
  const s = { queue, idx: 0, retry: 0, running: false, finished: false, results: [], log: [], settings: readSettings(), note: "" };
  pushLog(s, "info", `Nạp ${queue.length} code`);
  await setState(s);
  await launch();
}

async function pause() {
  const s = await getState();
  if (!s) return;
  s.running = false;
  s.note = "Đã tạm dừng.";
  pushLog(s, "info", "Đã tạm dừng");
  await setState(s);
}

async function resume() {
  const s = await getState();
  if (!s || s.idx >= s.queue.length) return showNote("Không có gì để tiếp tục.", true);
  await launch();
}

async function clearAll() {
  if (!confirm("Xoá toàn bộ hàng đợi, kết quả và nhật ký?")) return;
  await chrome.storage.local.remove(KEY);
  $("codes").value = "";
  updateCount();
  await saveDraft();
  render(null);
}

// ---------- Xuất file ----------
function exportCsv() {
  const s = lastState;
  if (!s || !s.results.length) return showNote("Chưa có kết quả để xuất.", true);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ["code", "ket_qua", "ly_do", "thong_bao", "gio"],
    ...s.results.map((r) => [r.code, GROUPS[groupOf(r)].label, reasonOf(r), r.msg || "", r.time]),
  ];
  downloadFile("delta-force-giftcode-ket-qua.csv", "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n"), "text/csv");
}

function downloadTab() {
  const list = codesOf(lastState, currentTab);
  if (!list.length) return showNote(`Không có code nào ở mục "${GROUPS[currentTab].label}".`, true);
  downloadFile(GROUPS[currentTab].file, list.join("\n"));
}

async function copyTab() {
  const list = codesOf(lastState, currentTab);
  if (!list.length) return showNote("Mục này đang trống.", true);
  await navigator.clipboard.writeText(list.join("\n"));
  showNote(`Đã copy ${list.length} code (${GROUPS[currentTab].label}).`);
}

// ---------- Hiển thị ----------
function updateCount() {
  $("codeCount").textContent = `${parseCodes($("codes").value).length} code`;
}

function renderList(s) {
  const list = codesOf(s, currentTab);
  $("list").value = list.join("\n");
  $("listMeta").textContent = `${GROUPS[currentTab].label}: ${list.length} code`;
  $("cardSuccess").classList.toggle("active", currentTab === "success");
  $("cardInvalid").classList.toggle("active", currentTab === "invalid");
}

function renderLog(s) {
  const box = $("log");
  box.textContent = "";
  const entries = (s && s.log) || [];
  $("logCount").textContent = entries.length ? `${entries.length} dòng` : "";
  if (!entries.length) return box.append(el("div", "empty", "Chưa có hoạt động nào."));

  [...entries].reverse().forEach((e) => {
    const row = el("div", `li ${e.level}`);
    row.append(el("span", "t", new Date(e.ts).toLocaleTimeString("vi-VN", { hour12: false })));
    const head = el("div", "head");
    if (e.code) {
      head.append(el("span", `badge ${e.level}`, e.level === "ok" ? "Thành công" : "Không hợp lệ"));
      head.append(el("span", "code", e.code));
      if (e.level === "bad" && e.tag) head.append(el("span", "reason", e.tag));
    } else {
      head.append(el("span", "", e.text));
    }
    row.append(head);
    if (e.code) row.append(el("div", "msg", e.text));
    box.append(row);
  });
}

function render(s) {
  lastState = s;
  $("cntSuccess").textContent = codesOf(s, "success").length;
  $("cntInvalid").textContent = codesOf(s, "invalid").length;
  renderList(s);
  renderLog(s);

  const total = s ? s.queue.length : 0;
  const idx = s ? s.idx : 0;
  const pct = total ? Math.round((idx / total) * 100) : 0;
  $("fill").style.width = pct + "%";
  $("bar").classList.toggle("run", !!(s && s.running));
  $("progress").textContent = `${idx}/${total} · ${pct}%`;
  $("cur").textContent = s && s.running && s.current ? `› ${s.current}` : "";
  showNote(s ? s.note || "" : "", !!(s && /^(Đã tạm dừng|Chưa|Không|Trang)/.test(s.note || "")));

  $("start").disabled = !!(s && s.running);
  $("pause").disabled = !(s && s.running);
  $("resume").disabled = !s || s.running || idx >= total;
}

async function init() {
  $("start").onclick = start;
  $("pause").onclick = pause;
  $("resume").onclick = resume;
  $("clear").onclick = clearAll;
  $("export").onclick = exportCsv;
  $("copy").onclick = copyTab;
  $("dlTab").onclick = downloadTab;
  $("openPage").onclick = () => chrome.tabs.create({ url: REDEEM_URL });
  [["cardSuccess", "success"], ["cardInvalid", "invalid"]].forEach(([id, key]) => {
    $(id).onclick = () => {
      currentTab = key;
      saveDraft();
      renderList(lastState);
    };
  });

  // Lưu nháp ngay khi gõ/dán (popup có thể bị đóng bất cứ lúc nào)
  ["codes", ...FIELDS].forEach((id) => $(id).addEventListener("input", saveDraft));
  $("codes").addEventListener("input", updateCount);
  window.addEventListener("pagehide", saveDraft);

  chrome.tabs.onUpdated.addListener(refreshConnSoon);
  chrome.tabs.onRemoved.addListener(refreshConnSoon);
  chrome.tabs.onActivated.addListener(refreshConnSoon);

  try {
    chrome.storage.local.remove("dfDebug"); // dọn dữ liệu chẩn đoán của bản cũ
    const store = await chrome.storage.local.get([KEY, DRAFT]);
    const s = store[KEY];
    if (store[DRAFT]) {
      restoreDraft(store[DRAFT]);
    } else if (s) {
      $("codes").value = s.queue.join("\n"); // tương thích bản cũ
      const st = s.settings || {};
      FIELDS.forEach((k) => {
        if (st[k] !== undefined && st[k] !== "") $(k).value = st[k];
      });
    }
    updateCount();
    render(s || null);
    await refreshConn();
  } catch (e) {
    console.error(e);
    showNote("Lỗi khi khôi phục dữ liệu: " + e.message, true);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes[KEY]) render(changes[KEY].newValue || null);
});

init();