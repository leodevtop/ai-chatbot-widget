<!-- AI-HUMAN: Product Requirements Document for the Admin Panel project. -->

# **Client Session Flow for Chatbot Widget (Anonymous Session)**

**quy trình mô tả logic lưu trữ và khởi tạo lại session phía client (widget)** — bạn có thể dùng mô tả này để:

- Viết tài liệu nội bộ
- Tạo task cho AI agent (VD: LangChain, Cursor, Cline...)
- Giao cho dev triển khai

---

## 🎯 Mục tiêu

- Khởi tạo session chỉ 1 lần (nếu chưa có hoặc hết hạn)
- Lưu session token (JWT), sessionId, expiresAt
- Tái sử dụng session khi người dùng reload hoặc mở tab khác
- Dọn session khi token hết hạn

---

## ✅ Quy trình đầy đủ

> **Widget API Reference** : @docs/api/widget-api.md

### 1. **Khởi tạo widget (on load)**

```ts
initWidget() {
  const session = getStoredSession();

  if (session && !isExpired(session.expiresAt)) {
    useSession(session); // set state, continue chat
  } else {
    requestNewSession(); // gọi /session/initiate
  }
}
```

---

### 2. **Hàm `getStoredSession()`**

```ts
function getStoredSession() {
  const token = localStorage.getItem('chatbot-token');
  const expiresAt = localStorage.getItem('chatbot-expires-at');
  const sessionId = localStorage.getItem('chatbot-session-id');

  const isExpired = (t) => {
    return new Date(t).getTime() < Date.now();
  };

  if (!token || !expiresAt || !sessionId) return null;
  if (isExpired(expiresAt)) return null;

  return { token, sessionId, expiresAt };
}
```

---

### 3. **Hàm `requestNewSession()`**

```ts
async function requestNewSession() {
  const res = await fetch('/api/session/initiate', {
    method: 'POST',
    headers: { 'x-api-key': 'pk-xxx' },
    body: JSON.stringify({ origin: location.origin }),
  });

  const { token, sessionId, expiresIn } = await res.json();
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  localStorage.setItem('chatbot-token', token);
  localStorage.setItem('chatbot-session-id', sessionId);
  localStorage.setItem('chatbot-expires-at', expiresAt);

  useSession({ token, sessionId, expiresAt });
}
```

---

### 4. **Hàm `useSession()`**

```ts
function useSession(session) {
  // gán vào global state, hoặc khởi động socket/chat
  chatbot.initWithToken(session.token);
}
```

---

## 🧠 Ghi chú bổ sung

- **Không nên dùng `sessionStorage`** nếu bạn muốn **giữ session giữa các tab hoặc reload**.
- Tất cả token đều có `expiresIn` (do JWT TTL hoặc backend định nghĩa)
- Có thể dọn `localStorage` bằng cron trong FE nếu muốn

---

## 📄 JSON cấu trúc lưu trong localStorage (tham khảo)

```json
{
  "chatbot-token": "eyJhbGciOi...",
  "chatbot-session-id": "abc123",
  "chatbot-expires-at": "2025-07-29T10:30:00.000Z"
}
```

---

## 📦 Tóm tắt cho AI / Dev Agent

```yaml
- goal: Load chat widget and manage session across reloads and tabs
- context:
    - anonymous user
    - session = { token, sessionId, expiresAt }
    - backend endpoint: POST /api/session/initiate
- steps: 1. On load, try to get session from localStorage
    2. If session is missing or expired → call /session/initiate
    3. Save new session to localStorage
    4. Use session to initialize chat engine (or LLM service)
```
