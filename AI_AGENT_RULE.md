# Quy tắc cho AI Agent hỗ trợ lập trình dự án Frontend Widget.js

**Vai trò:** Bạn là một AI Agent hỗ trợ phát triển dự án `Frontend Widget.js`. Mục tiêu chính của bạn là viết mã nguồn chức năng, dễ bảo trì, có khả năng mở rộng và tái sử dụng cao, tuân thủ các thực tiễn tốt nhất và tiêu chuẩn của dự án.

**Ngữ cảnh dự án:**

- **Mục đích dự án:** Phát triển một widget JavaScript nhẹ, có thể nhúng, dùng cho giao diện người dùng chatbot AI SaaS.
- **Công nghệ chính:** Vite, TypeScript, Lit/Vanilla JS (không sử dụng các framework nặng).
- **Chức năng cốt lõi:** Quản lý phiên (sử dụng `localStorage`), tương tác API (`/session/initiate`, `/chat`), hiển thị giao diện người dùng (nút nổi, cửa sổ chat), cấu hình tùy chỉnh.
- **Bảo mật:** Sử dụng Public Widget API Key để khởi tạo phiên, Secure Session Token (JWT) cho các cuộc gọi tiếp theo, xác thực `Origin`.
- **Tài liệu:** Tham khảo `README.md`, `CONTRIBUTING.md`, `DEPLOYMENT.md`, `AI_AGENT_RULE.md`, `TASKS.md`, `docs/tech-stacks.md`, `docs/guide-standardizing-processing-content.md`, và các file trong `docs/tasks/` để hiểu toàn diện về dự án. Các tài liệu cũ có thể tìm thấy trong `docs/archived/`.

**Hướng dẫn đóng góp mã nguồn:**

1.  **Tuân thủ các nguyên tắc dự án:**

    - **Clean Code:** Ưu tiên mã nguồn dễ đọc, rõ ràng và dễ bảo trì.
    - **SOLID, DRY, KISS:** Áp dụng các nguyên tắc này trong tất cả các thiết kế và triển khai mã nguồn.
    - **Kiến trúc Module:** Thiết kế các thành phần độc lập, có trách nhiệm rõ ràng.
    - **TypeScript:** Sử dụng TypeScript để đảm bảo an toàn kiểu dữ liệu và cải thiện khả năng bảo trì.
    - **Hiệu suất:** Tối ưu hóa để có kích thước file nhỏ và tải nhanh. Tránh các thư viện lớn không cần thiết.
    - **Khả năng tương thích:** Đảm bảo widget hoạt động tốt trên nhiều trình duyệt và môi trường khác nhau.

2.  **Quản lý phiên:**

    - Luôn tham khảo `docs/client-session-flow.md` cho logic quản lý phiên phía client.
    - Sử dụng `localStorage` để lưu trữ dữ liệu phiên liên tục (`chatbot-token`, `chatbot-session-id`, `chatbot-expires-at`).
    - Xử lý đúng cách việc khởi tạo phiên (`/session/initiate`) và hết hạn token.

3.  **Tương tác API:**

    - Tham khảo `docs/widget-api.md` cho tất cả các endpoint API backend (`/session/initiate`, `/chat`), định dạng yêu cầu/phản hồi và cơ chế xác thực (Public Widget API Key, Secure Session Token, `x-session-id`, `Origin` header).
    - Đảm bảo tất cả các cuộc gọi API bao gồm các header và body cần thiết như đã chỉ định.

4.  **Triển khai giao diện người dùng (UI):**

    - Ưu tiên các giải pháp UI nhẹ (Lit/Vanilla JS) để giữ kích thước widget nhỏ.
    - Cân nhắc sử dụng Shadow DOM hoặc iframes để đóng gói UI nhằm ngăn chặn xung đột CSS/JS với các website của khách hàng.

5.  **Quy trình phát triển:**

    - Trước khi thực hiện thay đổi, hãy hiểu rõ codebase hiện có bằng cách đọc các file liên quan (`src/widget.ts`, `src/utils/`, `src/components/`).
    - Chạy `pnpm lint` và `pnpm format` để đảm bảo tính nhất quán về kiểu mã nguồn.
    - Nếu triển khai tính năng mới hoặc sửa lỗi nghiêm trọng, hãy cân nhắc cách thêm các bài kiểm thử tự động.

6.  **Tài liệu:**

    - Nếu các thay đổi của bạn giới thiệu các khái niệm mới hoặc thay đổi đáng kể các khái niệm hiện có, hãy cập nhật tài liệu liên quan (ví dụ: `README.md`, `CONTRIBUTING.md`, `DEPLOYMENT.md`, hoặc tạo các mục mới trong `docs/` nếu cần).
    - Đảm bảo tất cả mã nguồn được chú thích rõ ràng khi cần thiết.

7.  **Khắc phục sự cố:**
    - Khi gặp sự cố, trước tiên hãy kiểm tra nhật ký console của trình duyệt và các yêu cầu mạng.
    - Xác minh nội dung `localStorage` đối với các vấn đề liên quan đến phiên.
