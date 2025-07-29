# Tech Stacks

## Ưu tiên

| Ưu tiên thực hiện          | Việc cụ thể                           |
| -------------------------- | ------------------------------------- |
| 1. Xử lý hiển thị markdown | `marked` + `dompurify`                |
| 2. Giao diện chat cơ bản   | `lit` component với state nội bộ      |
| 3. Quản lý session         | `nanoid`, `localStorage`, `expiresAt` |
| 4. Gửi & nhận chat         | Gọi API, render nội dung              |
| 5. Tối ưu bundle size      | Dùng vite build `iife`                |

## Toàn bộ teck stack

> Đề xuất nếu cần dùng tới

| Ưu tiên | Mục tiêu sử dụng                 | Thư viện           | Phiên bản | Ghi chú sử dụng khi nào                       |
| ------- | -------------------------------- | ------------------ | --------- | --------------------------------------------- |
| 1       | Build project + HMR              | `vite`             | ^5.4.19   | Đã dùng, giữ nguyên                           |
| 2       | UI component                     | `lit`              | ^3.3.1    | Đã dùng, phù hợp Web Component                |
| 6       | Gộp class CSS linh hoạt          | `clsx`             | ^2.1.1    | Nên thêm, giúp code sạch                      |
| 7       | Kiểm tra dữ liệu API (type-safe) | `zod`              | ^3.23.0   | Tùy chọn, khi bạn muốn validate schema rõ hơn |
| 8       | Format thời gian đơn giản        | `dayjs`            | ^1.11.10  | Chỉ thêm nếu bạn hiển thị timestamp           |
| 9       | Event bus giữa component         | `mitt`             | ^3.0.1    | Dùng nếu bạn có nhiều phần chat độc lập       |
| 10      | Tooltip, popup định vị động      | `@floating-ui/dom` | ^1.5.0    | Chưa cần nếu giao diện đơn giản               |
