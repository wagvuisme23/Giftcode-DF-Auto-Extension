<div align="center">

# 🎖️ DELTA FORCE · GIFTCODE AUTO REDEEM

**Tiện ích mở rộng trình duyệt giúp nhập hàng loạt giftcode trên Trung Tâm Đổi Quà của Delta Force (Garena) — tự động, có nhật ký, không cần thao tác tay từng mã.**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-f2b61c?style=flat-square&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-thuần%20(vanilla)-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![Trình duyệt](https://img.shields.io/badge/Chrome%20%7C%20Edge%20%7C%20C%E1%BB%91c%20C%E1%BB%91c-Chromium-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Phiên bản](https://img.shields.io/badge/phi%C3%AAn%20b%E1%BA%A3n-2.0.0-38e08f?style=flat-square)
![Thư viện ngoài](https://img.shields.io/badge/th%C6%B0%20vi%E1%BB%87n%20ngo%C3%A0i-0-lightgrey?style=flat-square)
![Giao diện](https://img.shields.io/badge/giao%20di%E1%BB%87n-Ti%E1%BA%BFng%20Vi%E1%BB%87t-ff5a4d?style=flat-square)

</div>

---

## 📖 Giới thiệu

Khi có một danh sách giftcode dài, việc đổi từng mã trên trang **Trung Tâm Đổi Quà** rất tốn thời gian: dán mã, bấm *Đổi*, đọc thông báo, tắt popup, rồi lặp lại. **Delta Force Giftcode Auto Redeem** làm toàn bộ chuỗi thao tác đó thay bạn.

Bạn chỉ cần dán danh sách code vào popup của tiện ích, bấm **Bắt đầu**; tiện ích sẽ lần lượt đổi từng mã trên chính trang web mà bạn đã đăng nhập, ghi lại kết quả của từng mã và phân loại sẵn thành **Thành công** / **Không hợp lệ**.

### ✨ Điểm nổi bật

| | Tính năng | Mô tả |
|---|---|---|
| 🤖 | **Tự động đổi hàng loạt** | Điền mã → bấm "Đổi" → đọc kết quả → sang mã tiếp theo |
| 🪟 | **Tự đóng popup "Đã nhận thành công"** | Tìm và bấm nút X của popup; có nhiều phương án dự phòng |
| 📊 | **Hai nhóm kết quả rõ ràng** | Thẻ số **Thành công** và **Không hợp lệ**, bấm để xem danh sách, copy hoặc tải `.txt` |
| 📜 | **Nhật ký chi tiết** | Giờ, mã, nhãn kết quả, lý do (Đã dùng / Hết hạn / Sai mã…) và nguyên văn thông báo của trang |
| 🛡️ | **Tự tạm dừng an toàn** | Chưa mở trang đổi quà, đóng tab giữa chừng, mất đăng nhập → tự dừng và báo bạn |
| 💾 | **Không mất dữ liệu** | Đóng popup rồi mở lại vẫn còn danh sách code, cài đặt, tiến độ và nhật ký |
| ⏱️ | **Giãn cách ngẫu nhiên** | Delay giữa các mã (mặc định 4–8 giây) và tự chờ khi bị giới hạn tốc độ |
| 🎨 | **Giao diện phong cách Delta Force** | Tông tối chiến thuật, khung HUD, nút vát chéo, viền sọc cảnh báo |

---

## 🎯 Mục đích

- **Tiết kiệm thời gian:** biến hàng chục, hàng trăm lần thao tác lặp lại thành một lần bấm.
- **Tránh sai sót:** không phải tự gõ/dán nhầm mã, không phải nhớ mã nào đã thử.
- **Có báo cáo rõ ràng:** biết chính xác mã nào đã nhận quà, mã nào không dùng được (kèm lý do) để lưu lại hoặc kiểm tra thêm.
- **Chạy cục bộ, an toàn:** mọi thứ nằm trong trình duyệt của bạn, không gửi dữ liệu đi đâu cả (xem mục *Quyền & riêng tư*).

> ℹ️ Đây là công cụ **hỗ trợ thao tác** trên trang web chính thức khi bạn đã đăng nhập. Nó **không** tạo mã, **không** dò mã (brute-force), và **không** vượt captcha hay các bước xác minh của trang.

---

## 🧰 Ngôn ngữ & công nghệ sử dụng

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Ngôn ngữ chính | **JavaScript thuần** (ES2020+) | Không framework, không bundler, không bước build |
| Giao diện popup | **HTML5 + CSS3** | CSS biến (`:root`), `clip-path`, lưới/flex, không dùng thư viện UI |
| Nền tảng | **Chrome Extension – Manifest V3** | `content_scripts`, service worker, `chrome.storage`, `chrome.tabs` |
| Cấu hình | **JSON** (`manifest.json`) | Khai báo quyền và nơi chạy script |
| Ngôn ngữ giao diện / chú thích | **Tiếng Việt** | Toàn bộ nhãn nút, thông báo và chú thích trong code |
| Phụ thuộc ngoài | **Không có** | Không cần `npm install` |

### 📁 Cấu trúc thư mục

```
df-giftcode-autofill/
├── manifest.json     Khai báo extension, quyền, nơi nạp script
├── background.js     Service worker: theo dõi tab trang đổi quà
├── content.js        Chạy TRONG trang đổi quà: điền mã, bấm Đổi, đọc kết quả, đóng popup
├── classify.js       Bảng từ khoá phân loại thông báo (dùng chung)
├── popup.html        Giao diện popup (HTML + CSS)
├── popup.js          Logic popup: điều khiển, hiển thị, lưu nháp, xuất file
└── README.md         Tài liệu này
```

---

## ⚙️ Cơ chế hoạt động

### 1. Kiến trúc tổng quan

Ba thành phần giao tiếp với nhau qua **`chrome.storage.local`** (kho lưu trữ của extension) thay vì gọi trực tiếp, nhờ đó popup có thể đóng/mở thoải mái mà việc đổi code vẫn chạy.

```
 ┌──────────────────┐   đọc/ghi trạng thái    ┌───────────────────────────┐
 │ popup.html / .js │ ◄─────────────────────► │        content.js         │
 │   (giao diện)    │      chrome.storage     │  (chạy bên trong trang    │
 └────────┬─────────┘      dfState · dfDraft  │   đổi quà đã đăng nhập)   │
          │  gửi lệnh START                    └─────────────▲─────────────┘
          └──────────────────────────────────────────────────┘
                                   ▲
 ┌──────────────────┐   mất trang → ghi "tạm dừng"
 │   background.js  │ ─────────────┘
 │ (service worker) │   theo dõi mở / đóng / chuyển trang của các tab
 └──────────────────┘
```

| Thành phần | Vai trò |
|---|---|
| **popup** | Nhận danh sách code, hiển thị tiến độ/kết quả/nhật ký; ghi trạng thái và gửi lệnh bắt đầu |
| **content script** | "Đôi tay" thao tác trên trang: điền, bấm, đọc, đóng popup; cập nhật trạng thái sau mỗi mã |
| **service worker** | "Người gác cổng": nếu đang chạy mà không còn tab đổi quà nào thì tự đặt trạng thái *tạm dừng* |
| **chrome.storage.local** | Nơi chứa `dfState` (hàng đợi, kết quả, nhật ký, cài đặt) và `dfDraft` (nội dung đang soạn trong popup) |

### 2. Vòng đời xử lý một giftcode

```
  Lấy mã kế tiếp trong hàng đợi
          │
          ▼
  Điền mã vào ô nhập  ──►  Bấm nút "Đổi"
          │
          ▼
  Đợi popup thông báo xuất hiện (tối đa 9 giây)
          │
          ▼
  Đọc dòng chữ mới ──► Phân loại (classify.js)
          │
          ▼
  Đóng popup của trang (bấm nút X, có phương án dự phòng)
          │
          ▼
  Ghi kết quả + nhật ký ──► Nghỉ ngẫu nhiên 4–8 giây ──► Mã tiếp theo
```

### 3. Cách đọc thông báo của trang

Trang không có API công khai, nên tiện ích "nhìn" trang như người dùng:

1. Trước khi đổi mã đầu tiên, chụp lại **tập hợp các đoạn chữ đang hiển thị** (nền của trang).
2. Sau khi bấm *Đổi*, mọi đoạn chữ **mới xuất hiện** (không có trong nền) được coi là thông báo kết quả.
3. Đoạn chữ đó được đưa qua bảng luật trong `classify.js` để biết là thành công hay lỗi gì.

Cách này không phụ thuộc vào tên class/ID cụ thể của popup nên bền hơn khi trang thay đổi giao diện.

### 4. Bảng phân loại kết quả

Văn bản được chuyển về chữ thường và **bỏ dấu** trước khi so khớp. Luật được kiểm theo thứ tự ưu tiên (luật khớp trước sẽ được dùng).

| Phân loại nội bộ | Ví dụ từ khoá nhận diện | Hiển thị | Hành vi |
|---|---|---|---|
| `ratelimit` | quá nhiều, thử lại sau, thường xuyên, captcha | Không hợp lệ · *Giới hạn tốc độ* | **Chờ** rồi **thử lại cùng mã** (mặc định 30 giây × 3 lần) |
| `login` | vui lòng đăng nhập, phiên đăng nhập hết hạn | — | **Tạm dừng** và yêu cầu đăng nhập lại |
| `expired` | hết hạn, quá hạn | Không hợp lệ · *Hết hạn* | Ghi nhận, sang mã tiếp |
| `success` | thành công, chúc mừng, kiểm tra hộp thư | **Thành công** | Ghi nhận, sang mã tiếp |
| `used` | đã được sử dụng, đã đổi, đã nhận | Không hợp lệ · *Đã dùng* | Ghi nhận, sang mã tiếp |
| `invalid` | không hợp lệ, không tồn tại, sai mã | Không hợp lệ · *Sai mã* | Ghi nhận, sang mã tiếp |
| `unknown` | (không khớp luật nào / không đọc được) | Không hợp lệ · *Không rõ* | Ghi nhận kèm nguyên văn để bạn tự kiểm tra |

> Trên giao diện chỉ có **2 nhóm** để gọn: *Thành công* và *Không hợp lệ*. Lý do chi tiết nằm ở **nhãn nhỏ trong nhật ký** và cột `ly_do` của file CSV.

### 5. Cơ chế tự đóng popup "Đã nhận thành công"

Sau mỗi lần đổi, trang hiện một khung thông báo che màn hình. Tiện ích đóng nó theo thứ tự các phương án sau, **sau mỗi lần thử đều kiểm tra popup đã biến mất chưa**:

1. **Tìm nút X ngay trong khung thoại** (class `btn-close`, `close`…, hoặc nút chỉ có biểu tượng) — không giới hạn kích thước, vì trang có thể bị phóng to.
2. Với mỗi nút ứng viên (tối đa 3), thử lần lượt: **click gốc của trình duyệt → click có toạ độ → chạm cảm ứng (touch) → gửi sự kiện chuột trực tiếp**.
3. Thử nút có chữ như *OK / Đóng / Xác nhận* nằm gần khung.
4. Gửi phím **Escape**.
5. **Phương án cuối:** ẩn khung thoại (và lớp nền mờ mới xuất hiện) bằng CSS, giống cách chính trang tự ẩn popup.
6. Nếu mọi cách đều thất bại: **tạm dừng** và nhờ bạn tự đóng popup rồi bấm *Tiếp tục*.

### 6. Các cơ chế an toàn

| Tình huống | Tiện ích xử lý |
|---|---|
| Bấm *Bắt đầu* khi chưa mở trang đổi quà | Nạp sẵn danh sách, **tạm dừng**, hiện cảnh báo + nút *Mở trang* |
| Đang chạy mà đóng tab / chuyển sang trang khác | Service worker **tự tạm dừng** (kể cả khi popup đang đóng) |
| Tải lại trang (F5) giữa chừng | Content script **tự chạy tiếp** từ mã đang dở |
| Bị giới hạn tốc độ | Chờ `cooldown` giây rồi thử lại tối đa `maxRetry` lần |
| Không thấy ô nhập / nút "Đổi" | Dừng và báo lỗi cụ thể (có thể nhập selector thủ công) |
| Đóng popup extension giữa chừng | Việc đổi code **vẫn tiếp tục**; mở lại popup thấy đủ tiến độ |
| Danh sách nhập có mã trùng / quá ngắn | Tự loại mã trùng và mã ngắn hơn 4 ký tự |

---

## 🚀 Hướng dẫn sử dụng

### Bước 1 — Cài đặt

1. Giải nén (hoặc giữ nguyên) thư mục `df-giftcode-autofill`.
2. Mở `chrome://extensions` (Edge: `edge://extensions`, Cốc Cốc: `coccoc://extensions`).
3. Bật **Developer mode** (Chế độ nhà phát triển).
4. Bấm **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục `df-giftcode-autofill`.
5. *(Khuyên dùng)* Ghim biểu tượng extension lên thanh công cụ để mở popup nhanh.

> 🔄 Mỗi lần **sửa code và reload extension**, hãy **F5 lại trang đổi quà** — tab đang mở vẫn giữ bản script cũ cho đến khi tải lại.

### Bước 2 — Sử dụng

1. Mở trang **Trung Tâm Đổi Quà Delta Force** và **đăng nhập** tài khoản Garena như bình thường. (Chưa mở trang? Bấm nút **Mở trang** trong popup.)
2. Bấm biểu tượng extension. Thẻ trạng thái ở góc phải trên cùng phải hiện **🟢 Đã mở trang**.
3. Dán danh sách giftcode vào ô **Danh sách giftcode** (mỗi dòng một mã, hoặc cách nhau bằng dấu phẩy / khoảng trắng).
4. Bấm **Bắt đầu**. Xem tiến độ, thẻ kết quả và nhật ký cập nhật theo thời gian thực.
5. Khi xong, mở thẻ **Thành công / Không hợp lệ** để **Copy**, **Tải .txt** hoặc **Xuất CSV**.

### Các nút điều khiển

| Nút | Tác dụng |
|---|---|
| **Bắt đầu** | Nạp danh sách mới và chạy từ mã đầu tiên (xoá kết quả cũ) |
| **Tạm dừng** | Dừng sau mã đang xử lý; có thể tiếp tục sau |
| **Tiếp tục** | Chạy tiếp từ mã còn dở (dùng sau khi tạm dừng / mở lại trang) |
| **Mở trang** | Mở tab Trung Tâm Đổi Quà (hiện khi chưa mở trang) |
| **Copy / Tải .txt** | Lấy danh sách mã của thẻ đang chọn (mỗi dòng một mã) |
| **Xuất CSV** | Xuất toàn bộ kết quả: `code, ket_qua, ly_do, thong_bao, gio` |
| **Xoá hết** | Xoá hàng đợi, kết quả và nhật ký (có hỏi xác nhận) |

### Cài đặt nâng cao

| Tuỳ chọn | Mặc định | Ý nghĩa |
|---|---|---|
| Delay tối thiểu / tối đa giữa 2 code | 4 s / 8 s | Khoảng nghỉ ngẫu nhiên sau mỗi mã. **Đừng đặt quá thấp** để tránh bị giới hạn tốc độ |
| Chờ khi bị giới hạn tốc độ | 30 s | Thời gian chờ trước khi thử lại cùng mã |
| Số lần thử lại khi bị giới hạn | 3 | Quá số lần này thì ghi nhận mã vào nhóm *Không hợp lệ* (nhãn *Giới hạn tốc độ*) |
| Selector ô nhập code | *(trống – tự tìm)* | Chỉ điền khi tiện ích không tự tìm được ô nhập |
| Selector nút "Đổi" | *(trống – tự tìm)* | Chỉ điền khi tiện ích không tự tìm được nút Đổi |

> 💡 Lấy selector: chuột phải vào phần tử trên trang → **Inspect** → chuột phải phần tử đang sáng → **Copy → Copy selector**.

### 💡 Mẹo dùng hiệu quả

- Để tab trang đổi quà ở **một cửa sổ riêng** (không thu nhỏ). Chrome làm chậm đồng hồ của tab bị ẩn lâu (> 5 phút), có thể khiến danh sách dài chạy chậm.
- Nên thử với **vài mã** trước để xem cách trang thông báo, rồi mới chạy danh sách lớn.
- Với mã nằm trong *Không hợp lệ* nhưng nhãn là **Không rõ**, hãy xem nguyên văn thông báo trong nhật ký — có thể bạn cần bổ sung luật (xem mục *Tuỳ chỉnh*).
- Lưu file `.txt` của nhóm **Không hợp lệ** nếu muốn kiểm tra lại sau.

---

## 🔒 Quyền & riêng tư

| Quyền | Dùng để làm gì |
|---|---|
| `storage` | Lưu hàng đợi, kết quả, nhật ký và bản nháp **ngay trong trình duyệt của bạn** |
| Truy cập `redeem.df.garena.sg` và các trang chứa `cdkgarena` của `playdeltaforce.com` / `garena.com` | Chạy script trên đúng trang đổi quà và biết bạn đã mở trang hay chưa |

**Cam kết trong code:**

- ❌ Không có `fetch`, `XMLHttpRequest`, `WebSocket` hay `sendBeacon` → **không gửi dữ liệu ra ngoài**.
- ❌ Không đọc cookie, `localStorage`, token đăng nhập hay thông tin tài khoản.
- ❌ Không yêu cầu quyền `cookies`, `history`, `webRequest` hay `<all_urls>`.
- ✅ Dữ liệu chỉ gồm danh sách mã, kết quả và cài đặt — xoá bằng nút **Xoá hết**.

> ⚠️ Địa chỉ trang đổi quà sau khi đăng nhập có thể chứa tham số `state` và `code` của phiên đăng nhập. **Đừng chia sẻ** đường link đó cho người khác hay đăng công khai.

Bạn có thể tự kiểm tra: tìm các từ `fetch`, `XMLHttpRequest`, `WebSocket`, `cookie`, `localStorage` trong thư mục — sẽ không có kết quả nào.

---

## 🩺 Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Thẻ đỏ **Chưa mở trang** | Chưa mở trang đổi quà | Bấm **Mở trang**, đăng nhập, rồi **Tiếp tục** |
| *"Trang đổi quà chưa sẵn sàng. Hãy tải lại trang (F5)"* | Tab mở từ trước khi cài/reload extension | **F5** trang đổi quà rồi bấm **Tiếp tục** |
| *"Không thấy ô nhập code"* | Chưa đăng nhập, hoặc trang đổi giao diện | Đăng nhập; nếu vẫn lỗi, điền **selector ô nhập** trong Cài đặt nâng cao |
| *"Không thấy nút Đổi"* | Trang đổi cấu trúc | Điền **selector nút "Đổi"** |
| *"Chưa đăng nhập hoặc phiên đã hết hạn"* | Phiên Garena hết hạn | Đăng nhập lại, rồi **Tiếp tục** |
| *"Không đóng được popup"* | Mọi cách đóng đều không hiệu quả | Tự bấm X trên trang, rồi **Tiếp tục** |
| Nhiều mã bị **Giới hạn tốc độ** | Gửi quá nhanh | Tăng delay (ví dụ 8–15 giây) và thời gian chờ |
| Mã vào **Không hợp lệ** với nhãn **Không rõ** | Câu thông báo chưa có trong bảng luật | Xem nguyên văn trong nhật ký → thêm từ khoá vào `classify.js` |
| Chạy chậm khi để tab nền lâu | Trình duyệt giảm tốc tab bị ẩn | Đặt tab đổi quà ở cửa sổ riêng, đừng thu nhỏ |
| Popup extension hiện lỗi | Lỗi script | Mở `chrome://extensions` → bấm **Errors** của extension |

---

## 🛠️ Tuỳ chỉnh (dành cho người muốn sửa code)

**Thêm/sửa từ khoá phân loại** — mở `classify.js`, chỉnh bảng `DF_RULES`. Từ khoá viết **không dấu, chữ thường**. Sau khi sửa, reload extension: các kết quả cũ trong popup sẽ **tự được phân loại lại**.

```js
// Ví dụ: coi câu "mã đã bị khoá" là đã dùng
["used", /da (duoc |bi )?(su dung|doi|nhan|kich hoat)|da bi khoa|.../],
```

**Đổi màu giao diện** — mở `popup.html`, chỉnh các biến ở đầu thẻ `<style>`:

```css
:root {
  --amber: #f2b61c;  /* màu nhấn chính (vàng cảnh báo) */
  --ok:    #38e08f;  /* thành công */
  --bad:   #ff5a4d;  /* không hợp lệ */
}
```

**Phạm vi chạy** — các trang mà script được nạp khai báo ở `manifest.json` (`content_scripts.matches` và `host_permissions`).

---

## 🧪 Kiểm thử

Extension được kiểm thử tự động bằng **Chromium thật** (nạp extension, giả lập trang đổi quà với cùng cấu trúc popup `#diaTips`):

- 8 tình huống đóng popup: nút X nhỏ/lớn, trang bị zoom, sự kiện click / ủy quyền / chỉ cảm ứng, và trường hợp nút X không phản hồi (dùng phương án ẩn bằng CSS) — kèm kiểm tra không bấm nhầm phần tử khác.
- Luồng đầy đủ: chưa mở trang → tự tạm dừng; mở trang → chạy và phân loại; đóng/mở lại popup vẫn giữ dữ liệu; đóng tab giữa chừng → tự tạm dừng; mở lại trang → tiếp tục từ mã dở; service worker tự tạm dừng ngay cả khi popup đã đóng.

> Lưu ý: các bài kiểm thử chạy trên **bản giả lập** của trang, không đổi mã thật trên máy chủ Garena. Nếu trang thay đổi giao diện, một số bước nhận diện có thể cần chỉnh lại.

---

## 💡 Ý tưởng phát triển thêm

*(Chưa triển khai — gợi ý cho các phiên bản sau)*

- 📥 Nhập danh sách từ file `.txt` / `.csv` bằng cách kéo-thả.
- 🔁 Nút **"Chạy lại các mã Không rõ"** chỉ với những mã chưa xác định được kết quả.
- 🔔 Thông báo desktop và âm báo khi chạy xong hoặc khi cần bạn can thiệp.
- 🗂️ Lưu **lịch sử các phiên** để tránh đổi trùng và xem lại thống kê (tỷ lệ thành công theo từng đợt).
- ⚙️ Chuyển vòng lặp sang service worker để **không bị trình duyệt làm chậm** khi tab chạy nền.
- 🌐 Giao diện song ngữ Việt / Anh và chủ đề sáng/tối.
- ⌨️ Phím tắt bật/tắt tạm dừng.

---

## 📝 Lịch sử phiên bản

| Phiên bản | Nội dung chính |
|---|---|
| **2.0.0** | Giao diện Delta Force (HUD), 2 nhóm kết quả, nhật ký chi tiết; kiểm tra trang đổi quà + tự tạm dừng; thêm service worker; bỏ chức năng chẩn đoán |
| **1.3.0** | Tự đóng popup "Đã nhận thành công": tìm nút X trong khung thoại, click/touch, phương án dự phòng ẩn bằng CSS |
| **1.2.0** | Giao diện tối, tách mã theo nhóm, lưu nháp popup, bảng phân loại `classify.js`, đọc thông báo theo chữ mới xuất hiện |
| **1.0.0** | Bản đầu: nhập danh sách, tự điền mã và bấm "Đổi" |

---

## ⚠️ Lưu ý & miễn trừ trách nhiệm

- Đây là **dự án cá nhân, không chính thức**, **không liên kết hay được bảo trợ** bởi Garena, TiMi Studio hay Delta Force.
- Tự động hoá thao tác trên trang dịch vụ **có thể trái điều khoản sử dụng** của nhà cung cấp. Bạn **tự chịu trách nhiệm** về việc sử dụng, bao gồm mọi rủi ro với tài khoản.
- Chỉ dùng với **giftcode hợp lệ mà bạn được phép sử dụng**. Tiện ích không tạo mã, không dò mã và không vượt captcha/xác minh.
- Giữ delay ở mức hợp lý (mặc định 4–8 giây) để tránh gửi yêu cầu dồn dập.

<div align="center">

**Chúc bạn nhận quà vui vẻ! 🎁**

</div>