# Product Requirements Document (PRD)

## Frontend Widget (`widget.js`)

**Thành phần nhúng trực tiếp vào website khách hàng.**
Cung cấp giao diện tương tác giữa người dùng cuối và hệ thống AI chatbot.

---

## 1. Mục tiêu sản phẩm

- Cung cấp giao diện chat nổi (floating button) có thể nhúng vào bất kỳ website nào của khách hàng.
- Hỗ trợ khởi tạo phiên làm việc (session), gửi và nhận tin nhắn từ backend API.
- Cho phép cấu hình đơn giản (giao diện, vị trí, nội dung...) thông qua script hoặc cấu hình toàn cục.
- Tự động giữ trạng thái session trong localStorage để không khởi tạo lại mỗi lần tải trang.

---

## 2. Kiến trúc kỹ thuật

| Thành phần         | Mô tả                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `widget.js`        | Một file JavaScript tĩnh, có thể tải từ CDN hoặc domain riêng (ví dụ: widget.chatbox.com/widget.js) |
| Giao diện UI       | Có thể là Shadow DOM, iframe hoặc inline DOM tuỳ cấu hình                                           |
| Lưu trữ trạng thái | Sử dụng `localStorage` để lưu `sessionToken`, `sessionId`, `expiresAt`                              |
| API endpoints      | Gọi đến backend như `/session/initiate`, `/chat/send`                                               |

---

## 3. Cách nhúng vào website khách hàng

Theo phong cách Google Tag Manager:

```html
<script>
  (function (w, d, s, u, i) {
    var js = d.createElement(s);
    js.src = u + '?id=' + i;
    js.async = true;
    d.head.appendChild(js);
  })(window, document, 'script', 'https://widget.chatbox.com/widget.js', 'abc123');
</script>
```

- `id` là `websiteCode` hoặc `apiKey` định danh website/tenant.
- `widget.js` sẽ tự động đọc `currentScript.src` để lấy thông tin cấu hình.

---

## 4. Luồng hoạt động

1. Khi widget được load:

   - Lấy thông tin cấu hình từ query (`id=abc123`)
   - Kiểm tra `localStorage` xem có session còn hạn không
   - Nếu chưa có hoặc đã hết hạn: gọi `/session/initiate` để tạo session mới
   - Nhận `sessionToken`, `sessionId`, `expiresIn` và lưu lại

2. Khi người dùng gửi tin nhắn:

   - Gửi đến `/chat/send` cùng với `sessionToken`
   - Nhận phản hồi từ chatbot, hiển thị lên giao diện

3. Khi người dùng reload:

   - Nếu session còn hạn, tự động khôi phục mà không cần tạo mới

---

## 5. Bảo mật

| Thành phần                | Ghi chú                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| Public API Key (`pk-...`) | Chỉ có quyền tạo session và gửi chat, không truy cập dữ liệu nhạy cảm |
| Origin check              | Backend xác minh `origin` từ header                                   |
| Token hết hạn             | JWT session token có TTL rõ ràng                                      |
| Session isolation         | Mỗi website chỉ được tạo session riêng biệt, không thể dùng chéo      |

---

## 6. Tùy chỉnh giao diện (giai đoạn đầu)

- Mặc định: bubble ở góc phải màn hình.
- Cho phép cấu hình qua biến toàn cục:

```js
window.ChatboxWidgetConfig = {
  position: 'left',
  themeColor: '#0066FF',
  title: 'Hỗ trợ khách hàng',
};
```

---

## 7. File xuất bản

| File         | Ghi chú                                      |
| ------------ | -------------------------------------------- |
| `widget.js`  | File UMD hoặc IIFE, minify, không phụ thuộc  |
| `widget.css` | Có thể inline hoặc load riêng (tuỳ cấu hình) |

---

## 8. Công nghệ sử dụng

| Công cụ           | Ghi chú                                         |
| ----------------- | ----------------------------------------------- |
| Vite + TypeScript | Dùng để build nhanh, hỗ trợ modern browser      |
| Lit / Vanilla JS  | UI component đơn giản, nhỏ gọn, không phụ thuộc |
| No framework      | Ưu tiên file gọn nhẹ nhất có thể                |

---

## 9. Kiểm thử

- Hoạt động trên mọi trang HTML tĩnh hoặc SPA phổ biến
- Không xung đột CSS với trang chính
- Session có thể khôi phục đúng sau reload/tab mới
- Token hết hạn sẽ tạo lại đúng cách

---

## 10. Mở rộng tương lai

| Tính năng           | Mô tả                                       |
| ------------------- | ------------------------------------------- |
| Giao diện đa chủ đề | Cho phép cấu hình light/dark/custom         |
| Tích hợp iframe     | Đóng gói UI trong iframe an toàn            |
| Tích hợp voice      | Hỗ trợ input đầu vào từ giọng nói           |
| Multi-agent UI      | Nhiều persona hoặc chế độ trả lời song song |
