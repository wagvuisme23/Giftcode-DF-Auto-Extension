// Service worker: theo dõi tab trang đổi quà. Nếu đang chạy mà không còn tab nào -> tự tạm dừng.
const KEY = "dfState";
const PATTERNS = [
  "https://redeem.df.garena.sg/*",
  "https://*.playdeltaforce.com/*cdkgarena*",
  "https://*.garena.com/*cdkgarena*",
];

async function checkRunning() {
  const s = (await chrome.storage.local.get(KEY))[KEY];
  if (!s || !s.running) return;
  const tabs = await chrome.tabs.query({ url: PATTERNS });
  if (tabs.length) return;

  const fresh = (await chrome.storage.local.get(KEY))[KEY]; // đọc lại để tránh ghi đè
  if (!fresh || !fresh.running) return;
  fresh.running = false;
  fresh.note = "Đã tạm dừng: không còn trang đổi quà Delta Force. Hãy mở lại trang rồi bấm Tiếp tục.";
  fresh.log = fresh.log || [];
  fresh.log.push({ ts: Date.now(), level: "warn", text: fresh.note });
  if (fresh.log.length > 300) fresh.log.splice(0, fresh.log.length - 300);
  await chrome.storage.local.set({ [KEY]: fresh });
}

const soon = () => setTimeout(checkRunning, 700);
chrome.tabs.onRemoved.addListener(soon);
chrome.tabs.onUpdated.addListener((_id, info) => {
  if (info.url || info.status === "complete") soon();
});
chrome.runtime.onStartup.addListener(checkRunning);
chrome.runtime.onInstalled.addListener(checkRunning);