# Frontend Widget.js

## Giới thiệu

Dự án `Frontend Widget.js` là một thành phần giao diện người dùng nhẹ, có thể nhúng trực tiếp vào bất kỳ website nào của khách hàng SaaS. Nó cung cấp giao diện tương tác giữa người dùng cuối và hệ thống AI chatbot, cho phép người dùng gửi và nhận tin nhắn từ backend API một cách liền mạch.

Đây là một phần của hệ sinh thái SaaS AI Chatbot lớn hơn, được thiết kế theo kiến trúc phân tán để đảm bảo tính bảo mật, khả năng mở rộng và dễ dàng quản lý.

## Tính năng chính

- **Giao diện chat nổi:** Cung cấp một nút nổi (floating button) và cửa sổ chat có thể nhúng vào bất kỳ website nào.
- **Quản lý phiên (Session Management):** Hỗ trợ khởi tạo phiên làm việc, gửi và nhận tin nhắn từ backend API. Tự động giữ trạng thái session trong `localStorage` để tái sử dụng giữa các lần tải trang hoặc tab mới.
- **Cấu hình linh hoạt:** Cho phép cấu hình đơn giản về giao diện (vị trí, màu sắc, tiêu đề) thông qua script nhúng hoặc biến toàn cục.
- **Bảo mật:** Sử dụng cơ chế xác thực hai bước với Public Widget API Key và Secure Session Token (JWT) ngắn hạn, cùng với kiểm tra `Origin` để đảm bảo an toàn.
- **Tương thích rộng:** Được thiết kế để hoạt động trên mọi trang HTML tĩnh hoặc SPA phổ biến mà không xung đột CSS.

## Cách nhúng vào website khách hàng

Widget được nhúng vào website của khách hàng theo phong cách Google Tag Manager bằng cách thêm một thẻ `<script>` vào phần `<head>` của trang HTML:

```html
<script>
  (function (w, d, s, u, i) {
    var js = d.createElement(s);
    js.src = u + '?id=' + i;
    js.async = true;
    d.head.appendChild(js);
  })(window, document, 'script', 'https://widget.chatbox.com/widget.js', 'YOUR_WEBSITE_CODE_OR_API_KEY');
</script>
```

- Thay thế `https://widget.chatbox.com/widget.js` bằng URL thực tế của file `widget.js` của bạn.
- Thay thế `YOUR_WEBSITE_CODE_OR_API_KEY` bằng `websiteCode` hoặc `apiKey` (Public Widget API Key) định danh website/tenant của bạn.

### Cấu hình tùy chỉnh (Tùy chọn)

Bạn có thể tùy chỉnh giao diện của widget bằng cách định nghĩa biến toàn cục `window.ChatboxWidgetConfig` trước khi nhúng script:

```js
window.ChatboxWidgetConfig = {
  position: 'left', // 'right' (mặc định) hoặc 'left'
  themeColor: '#0066FF', // Màu chủ đạo của widget
  title: 'Hỗ trợ khách hàng', // Tiêu đề hiển thị trong cửa sổ chat
};
```

## Kiến trúc kỹ thuật

- **File:** Một file JavaScript tĩnh (`widget.js`), có thể tải từ CDN hoặc domain riêng.
- **Giao diện UI:** Có thể là Shadow DOM, iframe hoặc inline DOM tùy cấu hình.
- **Lưu trữ trạng thái:** Sử dụng `localStorage` để lưu `sessionToken`, `sessionId`, `expiresAt`.
- **API endpoints:** Gọi đến backend như `/session/initiate` và `/chat`.
- **Công nghệ:** Vite + TypeScript để build nhanh, Lit / Vanilla JS cho UI component đơn giản, nhỏ gọn, không phụ thuộc framework. Sử dụng `marked` để parse markdown và `DOMPurify` để sanitize nội dung từ AI.

## Luồng hoạt động của Session (Client-side)

1.  **Khi widget được load:**
    - Lấy thông tin cấu hình từ query (`id=abc123`).
    - Kiểm tra `localStorage` xem có session còn hạn không (`chatbot-token`, `chatbot-session-id`, `chatbot-expires-at`).
    - Nếu chưa có hoặc đã hết hạn: gọi `POST /session/initiate` để tạo session mới.
    - Nhận `token`, `sessionId`, `expiresIn` và lưu lại vào `localStorage`.
2.  **Khi người dùng gửi tin nhắn:**
    - Gửi đến `POST /chat` cùng với Secure Session Token và Session ID.
    - Nhận phản hồi từ chatbot, hiển thị lên giao diện.
3.  **Khi người dùng reload/mở tab mới:**
    - Nếu session còn hạn trong `localStorage`, tự động khôi phục mà không cần tạo mới.
    - Nếu token hết hạn, một session mới sẽ được yêu cầu.

## Tương tác API với Backend

`widget.js` tương tác với Backend API thông qua các endpoint sau:

- **`POST /session/initiate`**:
  - **Mô tả:** Endpoint đầu tiên được gọi để lấy Secure Session Token. Yêu cầu Public Widget API Key trong header `x-api-key` và `Origin` hợp lệ.
  - **Phản hồi:** Trả về `token` (Secure Session Token JWT), `sessionId` (UUID gốc), và `expiresIn` (thời gian hết hạn).
- **`POST /chat`**:
  - **Mô tả:** Gửi tin nhắn đến chatbot và nhận phản hồi. Yêu cầu `Authorization: Bearer <Secure Session Token>` và `x-session-id` trong header.
  - **Phản hồi:** Trả về `response` (câu trả lời của AI) và `context` (tùy chọn, các đoạn ngữ cảnh RAG).

## Bảo mật

- **Public API Key (`pk-...`):** Chỉ có quyền tạo session và gửi chat, không truy cập dữ liệu nhạy cảm.
- **Origin check:** Backend xác minh `origin` từ header của mọi yêu cầu.
- **Token hết hạn:** JWT session token có TTL rõ ràng và được ký bằng khóa bí mật của Backend.
- **Session isolation:** Mỗi website chỉ được tạo session riêng biệt, không thể dùng chéo.
- **Secure Session Token (JWT):** Được sử dụng cho các yêu cầu chat tiếp theo, có thời gian sống ngắn và chứa các thông tin cần thiết như `sessionId`, `ownerId`, `origin`, và `scopes`.

## Phát triển

Dự án sử dụng Vite và TypeScript để xây dựng. Các thành phần UI được viết bằng Lit hoặc Vanilla JS để đảm bảo kích thước file nhỏ gọn và không phụ thuộc framework.

### Cài đặt

```bash
# Cài đặt dependencies
pnpm install
```

### Chạy phát triển

```bash
# Chạy server phát triển
pnpm dev
```

### Build sản phẩm

```bash
# Build ra file widget.js và widget.css
pnpm build
```

## Mở rộng tương lai

- Giao diện đa chủ đề (light/dark/custom).
- Tích hợp UI trong iframe an toàn.
- Hỗ trợ input đầu vào từ giọng nói.
- Multi-agent UI (nhiều persona hoặc chế độ trả lời song song).
