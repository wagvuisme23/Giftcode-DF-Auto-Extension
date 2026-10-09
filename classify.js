// Phân loại thông báo của trang đổi quà -> success | used | expired | invalid | ratelimit | login | unknown
// File này dùng chung cho content.js và popup.js.
// Nếu trang dùng câu chữ khác, hãy sửa/thêm từ khoá ở bảng DF_RULES bên dưới rồi reload extension:
// các kết quả cũ trong popup sẽ tự được phân loại lại theo luật mới.
// Lưu ý: văn bản được chuyển thành chữ thường + BỎ DẤU trước khi so khớp, nên viết từ khoá KHÔNG DẤU.

const DF_RULES = [
  // Thứ tự quan trọng: luật nào khớp trước thì dùng luật đó.
  ["ratelimit", /qua nhieu|too many|thuong xuyen|thu lai sau|try again later|frequent|he thong ban|\bbusy\b|captcha|xac minh|verif|rate limit|qua nhanh/],
  ["login", /(phien|session).*(het han|expired|timeout|het hieu luc)|dang nhap lai|vui long dang nhap|chua dang nhap|please log ?in|login required|sign in/],
  ["expired", /het han|expired|qua han|het hieu luc|ngung hieu luc|da qua thoi gian/],
  ["invalid", /khong thanh cong|that bai|\bfail|unsuccessful|not success/],
  ["success", /thanh cong|success|congrat|chuc mung|kiem tra hop thu|check your (mail|inbox)/],
  ["used", /da (duoc |bi )?(su dung|doi|nhan|kich hoat)|het luot|het so luong|\bused\b|\balready\b|redeemed|claimed/],
  ["invalid", /khong hop le|invalid|khong ton tai|khong dung|khong chinh xac|sai ma|\bsai\b|incorrect|not exist|not found|nhap lai|vui long nhap|\bloi\b|\berror\b/],
];

function classifyMessage(msg) {
  if (!msg) return "unknown";
  const t = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  for (const [status, re] of DF_RULES) if (re.test(t)) return status;
  return "unknown";
}

// Tên lý do hiển thị trong nhật ký / CSV
const DF_REASON = {
  success: "Đã nhận",
  used: "Đã dùng",
  expired: "Hết hạn",
  invalid: "Sai mã",
  ratelimit: "Giới hạn tốc độ",
  login: "Chưa đăng nhập",
  unknown: "Không rõ",
};