# Chat Widget - SaaS AI Frontend

## Giới thiệu

Dự án này là một widget chat có thể nhúng, được xây dựng bằng Lit, TypeScript và Vite. Nó cung cấp một giao diện người dùng gọn nhẹ để tương tác với các dịch vụ AI chatbot, có thể dễ dàng tích hợp vào bất kỳ trang web nào.

Widget được thiết kế để có khả năng tùy biến cao, quản lý trạng thái hiệu quả thông qua các controller phản ứng (reactive controllers), và tuân thủ các thực tiễn phát triển web hiện đại.

## Tính năng chính

- **Kiến trúc dựa trên Web Components:** Sử dụng Lit để tạo ra các custom elements có thể tái sử dụng và đóng gói.
- **Quản lý trạng thái phản ứng:** Tách biệt logic khỏi UI bằng cách sử dụng các Reactive Controllers (`useChatState`, `useAutoTeaser`, `useTypingIndicator`).
- **Tự động quản lý phiên:** Tự động xử lý việc tạo, lưu trữ và khôi phục phiên làm việc của người dùng qua `localStorage`.
- **Tùy chỉnh linh hoạt:** Dễ dàng thay đổi giao diện và hành vi thông qua các thuộc tính HTML của widget.
- **Build hiệu quả:** Sử dụng Vite để có trải nghiệm phát triển nhanh và build ra một file JavaScript duy nhất.

## Cách nhúng và Cấu hình

### Nhúng Widget

Widget được thiết kế để tự động mount vào trang. Bạn chỉ cần nhúng file script đã được build vào trang HTML của mình:

```html
<script type="module" src="/path/to/your/widget.js?id=YOUR_SITE_ID"></script>
```
Trong đó `YOUR_SITE_ID` là Public Widget API Key định danh website của bạn.

### Tùy chỉnh Widget

Bạn có thể tùy chỉnh widget trực tiếp thông qua các thuộc tính trên thẻ HTML `chat-widget` (nếu bạn mount thủ công) hoặc thông qua các tham số trên URL của script.

**Ví dụ:**
```html
<!-- Các thuộc tính này sẽ được script mount tự động đọc -->
<script type="module" src="/widget.js?id=pk-123&themeColor=%230066FF&title=Hỗ%20trợ"></script>
```

**Các thuộc tính có sẵn:**

- `site-id` / `id`: (Bắt buộc) ID định danh cho website của bạn.
- `theme-color`: Màu sắc chủ đạo của widget (mặc định: `#4caf50`).
- `title`: Tiêu đề hiển thị trên header của chat box (mặc định: `Chatbot`).
- `position`: Vị trí của widget, `left` hoặc `right` (mặc định: `right`).
- `quick-replies-default`: Danh sách các câu trả lời nhanh mặc định, phân tách bởi dấu `|`.

## Kiến trúc & Luồng hoạt động

### Công nghệ & Cấu trúc

- **Framework:** [Lit](https://lit.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Công cụ Build:** [Vite](https://vitejs.dev/)
- **Quản lý gói:** [pnpm](https://pnpm.io/)

```
/src
├── components/         # Các thành phần UI (Web Components)
├── logic/              # Logic nghiệp vụ, không phụ thuộc UI
│   ├── api/            # Giao tiếp với backend
│   ├── hooks/          # Các Reactive Controllers (hooks)
│   └── utils/          # Các hàm tiện ích
├── types/              # Định nghĩa các kiểu dữ liệu chung
└── mount.ts            # Điểm khởi đầu, tự động mount widget
```

### Luồng hoạt động của Session

1.  **Khi widget được load:**
    - Kiểm tra `localStorage` xem có session còn hạn không (`chatbot-token`, `chatbot-session-id`, `chatbot-expires-at`).
    - Nếu chưa có hoặc đã hết hạn: gọi `POST /session/initiate` để tạo session mới.
    - Nhận `token`, `sessionId`, `expiresIn` và lưu lại vào `localStorage`.
2.  **Khi người dùng gửi tin nhắn:**
    - Gửi đến `POST /chat` cùng với Secure Session Token và Session ID.
    - Nhận phản hồi từ chatbot, hiển thị lên giao diện.
3.  **Khi người dùng reload/mở tab mới:**
    - Nếu session còn hạn trong `localStorage`, tự động khôi phục mà không cần tạo mới.

### Tương tác API với Backend

- **`POST /session/initiate`**:
  - **Mô tả:** Endpoint đầu tiên được gọi để lấy Secure Session Token. Yêu cầu Public Widget API Key trong header `x-api-key` và `Origin` hợp lệ.
  - **Phản hồi:** Trả về `token` (Secure Session Token JWT), `sessionId` (UUID gốc), và `expiresIn` (thời gian hết hạn).
- **`POST /chat`**:
  - **Mô tả:** Gửi tin nhắn đến chatbot và nhận phản hồi. Yêu cầu `Authorization: Bearer <Secure Session Token>` và `x-session-id` trong header.
  - **Phản hồi:** Trả về `response` (câu trả lời của AI).

## Bảo mật

- **Public API Key (`pk-...`):** Chỉ có quyền tạo session và gửi chat, không truy cập dữ liệu nhạy cảm.
- **Origin check:** Backend xác minh `origin` từ header của mọi yêu cầu.
- **Token hết hạn:** JWT session token có TTL rõ ràng và được ký bằng khóa bí mật của Backend.
- **Session isolation:** Mỗi website chỉ được tạo session riêng biệt, không thể dùng chéo.
- **Secure Session Token (JWT):** Được sử dụng cho các yêu cầu chat tiếp theo, có thời gian sống ngắn.

## Phát triển

### Yêu cầu

- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
- [pnpm](https://pnpm.io/installation)

### Cài đặt

Cài đặt các dependencies của dự án:
```bash
pnpm install
```

### Chạy server phát triển

Khởi động server phát triển của Vite với tính năng hot-reload:
```bash
pnpm dev
```
Server sẽ chạy tại `http://localhost:5173`.

### Build sản phẩm

Biên dịch và đóng gói widget thành một file JavaScript duy nhất để triển khai:
```bash
pnpm build
```
File kết quả sẽ được tạo trong thư mục `dist/`.

### Chạy kiểm thử

Chạy các bài kiểm thử đơn vị (unit tests) bằng Vitest:
```bash
pnpm test
```

## Mở rộng tương lai

- Giao diện đa chủ đề (light/dark/custom).
- Tích hợp UI trong iframe an toàn.
- Hỗ trợ input đầu vào từ giọng nói.
- Multi-agent UI (nhiều persona hoặc chế độ trả lời song song).
