# Widget API Reference

Tài liệu này mô tả cách `Frontend Widget.js` tương tác với Backend API để cung cấp chức năng chatbot cho người dùng cuối.

## 1. Giới thiệu

Widget API là tập hợp các endpoint mà `widget.js` sử dụng để gửi yêu cầu chat, nhận phản hồi từ AI, và quản lý phiên hội thoại. Nó được thiết kế để đơn giản và hiệu quả, cho phép tích hợp dễ dàng vào bất kỳ website nào của khách hàng SaaS.

## 2. Luồng Xác thực Widget

Để tăng cường bảo mật và đơn giản hóa việc tích hợp cho khách hàng, `widget.js` sử dụng cơ chế xác thực hai bước:

1.  **Public Widget API Key (Publishable Key):**
    - Được tạo từ Tenant Admin Panel, key này được nhúng trực tiếp vào `widget.js` hoặc cấu hình khi nhúng script.
    - Key này **không phải là bí mật** và chỉ có một quyền hạn duy nhất: `session:initiate` (khởi tạo phiên).
    - Nó được sử dụng cho yêu cầu đầu tiên đến Backend API để lấy Secure Session Token.

2.  **Secure Session Token (JWT) ngắn hạn:**
    - Sau khi Public Widget API Key được xác thực, Backend API sẽ trả về một Secure Session Token (JWT) có thời gian sống ngắn (ví dụ: 1 giờ) và được ký bằng khóa bí mật của Backend.
    - Token này chứa các thông tin cần thiết như `sessionId`, `ownerId`, `origin` và các `scopes` cho phép thực hiện các hành động chat.
    - `widget.js` sẽ lưu trữ token này (ví dụ: trong `sessionStorage`) và sử dụng nó cho tất cả các yêu cầu API tiếp theo.

**Luồng xác thực chi tiết:**

```mermaid
graph TD
    subgraph "Website của Khách hàng"
        A[Người dùng cuối]
        B[Frontend (Trình duyệt) + Widget.js]
    end

    subgraph "Hệ thống Backend của bạn"
        C[Backend API]
        D[(Database: PostgreSQL)]
    end

    A -- Tương tác --> B
    B -- (1. Yêu cầu: Public Widget API Key + Origin) --> C{/session/initiate}
    C -- (2. Xác thực Public Key & Origin; Tạo Secure Session Token) --> B
    B -- (3. Các yêu cầu chat tiếp theo: Secure Session Token + Session ID + Origin) --> C{/chat}
    C -- (4. Xác thực Secure Session Token & Session ID; Kiểm tra Scopes) --> D
```

## 3. Sơ đồ ERD liên quan (Bản gọn)

Sơ đồ này tập trung vào các bảng cơ sở dữ liệu chính liên quan đến tương tác của widget và cách lịch sử chat được lưu trữ:

```mermaid
erDiagram
  WEBSITES {
    UUID id PK
    TEXT code
    TEXT name
    TEXT domain
  }

  API_KEYS {
    UUID id PK
    UUID website_id FK
    TEXT key UNIQUE
    TEXT[] scopes
    TEXT[] allowed_origins
    BOOLEAN is_public
  }

  SESSIONS {
    UUID id PK
    UUID website_id FK
    TEXT session_id_signed UNIQUE
    TEXT origin
    TIMESTAMPTZ expires_at
  }

  CHAT_SUMMARIES {
    UUID id PK
    UUID website_id FK
    TEXT chat_id UNIQUE
    TEXT summary
    TIMESTAMPTZ last_message_at
  }

  WEBSITES ||--o{ API_KEYS : has
  WEBSITES ||--o{ SESSIONS : has
  WEBSITES ||--o{ CHAT_SUMMARIES : has
```

- **`WEBSITES`**: Lưu thông tin định danh của từng khách hàng SaaS (tenant).
- **`API_KEYS`**: Lưu trữ các API Key (Public Widget và Admin) được cấp cho các website.
- **`SESSIONS`**: Lưu trữ thông tin về các phiên chat được tạo từ widget, liên kết với API Key và website để chống giả mạo.
- **`CHAT_SUMMARIES`**: Lưu trữ tóm tắt của mỗi phiên chat, liên kết trực tiếp với một `website`.

## 4. Endpoint API

### 4.1. Initiate Session Endpoint

