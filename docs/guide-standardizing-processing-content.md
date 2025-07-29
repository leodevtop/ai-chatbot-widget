# Hướng dẫn chuẩn hóa và xử lý nội dung từ mô hình AI (Widget.js)

## Mục tiêu

- **Toàn bộ nội dung trả về từ AI model là dạng markdown nguyên khối**
- **Không stream từng chunk**
- Tập trung xử lý an toàn, phân loại nội dung tại widget
- Chuẩn hóa đầu ra của mô hình AI trả về cho widget.
- Tránh stream, tránh xử lý phức tạp phía widget.
- Đảm bảo frontend hiển thị nội dung an toàn, đúng định dạng và có khả năng tùy biến.

---

## 1. Định dạng chuẩn của phản hồi từ API

Mọi phản hồi từ mô hình đều được chuẩn hóa thành 1 object có dạng:

````json
{
  "role": "assistant",
  "content": "```json\n{\"email\": \"hello@example.com\"}\n```",
  "format": "markdown"
}
````

### Giải thích:

| Trường    | Ý nghĩa                                                     |
| --------- | ----------------------------------------------------------- |
| `role`    | Luôn là `"assistant"` với nội dung phản hồi                 |
| `content` | Một chuỗi markdown đầy đủ, không phân đoạn                  |
| `format`  | Mặc định `"markdown"` – dùng để xác định cách widget render |

> Nội dung có thể bao gồm tiêu đề, đoạn văn, danh sách, code block, hoặc JSON bên trong markdown.

---

## 2. Không sử dụng stream

### Quy định:

- Toàn bộ phản hồi được trả về 1 lần dưới dạng **markdown nguyên khối** (`string`).
- **Không sử dụng stream** (`chunk`, SSE, multipart\`) trong giai đoạn này.
- Việc tách đoạn, delay typing, hiệu ứng typing (nếu có) sẽ được xử lý phía frontend.

---

## 3. Xử lý nội dung tại Widget

### Bước 1: Nhận nội dung từ API

```ts
const raw = response.content;
```

### Bước 2: Parse markdown

```ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked.parse(raw));
```

### Bước 3: Gắn vào UI

```ts
messageBox.innerHTML = html;
```

---

## 4. Phân loại nội dung (tuỳ chọn mở rộng)

Tuy không stream, nhưng `content` có thể chứa các loại đặc biệt:

| Dạng nội dung | Ví dụ                    | Cách nhận biết                             |
| ------------- | ------------------------ | ------------------------------------------ |
| Plain text    | `Hello, how can I help?` | Không có markdown đặc biệt                 |
| Code block    | `ts\nconst x = 1;\n`     | Có dấu \`\`\`                              |
| JSON nội bộ   | `json\n{...}`            | Có format `json`                           |
| Tool call     | Mô phỏng gọi hàm         | Có thể detect qua code block json đặc biệt |

> Widget parser (`message.parser.ts`) nên kiểm tra code block `json` và định dạng đặc biệt để render linh hoạt hơn (ví dụ: collapse JSON, render bảng...).

---

## 5. Gợi ý cấu trúc xử lý phía widget

```ts
// message.service.ts → Gọi API
// message.parser.ts  → Nhận dạng, phân loại nội dung
// message.renderer.ts → Trả HTML đã xử lý
// ChatWidget.ts      → Hiển thị UI
```

---

## 6. Tổng kết

| Vấn đề                      | Hướng triển khai                        |
| --------------------------- | --------------------------------------- |
| Streaming / phân đoạn       | Không sử dụng                           |
| Nội dung trả về             | 1 chuỗi markdown nguyên khối            |
| Xử lý nội dung              | Ở widget (parse, sanitize, render)      |
| Parser phân loại            | Có, nhưng dựa trên markdown             |
| Giao diện tuỳ chỉnh sau này | Có thể nâng cấp theo từng dạng nội dung |

---

Bạn muốn mình:

- Lưu nội dung này thành file `.md` mới và cung cấp cho bạn?
- Tạo `message.parser.ts` mẫu để phát hiện JSON/code block không?

Chỉ cần bạn yêu cầu.
