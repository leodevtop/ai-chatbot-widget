
# Logic UI, hành vi, xử lý lỗi và khả năng retry

## 1. Giao diện ban đầu:

* Hiển thị một **nút tròn (launcher button)** ở góc dưới bên phải màn hình.
* Sau 3 giây, nếu người dùng chưa bấm vào, hiển thị một **tin nhắn teaser nhỏ** bên trên nút, ví dụ: “Xin chào! Tôi có thể giúp gì?”

## 2. Khi người dùng bấm nút:

* Mở **chatbox**, hiển thị các thành phần:

  * Header với nút thu gọn
  * Danh sách message
  * Nút gợi ý câu hỏi thường gặp (Quick Replies)
  * Ô nhập tin nhắn
* Gửi một tin nhắn chào mừng vào chatbox, ví dụ: “Xin chào! Tôi có thể giúp gì?”
* Hiển thị Quick Replies như: “Giá dịch vụ”, “Cách sử dụng”, “Tư vấn AI”

## 3. Khởi tạo phiên (`initSession`)

* Nếu thất bại khi gọi API khởi tạo phiên:

  * Không chỉ hiển thị message lỗi
  * Mà còn hiển thị **nút “Thử lại”**, bấm vào sẽ gọi lại `initSession()`

## 4. Khi người dùng gửi câu hỏi:

* Gửi yêu cầu đến API
* Nếu API phản hồi lỗi (timeout, network...):

  * Hiển thị message lỗi: “Không nhận được phản hồi”
  * Kèm nút “Thử lại”, bấm vào sẽ gửi lại prompt cuối cùng (resend)

## 5. Yêu cầu kỹ thuật:

* Sử dụng **Lit (v3)** để viết component
* Dùng **@state()** cho quản lý trạng thái (`expanded`, `errorState`, `teaserVisible`, ...)
* Cho phép tách `render()` ra file `.view.ts` riêng nếu cần
* Viết hướng component-based và state-driven rõ ràng

## 6. (Tuỳ chọn) Nếu bạn thấy cần, hãy gợi ý thêm cách chia nhỏ component:

* `<ChatLauncherButton`, `<TeaserMessage`, `<ChatBox`, `<QuickReplies`, `<ChatErrorBanner`, v.v.

---

### 🧠 Mục tiêu chính

Mục tiêu là tạo một widget chat hiện đại:
* Thân thiện
* Có thể retry nếu lỗi
* Giao diện gọn nhẹ
* Hành vi tương tự TalkTo, Intercom