- **Endpoint:** `POST /session/initiate`
- **Mô tả:** Endpoint này được `widget.js` gọi đầu tiên để lấy một Secure Session Token. Nó yêu cầu một Public Widget API Key hợp lệ trong header `x-api-key` và `Origin` hợp lệ.
- **Xác thực:** Yêu cầu `x-api-key` (Public Widget API Key) và kiểm tra `Origin` header. API Key phải có `is_public = TRUE` và bao gồm scope `session:initiate`.

- **Request Body (JSON):** (Không có body)

- **Response Body (JSON):**

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "expiresIn": "1h"
  }
  ```

  - `token`: Secure Session Token (JWT) đã được ký. Widget sẽ sử dụng token này trong header `Authorization: Bearer <token>` cho các yêu cầu tiếp theo.
  - `sessionId`: Session ID (UUID) gốc. Widget sẽ sử dụng session ID này trong header `x-session-id` và trong body của các yêu cầu tiếp theo.
  - `expiresIn`: Thời gian hết hạn của session token.

- **Ví dụ cURL:**

  ```bash
  curl -X POST http://localhost:3000/session/initiate
    -H "Content-Type: application/json"
    -H "x-api-key: YOUR_PUBLIC_WIDGET_API_KEY"
    -H "Origin: https://your-customer-website.com"
  ```

### 4.2. Chat Endpoint

- **Endpoint:** `POST /chat`
- **Mô tả:** Bắt đầu một phiên chat mới hoặc tiếp tục một phiên chat hiện có. Endpoint này xử lý toàn bộ luồng RAG và quản lý bộ nhớ hội thoại.
- **Xác thực:** Yêu cầu `Authorization: Bearer <Secure Session Token>` và `x-session-id` trong header. Token sẽ được xác minh và liên kết với `Origin` của yêu cầu.

- **Request Body (JSON):**

  ```json
  {
    "messages": [
      { "role": "user", "content": "Xin chào!" },
      { "role": "assistant", "content": "Chào bạn! Tôi có thể giúp gì?" },
      { "role": "user", "content": "Bạn là ai?" }
    ],
    "sessionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
  ```

  - `messages`: Mảng các đối tượng tin nhắn theo định dạng `ChatMessage` (bao gồm `role` và `content`).
  - `sessionId`: Session ID (UUID) gốc, được trả về từ endpoint `/session/initiate`.

- **Response Body (JSON):**

  ```json
  {
    "response": "Tôi là một trợ lý AI được thiết kế để giúp bạn.",
    "context": ["Đoạn ngữ cảnh 1 được truy xuất...", "Đoạn ngữ cảnh 2 được truy xuất..."]
  }
  ```

  - `response`: Câu trả lời được tạo bởi AI.
  - `context`: (Tùy chọn) Mảng các đoạn văn bản ngữ cảnh được truy xuất từ Vector Store, đã được sử dụng để tạo ra câu trả lời.

- **Ví dụ cURL:**

  ```bash
  curl -X POST http://localhost:3000/chat
    -H "Content-Type: application/json"
    -H "Authorization: Bearer YOUR_SECURE_SESSION_TOKEN"
    -H "x-session-id: YOUR_SESSION_ID_FROM_INITIATE_RESPONSE"
    -H "Origin: https://your-customer-website.com"
    -d '{
      "messages": [
        { "role": "user", "content": "Kiến trúc của hệ thống này là gì?" }
      ],
      "sessionId": "YOUR_SESSION_ID_FROM_INITIATE_RESPONSE"
    }'
  ```

## 5. Xác thực API Key và Session Token

- **Public Widget API Key (`x-api-key` header):** Chỉ được sử dụng cho endpoint `/session/initiate`. Key này phải có `is_public = TRUE` và scope `session:initiate`.
- **Secure Session Token (`Authorization: Bearer` header):** Được sử dụng cho tất cả các endpoint khác (ví dụ: `/chat`). Token này chứa `sessionId`, `ownerId`, `origin` và `scopes`. Backend sẽ xác minh chữ ký của token, kiểm tra thời gian hết hạn, và đảm bảo `ownerId` và `origin` khớp với thông tin đã lưu trữ cho session.
- **`x-session-id` Header:** Chứa Session ID (UUID) gốc được trả về từ `/session/initiate`. Được sử dụng cùng với Secure Session Token để tra cứu session record trong database.
- **`Origin` Header:** Luôn được kiểm tra để đảm bảo yêu cầu đến từ một domain được phép, cả khi sử dụng Public Widget API Key và Secure Session Token.

Nếu xác thực thất bại (key/token không hợp lệ, domain không được phép, thiếu header, hoặc scope không đủ), API sẽ trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`.
