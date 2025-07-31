```txt
/src
├── components/                   # Tất cả UI component
│   ├── ChatWidget/               # Gốc: launcher + mount
│   │   ├── ChatWidget.ts
│   │   ├── ChatWidget.view.ts
│   │   ├── ChatWidget.styles.ts
│   │   └── index.ts
│   ├── ChatBox/                  # UI chat khi mở
│   │   ├── ChatBox.ts
│   │   ├── ChatBox.styles.ts
│   │   ├── ChatHeader.ts
│   │   ├── ChatBody.ts
│   │   ├── QuickReplies.ts
│   │   ├── InputBox.ts
│   │   ├── ChatErrorBanner.ts
│   │   └── index.ts
│   ├── TeaserMessage.ts
│   ├── ChatLauncher.ts
│   └── shared/                   # Icon, Bubble, Button,...
│       ├── Icon.ts
│       └── MessageBubble.ts
│
├── logic/                        # Không liên quan UI
│   ├── api/                      # Giao tiếp backend
│   │   ├── requestSession.ts
│   │   └── requestReply.ts
│   ├── hooks/                    # Logic tái sử dụng
│   │   ├── useAutoTeaser.ts
│   │   ├── useChatState.ts
│   │   └── useScrollToBottom.ts
│   ├── state/                    # State tạm thời / global
│   │   ├── uiState.ts            # enum UIState
│   │   └── chatStore.ts          # reactive state
│   └── utils/
│       ├── debounce.ts
│       └── uuid.ts
│
├── types/                        # Toàn bộ type chung
│   ├── chat.ts
│   └── session.ts
│
├── assets/                       # Ảnh, svg, font
│   └── icon.svg
│
├── styles/                       # Global CSS, theme, reset
│   ├── base.css
│   └── theme.css
│
├── index.ts                      # Export widget chính
├── mount.ts                      # Auto mount widget vào site
├── env.ts                        # Config: API_URL, SITE_ID
├── vite.config.ts
├── package.json
└── README.md
```