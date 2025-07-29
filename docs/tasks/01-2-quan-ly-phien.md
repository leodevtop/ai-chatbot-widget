# 01.2. Quản lý phiên (Session Management)

## Overview

Quy trình này mô tả logic lưu trữ và khởi tạo lại session phía client (widget) nhằm:

- Khởi tạo session chỉ 1 lần (nếu chưa có hoặc hết hạn).
- Lưu session token (JWT), sessionId, expiresAt.
- Tái sử dụng session khi người dùng reload hoặc mở tab khác.
- Dọn session khi token hết hạn.

## Quy trình đầy đủ

1.  **Khởi tạo widget (on load):**

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

2.  **Hàm `getStoredSession()`:**

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

3.  **Hàm `requestNewSession()`:**

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

4.  **Hàm `useSession()`:**
    ```ts
    function useSession(session) {
      // gán vào global state, hoặc khởi động socket/chat
      chatbot.initWithToken(session.token);
    }
    ```

## Ghi chú bổ sung

- Không nên dùng `sessionStorage` nếu bạn muốn giữ session giữa các tab hoặc reload.
- Tất cả token đều có `expiresIn` (do JWT TTL hoặc backend định nghĩa).
- Có thể dọn `localStorage` bằng cron trong FE nếu muốn.

## Checklist

- [ ] Triển khai hàm `getStoredSession()` để đọc session từ `localStorage`.
- [ ] Triển khai hàm `isExpired()` để kiểm tra thời hạn của session.
- [ ] Triển khai hàm `requestNewSession()` để gọi API `/api/session/initiate` và lưu session mới vào `localStorage`.
- [ ] Triển khai hàm `useSession()` để khởi tạo chatbot với session token.
- [ ] Đảm bảo logic khởi tạo widget (on load) kiểm tra và sử dụng lại session hiện có hoặc yêu cầu session mới.
- [ ] Xác nhận rằng session được duy trì đúng cách giữa các lần tải trang và tab mới.
- [ ] Xác nhận rằng session được dọn dẹp hoặc làm mới khi token hết hạn.
