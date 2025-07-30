# 05. Refactor UI Components

## Overview

Tài liệu này mô tả kế hoạch tái cấu trúc `ChatbotWidget` để chia rõ UI và trạng thái theo hướng rõ ràng, có thể mở rộng, tái sử dụng thành phần và dễ bảo trì.

## Checklist

### 1. Cấu trúc component

- [x] Tách `<ChatLauncherButton>`: nút tròn góc phải.
  - [x] Tạo file `src/components/chat-launcher-button/chat-launcher-button.ts`.
  - [x] Di chuyển logic liên quan đến nút mở/đóng chat vào component này.
  - [x] Cập nhật `ChatbotWidget` để sử dụng component mới.
- [x] Tách `<TeaserMessage>`: tin nhắn nhỏ auto hiện sau vài giây nếu chưa mở chat.
  - [x] Tạo file `src/components/teaser-message/teaser-message.ts`.
  - [x] Di chuyển logic hiển thị teaser message vào component này.
  - [x] Cập nhật `ChatbotWidget` để sử dụng component mới.
- [x] Tách `<ChatBox>`: khung chat chính gồm header, body, input.
  - [x] Tạo file `src/components/chat-box/chat-box.ts`.
  - [x] Di chuyển logic render header, messages, input area vào component này.
  - [x] Cập nhật `ChatbotWidget` để sử dụng component mới và truyền dữ liệu/hàm xử lý qua props.
- [x] Tách `<QuickReplies>`: các nút gợi ý câu hỏi.
  - [x] Tạo file `src/components/quick-replies/quick-replies.ts`.
  - [x] Di chuyển logic hiển thị và xử lý quick replies vào component này.
  - [x] Cập nhật `ChatboxWidget` để sử dụng component mới.
- [x] Tách `<ChatErrorBanner>`: hiển thị khi lỗi (init hoặc gửi API).
  - [x] Tạo file `src/components/chat-error-banner/chat-error-banner.ts`.
  - [x] Di chuyển logic hiển thị lỗi và nút "Thử lại" vào component này.
  - [x] Cập nhật `ChatboxWidget` để sử dụng component mới.

### 2. Quản lý trạng thái UI

- [ ] Xác định và tập trung các biến trạng thái UI chính trong `ChatbotWidget`.
  - [x] `isChatOpen: boolean` (đã có)
  - [x] `teaserVisible: boolean` (mới)
  - [x] `errorState: null | 'init' | 'reply'` (mới)
- [ ] Đảm bảo các component con nhận trạng thái thông qua `@property` và phát sự kiện (`@event`) khi có tương tác.

### 3. Retry logic khi lỗi

- [x] Cập nhật `ChatErrorBanner` để xử lý các loại lỗi khác nhau.
- [x] Khi `initSession()` lỗi:
  - [x] Hiển thị `ChatErrorBanner` với thông báo lỗi khởi tạo + nút **“Thử lại”**.
  - [x] Nút gọi lại `initSession()` thông qua sự kiện.
- [x] Khi gửi prompt lỗi:
  - [x] Hiện `ChatErrorBanner` với thông báo lỗi gửi + nút **“Thử lại”**.
  - [x] Lưu `lastPrompt` trong `ChatbotWidget` để gửi lại.
  - [x] Nút gửi lại prompt trước đó thông qua sự kiện.

### 4. Yêu cầu render

- [ ] Đảm bảo `render()` của `ChatbotWidget` chỉ tập trung vào việc điều phối các component con.
- [ ] Xem xét tách `render()` ra file `.view.ts` nếu logic quá phức tạp (sẽ đánh giá sau khi tách component).

### Mục tiêu

- Không viết lại từ đầu, chỉ refactor code hiện có.
- Dễ mở rộng behavior sau này (typing indicator, live agent…).
- Dễ test, dễ maintain.
- Gọn và chuẩn hóa.
