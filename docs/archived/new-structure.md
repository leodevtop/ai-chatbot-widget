## ✅ Cấu trúc component: `ChatWidget`

```
<ChatWidget>
├── <ChatLauncherButton>      // icon tròn ở góc
├── <TeaserMessage>           // auto hiện sau delay
└── <ChatBox>                 // cửa sổ chat khi mở
     ├── <ChatHeader>         // tiêu đề + nút đóng
     ├── <ChatBody>           // danh sách tin nhắn
     ├── <QuickReplies>       // gợi ý nút hỏi nhanh
     └── <InputBox>           // input gửi tin nhắn
```

---

## 🧩 File và logic

### 📁 src/components/chat-widget/

```
chat-widget.ts            // ChatWidget tổng thể
chat-widget.view.ts       // render()
chat-widget.styles.ts     // styles tổng thể
chat-launcher.ts          // Nút launcher
teaser-message.ts         // Teaser chào
chat-box.ts               // Khung chat
├── chat-header.ts        // Tiêu đề, nút đóng
├── chat-body.ts          // Danh sách tin nhắn
├── quick-replies.ts      // Gợi ý
├── input-box.ts          // Nhập liệu
├── chat-error-banner.ts  // Lỗi + retry (nếu có)
```

> Bạn có thể export tất cả từ `index.ts`

---

## 🔁 State điều khiển (gợi ý `@state()` trong `ChatWidget`)

```ts
@state() private expanded = false;
@state() private teaserVisible = false;
@state() private errorState: null | 'init' | 'reply' = null;
@state() private messages: ChatMessage[] = [];
@state() private quickReplies: string[] = ['Giá?', 'Tính năng?', 'Tư vấn AI'];
@state() private userInput = '';
```

---

## 🔁 Event flow (giữa các component con)

| Component con          | Event emit                          | Component cha xử lý                               |
| ---------------------- | ----------------------------------- | ------------------------------------------------- |
| `<ChatLauncherButton>` | `@open-chat`                        | `ChatWidget` mở chatbox                           |
| `<InputBox>`           | `@submit` kèm `detail.message`      | Gửi API + add vào `messages`                      |
| `<QuickReplies>`       | `@quick-reply` kèm `detail.message` | Giả lập gửi message                               |
| `<ChatHeader>`         | `@minimize`                         | Thu gọn chatbox                                   |
| `<ChatErrorBanner>`    | `@retry`                            | Gọi lại `initSession()` hoặc `resendLastPrompt()` |

> Các event cần `bubbles: true, composed: true` để hoạt động xuyên shadow DOM

---

## 🧠 Tối ưu UX

| Yếu tố                  | Cách làm                                                                         |
| ----------------------- | -------------------------------------------------------------------------------- |
| ⏱ `teaserVisible` delay | Dùng `setTimeout(() => this.teaserVisible = true, 3000)`                         |
| ✅ Retry khi lỗi         | Khi `errorState = 'init'` hoặc `'reply'` thì render `ChatErrorBanner`            |
| 🧹 Gọn state            | Dùng getter `isReady`, `isError`, `canSubmit`... để tránh logic rối trong render |

---

## 🧪 Đề xuất render()

Dùng `chat-widget.view.ts`:

```ts
export function renderView(ctx: ChatWidget) {
  return html`
    ${!ctx.expanded ? html`
      <chat-launcher-button @open-chat=${ctx.open}></chat-launcher-button>
      ${ctx.teaserVisible ? html`<teaser-message />` : null}
    ` : html`
      <chat-box>
        <chat-header @minimize=${ctx.close}></chat-header>
        <chat-body .messages=${ctx.messages}></chat-body>
        ${ctx.errorState ? html`
          <chat-error-banner
            .type=${ctx.errorState}
            @retry=${ctx.retry}
          ></chat-error-banner>
        ` : null}
        <quick-replies
          .items=${ctx.quickReplies}
          @quick-reply=${ctx.handleQuickReply}
        ></quick-replies>
        <input-box
          .value=${ctx.userInput}
          @submit=${ctx.handleSubmit}
        ></input-box>
      </chat-box>
    `}
  `;
}
```
