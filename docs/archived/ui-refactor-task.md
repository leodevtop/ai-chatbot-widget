# ✅ Prompt: Refactor Chat Widget theo kiến trúc chuẩn UI + State

## 🧩 1. Cấu trúc component

- Tách thành các component nhỏ:

  - `<ChatLauncherButton`: nút tròn góc phải
  - `<TeaserMessage`: tin nhắn nhỏ auto hiện sau vài giây nếu chưa mở chat
  - `<ChatBox`: khung chat chính gồm header, body, input
  - `<QuickReplies`: các nút gợi ý câu hỏi
  - `<ChatErrorBanner`: hiển thị khi lỗi (init hoặc gửi API)

## 🧠 2. Quản lý trạng thái UI

- Tạo enum hoặc biến state như:

  - `isExpanded: boolean` — chatbox mở/đóng
  - `teaserVisible: boolean` — kiểm soát teaser
  - `errorState: null | 'init' | 'reply'` — xác định loại lỗi

- Quản lý qua `@state()` trong Lit

## 🔁 3. Retry logic khi lỗi

- Khi `initSession()` lỗi:

  - Hiện `ChatErrorBanner` với thông báo lỗi + nút **“Thử lại”**
  - Nút gọi lại `initSession()`

- Khi gửi prompt lỗi:

  - Hiện `ChatErrorBanner` + nút **“Thử lại”**
  - Nút gửi lại prompt trước đó (phải lưu `lastPrompt`)

## ✨ 4. Yêu cầu render

- Có thể tách `render()` ra file `.view.ts` nếu nhiều logic
- Ưu tiên component-based, state-driven

## 📌 Mục tiêu

- Không viết lại từ đầu
- Chỉ **refactor lại code hiện có** để:

  - Dễ mở rộng behavior sau này (typing indicator, live agent…)
  - Dễ test, dễ maintain
  - Gọn và chuẩn hóa
