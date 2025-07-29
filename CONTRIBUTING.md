# Hướng dẫn đóng góp cho Frontend Widget.js

Chào mừng bạn đến với dự án `Frontend Widget.js`! Chúng tôi rất vui khi bạn quan tâm đến việc đóng góp để cải thiện và mở rộng thành phần chatbot này. Tài liệu này sẽ hướng dẫn bạn cách thiết lập môi trường phát triển, quy trình đóng góp, và các nguyên tắc cần tuân thủ.

## 1. Thiết lập môi trường phát triển

Để bắt đầu làm việc với dự án, bạn cần cài đặt các công cụ sau:

- **Node.js:** Phiên bản 18 trở lên.
- **pnpm:** Trình quản lý gói được khuyến nghị. Nếu chưa có, bạn có thể cài đặt bằng npm: `npm install -g pnpm`.

Sau khi có các công cụ trên, hãy clone repository và cài đặt dependencies:

```bash
# Clone repository
git clone https://github.com/your-org/saas-ai-fe.git # Thay thế bằng URL repo thực tế
cd saas-ai-fe

# Cài đặt dependencies
pnpm install
```

### Chạy dự án trong chế độ phát triển

Dự án sử dụng Vite để phát triển. Bạn có thể khởi động server phát triển bằng lệnh:

```bash
pnpm dev
```

Thao tác này sẽ khởi chạy một server phát triển cục bộ, thường là tại `http://localhost:5173` (hoặc một cổng khác). Bạn có thể mở file HTML mẫu hoặc tích hợp widget vào một trang web thử nghiệm để xem các thay đổi của mình.

### Build sản phẩm

Để tạo ra các file `widget.js` và `widget.css` sẵn sàng cho môi trường production, bạn chạy lệnh build:

```bash
pnpm build
```

Các file đầu ra sẽ nằm trong thư mục `dist/`.

## 2. Quy trình đóng góp

Chúng tôi tuân thủ quy trình đóng góp dựa trên Gitflow hoặc GitHub Flow. Vui lòng làm theo các bước sau:

1.  **Fork Repository:** Fork dự án về tài khoản GitHub của bạn.
2.  **Tạo Branch mới:** Tạo một branch mới từ branch `main` (hoặc `develop` nếu có) với tên mô tả rõ ràng tính năng/sửa lỗi của bạn (ví dụ: `feature/add-custom-theme`, `fix/session-bug`).
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/your-feature-name
    ```
3.  **Thực hiện thay đổi:** Viết code, thêm tính năng, sửa lỗi. Đảm bảo code của bạn tuân thủ các nguyên tắc code dưới đây.
4.  **Viết Test (nếu có):** Nếu thay đổi của bạn liên quan đến logic quan trọng, hãy viết các bài kiểm thử tương ứng.
5.  **Chạy Linter/Formatter:** Đảm bảo code của bạn tuân thủ các quy tắc linting và formatting của dự án.
    ```bash
    pnpm lint
    pnpm format
    ```
6.  **Commit thay đổi:** Viết commit message rõ ràng, súc tích, mô tả những gì bạn đã thay đổi.
    ```bash
    git commit -m "feat: Add custom theme configuration"
    ```
7.  **Push Branch:** Đẩy branch của bạn lên repository đã fork.
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Tạo Pull Request (PR):** Mở một Pull Request từ branch của bạn về branch `main` (hoặc `develop`) của repository gốc.
    - Mô tả chi tiết các thay đổi trong PR.
    - Tham chiếu đến bất kỳ issue nào liên quan.
    - Đảm bảo tất cả các bài kiểm thử và kiểm tra CI/CD đều vượt qua.
9.  **Review:** Đợi review từ maintainer. Sẵn sàng phản hồi các bình luận và thực hiện các thay đổi được yêu cầu.

## 3. Nguyên tắc viết Code

Chúng tôi khuyến khích tuân thủ các nguyên tắc sau để đảm bảo chất lượng và tính nhất quán của codebase:

- **Clean Code:** Viết code dễ đọc, dễ hiểu, dễ bảo trì.
- **SOLID Principles:** Áp dụng các nguyên tắc SOLID khi thiết kế các module và class.
- **DRY (Don't Repeat Yourself):** Tránh lặp lại code.
- **KISS (Keep It Simple, Stupid):** Giữ cho giải pháp đơn giản nhất có thể.
- **Modular Architecture:** Thiết kế các thành phần độc lập, có trách nhiệm rõ ràng.
- **TypeScript:** Sử dụng TypeScript để đảm bảo an toàn kiểu dữ liệu và cải thiện khả năng bảo trì.
- **Hiệu suất:** Tối ưu hóa code để đảm bảo widget nhỏ gọn và tải nhanh. Tránh các thư viện lớn không cần thiết.
- **Khả năng tương thích:** Đảm bảo widget hoạt động tốt trên các trình duyệt và môi trường khác nhau.
- **Xử lý nội dung:** Sử dụng `marked` để parse markdown và `DOMPurify` để sanitize nội dung trả về từ AI, đảm bảo an toàn và hiển thị đúng định dạng.

## 4. Cấu trúc dự án

```
.
├── public/                 # Các file tĩnh (ví dụ: index.html để test)
├── src/                    # Mã nguồn chính của widget
│   ├── assets/             # Tài nguyên (ví dụ: icon, hình ảnh)
│   ├── components/         # Các UI component (nếu có)
│   ├── utils/              # Các hàm tiện ích
│   ├── styles/             # CSS/SCSS cho widget
│   └── widget.ts           # Điểm vào chính của widget
├── docs/                   # Thư mục chứa tài liệu dự án
│   ├── archived/           # Tài liệu cũ/tham khảo
│   ├── tasks/              # Các file công việc chi tiết
│   └── tech-stacks.md      # Tài liệu về công nghệ sử dụng
│   └── guide-standardizing-processing-content.md # Hướng dẫn xử lý nội dung AI
├── .gitignore              # Các file/thư mục bị bỏ qua bởi Git
├── .prettierrc             # Cấu hình Prettier (code formatter)
├── package.json            # Thông tin dự án và dependencies
├── pnpm-lock.yaml          # Lock file của pnpm
├── README.md               # Tổng quan dự án
├── CONTRIBUTING.md         # Hướng dẫn đóng góp
├── DEPLOYMENT.md           # Hướng dẫn triển khai
├── AI_AGENT_RULE.md        # Quy tắc cho AI Agent
├── TASKS.md                # Danh sách công việc tổng quan
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite
```

## 5. Liên hệ

Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, đừng ngần ngại mở một issue trên GitHub hoặc liên hệ với đội ngũ phát triển.

Cảm ơn bạn đã đóng góp!
