// Delta Force Giftcode Auto - content script
// Chạy trên trang cdkgarena.html, lấy từng code trong hàng đợi (chrome.storage.local)
// -> điền vào ô nhập -> bấm "Đổi" -> đọc thông báo kết quả -> đóng popup -> code tiếp theo.
// (classifyMessage() nằm trong classify.js)

(() => {
  if (window.__dfAutoLoaded) return;
  window.__dfAutoLoaded = true;

  const KEY = "dfState";
  let looping = false;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const getState = async () => (await chrome.storage.local.get(KEY))[KEY];
  const setState = (s) => chrome.storage.local.set({ [KEY]: s });

  const isVisible = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
  };
  const text = (el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();

  // ---------- Tìm ô nhập / nút Đổi ----------
  function findInput(settings) {
    if (settings.inputSelector) {
      const el = document.querySelector(settings.inputSelector);
      if (el) return el;
    }
    const inputs = [...document.querySelectorAll("input, textarea")].filter((el) => {
      const t = (el.type || "text").toLowerCase();
      return isVisible(el) && !el.disabled && !el.readOnly && ["text", "search", "tel", "", "textarea"].includes(t);
    });
    const hint = /code|cdk|gift|redeem|voucher|mã|ma\b|nhập/i;
    return (
      inputs.find((el) => hint.test([el.placeholder, el.name, el.id, el.className].join(" "))) ||
      inputs[0] ||
      null
    );
  }

  function findRedeemButton(settings, input) {
    if (settings.buttonSelector) {
      const el = document.querySelector(settings.buttonSelector);
      if (el) return el;
    }
    const re = /^(đổi|doi|redeem|exchange|đổi quà|đổi ngay)$/i;
    const all = [...document.querySelectorAll("a, button, div, span, p, li, input[type=button], input[type=submit]")]
      .filter((el) => isVisible(el) && re.test((el.value || text(el)).trim()));
    const leaf = all.filter((el) => !all.some((o) => o !== el && el.contains(o)));
    if (!leaf.length) return null;
    if (!input || leaf.length === 1) return leaf[0];
    const ir = input.getBoundingClientRect();
    const dist = (el) => {
      const r = el.getBoundingClientRect();
      return Math.hypot(r.x - ir.x, r.y - ir.y);
    };
    return leaf.sort((a, b) => dist(a) - dist(b))[0];
  }

  // Điền giá trị theo cách framework (Vue/React) nhận biết được
  function setValue(el, value) {
    el.focus();
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "a" }));
  }

  function clickEl(el) {
    el.scrollIntoView({ block: "center" });
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((type) =>
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))
    );
  }

  // Gửi thẳng chuỗi sự kiện chuột vào phần tử (không cuộn trang)
  function rawClick(el) {
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((type) =>
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))
    );
  }

  // Click giống chuột thật: có toạ độ, gửi vào phần tử nằm trên cùng tại điểm đó.
  // Nếu toạ độ bị lệch (trang bị zoom/scale) thì gửi thẳng vào el để không bấm nhầm chỗ khác.
  function clickAtPoint(el) {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    let target = document.elementFromPoint(x, y);
    if (!target || !(target === el || el.contains(target))) target = el;
    const init = {
      bubbles: true, cancelable: true, composed: true, view: window,
      clientX: x, clientY: y, button: 0, pointerId: 1, pointerType: "mouse", isPrimary: true,
    };
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((type) => {
      const Ev = type.startsWith("pointer") && window.PointerEvent ? PointerEvent : MouseEvent;
      target.dispatchEvent(new Ev(type, init));
    });
  }

  // Chạm (touchstart/touchend) cho các trang chỉ lắng nghe sự kiện cảm ứng
  function touchTap(el) {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const touch = new Touch({ identifier: 1, target: el, clientX: x, clientY: y, pageX: x + scrollX, pageY: y + scrollY });
    const mk = (type, end) =>
      new TouchEvent(type, {
        bubbles: true, cancelable: true, composed: true,
        touches: end ? [] : [touch], targetTouches: end ? [] : [touch], changedTouches: [touch],
      });
    el.dispatchEvent(mk("touchstart", false));
    el.dispatchEvent(mk("touchend", true));
  }

  // ---------- Đọc thông báo: lấy mọi đoạn chữ MỚI xuất hiện so với lúc trang vừa tải ----------
  let staticTexts = null; // Set các đoạn chữ có sẵn trên trang (trước khi đổi code)

  const ownText = (el) => {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    return t.replace(/\s+/g, " ").trim();
  };

  function collectTexts() {
    const map = new Map(); // text -> element
    for (const el of document.body.querySelectorAll("*")) {
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
      const t = ownText(el);
      if (t.length >= 4 && t.length <= 300 && !map.has(t) && isVisible(el)) map.set(t, el);
    }
    return map;
  }

  function snapshotStatic() {
    staticTexts = new Set(collectTexts().keys());
  }

  function newMessages(ignore = new Set()) {
    const out = [];
    for (const [t, el] of collectTexts()) if (!staticTexts.has(t) && !ignore.has(t)) out.push({ t, el });
    return out;
  }

  const joinMsgs = (msgs) => msgs.map((m) => m.t).join(" | ").slice(0, 300);

  async function waitForResult(ignore, timeoutMs = 9000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      await sleep(300);
      if (newMessages(ignore).length) {
        await sleep(600); // để popup hiển thị đầy đủ
        return newMessages(ignore);
      }
    }
    return [];
  }

  // ---------- Tự động đóng popup ----------
  const describe = (el) => {
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).join(".") : "";
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}]`;
  };
  const depth = (el) => {
    let n = 0;
    for (let p = el; p.parentElement; p = p.parentElement) n++;
    return n;
  };

  // Leo từ dòng chữ thông báo lên khung popup (dừng trước khi tới lớp phủ toàn màn hình)
  function panelOf(el) {
    let cur = el;
    for (let i = 0; i < 6; i++) {
      const p = cur.parentElement;
      if (!p || p === document.body || p === document.documentElement) break;
      const r = p.getBoundingClientRect();
      if (r.width > innerWidth * 0.9 || r.height > innerHeight * 0.9) break;
      cur = p;
    }
    return cur;
  }

  // Khung thoại chứa dòng thông báo, ví dụ <div class="dia" id="diaTips" role="dialog">
  function dialogOf(el) {
    return (
      el.closest('[role=dialog], .dia, [class*=dialog i], [class*=modal i], [class*=popup i], [class*=toast i]') || panelOf(el)
    );
  }

  // Lớp phủ nền (mask) toàn màn hình đang hiển thị
  const MASK_SEL = "[class*=mask i],[class*=overlay i],[class*=shade i],[class*=backdrop i]";
  function visibleMasks() {
    return new Set(
      [...document.querySelectorAll(MASK_SEL)].filter((el) => {
        if (!isVisible(el)) return false;
        const r = el.getBoundingClientRect();
        const pos = getComputedStyle(el).position;
        return (pos === "fixed" || pos === "absolute") && r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9 && text(el).length < 3;
      })
    );
  }
  let masksBefore = new Set(); // các lớp phủ đã có sẵn trước khi bấm "Đổi"

  // Danh sách ứng viên nút đóng (X)
  function closeCandidates(settings, msgEl) {
    const dlg = dialogOf(msgEl);
    const out = [];
    const add = (el) => el && !out.includes(el) && out.push(el);

    // 0) selector do người dùng nhập
    if (settings.closeSelector) document.querySelectorAll(settings.closeSelector).forEach((el) => isVisible(el) && add(el));

    // 1) nút đóng nằm ngay trong khung thoại -- KHÔNG giới hạn kích thước (trang có thể bị phóng to)
    const closeSel = '.btn-close, [class*=close i], [class*=cancel i], [aria-label*=close i], [title*=close i], [id*=close i], [alt*=close i]';
    [...dlg.querySelectorAll(closeSel)].sort((a, b) => depth(a) - depth(b)).forEach(add); // thẻ ngoài (a/button) trước thẻ con (i)
    dlg.querySelectorAll("a, button").forEach((el) => text(el).length <= 2 && add(el)); // nút chỉ có biểu tượng

    // 2) nằm ngoài khung thoại: class có chữ "close" hoặc phần tử nhỏ, vuông, không chữ ở góc trên-phải
    const panel = dlg.getBoundingClientRect();
    const maxSize = Math.max(160, innerWidth * 0.12);
    const reach = Math.max(260, innerWidth * 0.15);
    const dist = (el) => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(panel.left - r.right, 0, r.left - panel.right);
      const dy = Math.max(panel.top - r.bottom, 0, r.top - panel.bottom);
      return Math.hypot(dx, dy);
    };
    const small = (r) => r.width >= 16 && r.height >= 16 && r.width <= maxSize && r.height <= maxSize;
    const outside = [...document.querySelectorAll(closeSel)].filter(
      (el) => isVisible(el) && small(el.getBoundingClientRect()) && dist(el) <= reach
    );
    const geometric = [...document.querySelectorAll("img, svg, a, button, div, span, i")].filter((el) => {
      if (!isVisible(el)) return false;
      const r = el.getBoundingClientRect();
      if (!small(r) || Math.abs(r.width - r.height) > 20 || text(el).length > 2) return false;
      const cs = getComputedStyle(el);
      const clickable =
        cs.cursor === "pointer" || ["IMG", "SVG", "A", "BUTTON"].includes(el.tagName.toUpperCase()) || cs.backgroundImage !== "none";
      if (!clickable) return false;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return cx > panel.left + panel.width * 0.5 && cy < panel.top + panel.height * 0.5 && dist(el) <= reach;
    });
    [...outside, ...geometric].sort((a, b) => dist(a) - dist(b)).forEach(add);
    return out;
  }

  // Nút có chữ (OK / Đóng / Xác nhận...) nằm gần khung popup
  function findTextButton(msgEl) {
    const panel = dialogOf(msgEl).getBoundingClientRect();
    const re = /^(ok|đóng|close|đã hiểu|got it|xác nhận|confirm|đồng ý|×|x)$/i;
    return (
      [...document.querySelectorAll("button, a, div, span")].find((el) => {
        if (!isVisible(el) || el.children.length > 0 || !re.test(text(el))) return false;
        const r = el.getBoundingClientRect();
        return r.right >= panel.left - 40 && r.left <= panel.right + 40 && r.bottom >= panel.top - 80 && r.top <= panel.bottom + 40;
      }) || null
    );
  }

  // Cách cuối: ẩn khung thoại giống cách chính trang tự ẩn (đặt style.display = none) và ẩn lớp phủ mới xuất hiện
  function forceHide(dlg) {
    dlg.style.display = "none";
    visibleMasks().forEach((el) => !masksBefore.has(el) && (el.style.display = "none"));
  }

  // Gói thông tin chẩn đoán (không chứa URL) để gửi cho người sửa code khi không đóng được popup
  function buildDebug(anchor, cands) {
    let root = dialogOf(anchor.el);
    for (let i = 0; i < 2; i++) {
      if (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
    }
    return {
      time: new Date().toISOString(),
      viewport: `${innerWidth}x${innerHeight}`,
      message: anchor.t,
      candidates: cands.slice(0, 8).map(describe),
      html: root.outerHTML.replace(/data:[^"')\s]{40,}/g, "data:…").slice(0, 8000),
    };
  }

  // Đóng popup thông báo mới. Trả về true nếu đã đóng. report.forced = true nếu phải ẩn bằng CSS.
  async function closePopups(settings, ignore, report = {}) {
    if (settings.autoClose === false) return true;
    const msgs = newMessages(ignore);
    if (!msgs.length) return true;
    // ưu tiên dòng chữ có nghĩa (thành công/đã dùng/...) làm mốc xác định popup
    const anchor = msgs.find((m) => classifyMessage(m.t) !== "unknown") || msgs[0];
    const dlg = dialogOf(anchor.el);
    const stillOpen = () => collectTexts().has(anchor.t);

    const attempt = async (fn) => {
      try { fn(); } catch (e) { /* bỏ qua */ }
      for (let i = 0; i < 4; i++) {
        await sleep(250);
        if (!stillOpen()) return true;
      }
      return false;
    };

    // Mỗi ứng viên thử lần lượt: click gốc -> click có toạ độ -> chạm cảm ứng -> sự kiện chuột trực tiếp
    const cands = closeCandidates(settings, anchor.el);
    const strategies = [(el) => el.click && el.click(), clickAtPoint, touchTap, rawClick];
    for (const el of cands.slice(0, 3)) {
      for (const fn of strategies) {
        if (await attempt(() => fn(el))) return true;
      }
    }

    const tb = findTextButton(anchor.el);
    if (tb && (await attempt(() => clickAtPoint(tb)))) return true;

    const esc = { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true };
    if (await attempt(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", esc));
      window.dispatchEvent(new KeyboardEvent("keydown", esc));
    })) return true;

    // Không cách nào bấm được -> ẩn bằng CSS
    forceHide(dlg);
    await sleep(300);
    if (!stillOpen()) {
      report.forced = true;
      return true;
    }

    report.debug = buildDebug(anchor, cands);
    return false;
  }

  // ---------- Đổi 1 code ----------
  async function redeemOne(code, settings) {
    let input = null;
    for (let i = 0; i < 20 && !input; i++) {
      input = findInput(settings);
      if (!input) await sleep(500);
    }
    if (!input) return { status: "fatal", msg: "Không thấy ô nhập code (có thể chưa đăng nhập hoặc sai trang)." };

    let firstRun = false;
    if (!staticTexts) {
      firstRun = true;
      await sleep(800); // chờ trang tải xong rồi chụp lại phần chữ có sẵn
      snapshotStatic();
    }
    // popup còn sót lại từ lần trước (ví dụ sau khi bấm Tiếp tục) -> đóng trước
    if (!firstRun && newMessages().length) await closePopups(settings, new Set(), {});

    const ignore = new Set(newMessages().map((m) => m.t));
    setValue(input, code);
    await sleep(rnd(300, 600));

    const btn = findRedeemButton(settings, input);
    if (!btn) return { status: "fatal", msg: 'Không thấy nút "Đổi". Hãy cấu hình selector nút trong popup.' };
    masksBefore = visibleMasks();
    clickEl(btn);

    const msgs = await waitForResult(ignore);
    const msg = joinMsgs(msgs);
    const status = classifyMessage(msg);

    const report = {};
    const closed = await closePopups(settings, ignore, report);
    await sleep(300);
    return { status, msg, closeFailed: !closed, debug: report.debug, forced: report.forced };
  }

  // Ngủ nhưng thoát sớm nếu người dùng bấm dừng
  async function sleepUnlessStopped(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const s = await getState();
      if (!s || !s.running) return false;
      await sleep(Math.min(500, end - Date.now()));
    }
    return true;
  }

  // ---------- Vòng lặp chính ----------
  async function runLoop() {
    if (looping) return;
    looping = true;
    try {
      while (true) {
        let s = await getState();
        if (!s || !s.running) break;
        if (s.idx >= s.queue.length) {
          s.running = false;
          s.finished = true;
          s.note = "Hoàn tất.";
          await setState(s);
          break;
        }

        const code = s.queue[s.idx];
        s.current = code;
        s.note = `Đang đổi: ${code}`;
        await setState(s);

        const r = await redeemOne(code, s.settings);

        s = await getState();
        if (!s || !s.running) break; // đã bị dừng trong lúc xử lý

        if (r.status === "fatal" || r.status === "login") {
          s.running = false;
          s.note = r.status === "login" ? "Chưa đăng nhập hoặc phiên đã hết hạn: " + r.msg : r.msg;
          await setState(s);
          break;
        }

        if (r.status === "ratelimit" && (s.retry || 0) < s.settings.maxRetry) {
          s.retry = (s.retry || 0) + 1;
          s.note = `Bị giới hạn tốc độ, chờ ${s.settings.cooldown}s rồi thử lại (${s.retry}/${s.settings.maxRetry})...`;
          await setState(s);
          if (!(await sleepUnlessStopped(s.settings.cooldown * 1000))) break;
          continue;
        }

        s.results.push({ code, status: r.status, msg: r.msg || "", time: new Date().toLocaleTimeString("vi-VN") });
        s.idx += 1;
        s.retry = 0;
        s.note = `${code}: ${r.status}${r.forced ? " (không bấm được X nên đã ẩn popup bằng CSS)" : ""}`;

        if (r.closeFailed) {
          if (r.debug) await chrome.storage.local.set({ dfDebug: r.debug });
          s.running = false;
          s.note = "Không đóng được popup. Mở Cài đặt -> bấm 'Copy chẩn đoán popup' rồi gửi cho người hỗ trợ, hoặc nhập selector nút X rồi bấm Tiếp tục.";
          await setState(s);
          break;
        }
        await setState(s);

        if (s.idx < s.queue.length) {
          const wait = rnd(s.settings.delayMin * 1000, s.settings.delayMax * 1000);
          if (!(await sleepUnlessStopped(wait))) break;
        }
      }
    } finally {
      looping = false;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === "START") {
      runLoop();
      sendResponse({ ok: true });
    } else if (msg && msg.type === "PING") {
      sendResponse({ ok: true });
    }
    return true;
  });

  // Nếu trang reload giữa chừng, tự chạy tiếp
  (async () => {
    const s = await getState();
    if (s && s.running) setTimeout(runLoop, 1500);
  })();
})();