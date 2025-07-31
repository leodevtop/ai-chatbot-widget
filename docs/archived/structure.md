# **cấu trúc UI-driven + state-driven**

1. **Component**
2. **UI State / Transition**
3. **Event flow**
4. **Interaction pattern**
5. **Timing**

---

### 🔷 1. Tổng quan hành vi

> Một **chat widget nổi góc màn hình**, khi chưa mở sẽ là **nút tròn có icon**. Sau vài giây, nó **auto gửi 1 message chào hỏi nhỏ** bên trên nút. Khi người dùng **bấm vào nút**, chatbox mở ra, hiển thị lời chào chính và các nút câu hỏi nhanh (quick reply). Có thể đóng lại bằng nút thu gọn.

---

### 🔷 2. Cấu trúc component

```txt
<ChatWidget>
├── <ChatLauncherButton>      // icon tròn ở góc
├── <TeaserMessage>           // message chào tự hiện sau delay
└── <ChatBox>                 // cửa sổ chat khi mở
     ├── <ChatHeader>         // chứa nút thu gọn
     ├── <ChatBody>           // danh sách tin nhắn
     ├── <QuickReplies>       // các nút gợi ý câu hỏi
     └── <InputBox>           // ô nhập tin nhắn
```

---

### 🔷 3. UI State & Transition

| State                   | Mô tả                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `collapsed` *(default)* | Hiện icon launcher. Sau delay, hiện `TeaserMessage`              |
| `expanded`              | Mở full chat box với header, body, quick reply                   |
| `teaserDismissed`       | Không hiện `TeaserMessage` nữa nếu user mở chat hoặc sau timeout |

---

### 🔷 4. Behavior flow

#### Khi load widget:

1. Hiện `ChatLauncherButton` ngay.
2. Sau \~3s (delay), nếu user chưa mở chat:

   * Hiện `TeaserMessage`: “Xin chào! Tôi có thể giúp gì cho bạn?”
3. Nếu user bấm vào `ChatLauncherButton`:

   * Chuyển sang state `expanded`
   * Ẩn `TeaserMessage`
   * Hiện `ChatBox`, bắt đầu với:

     * Tin nhắn chào: "Xin chào, tôi có thể giúp gì?"
     * Một số nút câu hỏi gợi ý (QuickReplies): \["Giá dịch vụ?", "Cách sử dụng?", "Tư vấn AI"]

#### Khi thu gọn:

* User bấm nút close ở `ChatHeader`
* Trở lại trạng thái `collapsed`

---

### 🔷 5. Mô tả chi tiết theo logic

```json
{
  "defaultState": "collapsed",
  "teaserDelay": 3000,
  "states": {
    "collapsed": {
      "ui": ["ChatLauncherButton", "TeaserMessage (optional)"],
      "onClickLauncher": "expanded"
    },
    "expanded": {
      "ui": ["ChatHeader", "ChatBody", "QuickReplies", "InputBox"],
      "onClickMinimize": "collapsed"
    }
  },
  "messageFlow": {
    "onTeaserShown": "Hi! Tôi có thể giúp gì?",
    "onChatOpen": ["Xin chào, tôi có thể giúp gì?", "Hiển thị QuickReplies"]
  }
}
```
