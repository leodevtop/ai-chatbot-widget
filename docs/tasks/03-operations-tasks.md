# 03. Công việc vận hành (Operations Tasks)

## Overview

Tài liệu này liệt kê các công việc liên quan đến vận hành dự án Frontend Widget.js, bao gồm thiết lập CI/CD, giám sát, quản lý API Key và hỗ trợ khách hàng, nhằm đảm bảo widget hoạt động ổn định, hiệu quả và an toàn trong môi trường production.

## Checklist

### Thiết lập CI/CD

- [ ] Cấu hình pipeline CI/CD để tự động build và triển khai widget lên CDN khi có commit vào branch `main`.
- [ ] Thiết lập kiểm tra tự động (lint, test) trong CI/CD.

### Thiết lập giám sát

- [ ] Tích hợp Sentry/Bugsnag để theo dõi lỗi JavaScript client-side.
- [ ] Thiết lập giám sát hiệu suất CDN và API backend.

### Quản lý API Key

- [ ] Triển khai cơ chế xoay vòng (rotation) cho Public Widget API Key.
- [ ] Thiết lập cảnh báo khi có lưu lượng API bất thường.

### Hỗ trợ khách hàng

- [ ] Chuẩn bị tài liệu hỗ trợ khách hàng về cách nhúng và khắc phục sự cố cơ bản của widget.
