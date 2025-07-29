# Hướng dẫn triển khai và vận hành Frontend Widget.js

Tài liệu này mô tả quy trình triển khai (deployment) và các khía cạnh vận hành (operations) của `Frontend Widget.js`, nhằm đảm bảo widget hoạt động ổn định, hiệu quả và an toàn trong môi trường production.

## 1. Quy trình triển khai (Deployment Process)

`Frontend Widget.js` được thiết kế để triển khai dưới dạng một file JavaScript tĩnh (`widget.js`) và một file CSS tĩnh (`widget.css`).

### 1.1. Build sản phẩm

Trước khi triển khai, bạn cần build dự án để tạo ra các file tối ưu cho production:

```bash
pnpm build
```

Lệnh này sẽ tạo ra thư mục `dist/` chứa:

- `widget.js`: File JavaScript đã được minify và bundle.
- `widget.css`: File CSS đã được minify.

### 1.2. Lưu trữ và phân phối (Hosting and Distribution)

Các file `widget.js` và `widget.css` nên được lưu trữ trên một dịch vụ phân phối nội dung (CDN - Content Delivery Network) để đảm bảo tốc độ tải nhanh và độ tin cậy cao cho người dùng cuối trên toàn cầu.

**Các lựa chọn phổ biến:**

- **Amazon CloudFront / S3:** Kết hợp S3 để lưu trữ và CloudFront để phân phối CDN.
- **Google Cloud CDN / Cloud Storage:** Tương tự như AWS.
- **Cloudflare:** Cung cấp dịch vụ CDN và các tính năng bảo mật bổ sung.
- **Tên miền riêng:** Bạn có thể cấu hình CDN để phân phối widget từ một tên miền con riêng, ví dụ: `widget.your-domain.com`. Điều này giúp quản lý dễ dàng và tăng cường nhận diện thương hiệu.

**Ví dụ cấu trúc URL:**

- `https://widget.your-domain.com/widget.js`
- `https://widget.your-domain.com/widget.css` (nếu bạn chọn tải CSS riêng)

### 1.3. Cập nhật phiên bản (Versioning)

Để quản lý các bản cập nhật và đảm bảo tính tương thích ngược, bạn nên áp dụng chiến lược versioning cho widget.

**Các phương pháp:**

- **URL Versioning:** Thêm số phiên bản vào URL của file widget.
  - Ví dụ: `https://widget.your-domain.com/v1/widget.js`, `https://widget.your-domain.com/v2/widget.js`
  - **Ưu điểm:** Cho phép khách hàng kiểm soát phiên bản widget họ đang sử dụng, tránh các thay đổi đột ngột.
  - **Nhược điểm:** Yêu cầu khách hàng cập nhật mã nhúng thủ công khi có phiên bản mới.
- **Cache Busting (Hash):** Sử dụng hash của nội dung file trong tên file (ví dụ: `widget.1a2b3c4d.js`).
  - **Ưu điểm:** Đảm bảo người dùng luôn tải phiên bản mới nhất khi có thay đổi, tận dụng tối đa cache.
  - **Nhược điểm:** Không cho phép khách hàng "khóa" vào một phiên bản cụ thể.

**Khuyến nghị:**
Sử dụng URL versioning cho các bản phát hành lớn (major/minor versions) để khách hàng có thể chọn phiên bản ổn định. Đối với các bản vá lỗi nhỏ (patch versions), có thể sử dụng cache busting hoặc ghi đè file trên cùng một URL phiên bản.

## 2. Vận hành (Operations)

### 2.1. Giám sát (Monitoring)

- **Giám sát hiệu suất CDN:** Theo dõi tốc độ tải, tỷ lệ lỗi của CDN.
- **Giám sát lỗi JavaScript:** Sử dụng các công cụ như Sentry, Bugsnag, hoặc Google Analytics để theo dõi các lỗi JavaScript phát sinh trên website của khách hàng. Điều này cực kỳ quan trọng để phát hiện sớm các vấn đề tương thích hoặc lỗi runtime.
- **Giám sát API Backend:** Đảm bảo các endpoint mà widget gọi (`/session/initiate`, `/chat`) hoạt động ổn định và có độ trễ thấp.

### 2.2. Nhật ký (Logging)

- **Client-side Logging:** Triển khai cơ chế logging trong widget để ghi lại các sự kiện quan trọng (khởi tạo session, gửi/nhận tin nhắn, lỗi API) và gửi về một dịch vụ logging tập trung (ví dụ: Datadog, ELK Stack) nếu cần thiết cho việc debug.
- **Server-side Logging:** Backend API phải có nhật ký chi tiết về các yêu cầu từ widget, bao gồm `Origin`, `API Key` được sử dụng, `Session ID`, và các lỗi phát sinh.

### 2.3. Bảo mật (Security)

- **Cập nhật CDN:** Đảm bảo CDN của bạn được cấu hình với các tiêu chuẩn bảo mật mới nhất (TLS 1.2+, HSTS).
- **Kiểm tra Origin:** Backend API phải luôn xác minh `Origin` header của mọi yêu cầu từ widget để chỉ cho phép các domain đã được cấu hình.
- **Quản lý API Key:** Thường xuyên kiểm tra và xoay vòng (rotate) các Public Widget API Key nếu có bất kỳ nghi ngờ nào về việc bị lộ.
- **Giám sát lưu lượng bất thường:** Theo dõi lưu lượng truy cập đến widget và các endpoint API để phát hiện các hành vi bất thường (ví dụ: tấn công DDoS, brute-force API key).

### 2.4. Khắc phục sự cố (Troubleshooting)

- **Kiểm tra Console trình duyệt:** Hướng dẫn khách hàng kiểm tra console của trình duyệt để tìm các lỗi JavaScript hoặc lỗi mạng liên quan đến widget.
- **Kiểm tra Network Tab:** Hướng dẫn kiểm tra các yêu cầu API đi và đến từ widget trong tab Network của trình duyệt để xác định lỗi API (ví dụ: 401 Unauthorized, 403 Forbidden, 500 Internal Server Error).
- **Kiểm tra `localStorage`:** Hướng dẫn kiểm tra các giá trị `chatbot-token`, `chatbot-session-id`, `chatbot-expires-at` trong `localStorage` để xác định vấn đề về quản lý session.
- **Kiểm tra cấu hình nhúng:** Đảm bảo mã nhúng widget trên website khách hàng là chính xác và không có lỗi cú pháp.

## 3. Mở rộng và Tối ưu hóa

- **Tối ưu hóa kích thước:** Liên tục tìm cách giảm kích thước file `widget.js` và `widget.css` để cải thiện tốc độ tải.
- **Tải không đồng bộ:** Đảm bảo widget được tải không đồng bộ (`async` attribute trong script tag) để không chặn render của trang chính.
- **Tích hợp Shadow DOM/Iframe:** Nếu có thể, sử dụng Shadow DOM hoặc Iframe để đóng gói UI của widget, tránh xung đột CSS và JavaScript với website của khách hàng.
