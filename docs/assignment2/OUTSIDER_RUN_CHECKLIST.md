# Người ngoài nhóm chạy theo hướng dẫn — phiếu ghi nhận

Mục đích: kiểm chứng README hướng dẫn đủ để một người **không thuộc nhóm** clone và chạy được A2. Người chạy chỉ làm theo tài liệu, không
nhờ thành viên nhóm ngồi cạnh chỉnh giúp. Mọi bước phải thất bại hoặc thành công thật; ghi đúng như quan sát, không sửa phiếu cho đẹp.

Phiếu này là mẫu trống. **Chưa có lượt chạy nào được ghi.**

## Thông tin lượt chạy

| Mục | Điền |
|---|---|
| Người chạy (không thuộc nhóm) |  |
| Ngày, giờ bắt đầu/kết thúc |  |
| Hệ điều hành, Node (`node --version`), Docker (nếu dùng) |  |
| Commit đã clone (`git rev-parse HEAD`) |  |
| Hướng dẫn dùng | README gốc hoặc [COMPOSE.md](COMPOSE.md) (chọn một) |

## Các bước và kết quả

Ghi PASS/FAIL, thời gian và nguyên văn lỗi nếu có. Bước nào phải hỏi nhóm để làm tiếp thì ghi FAIL và nêu thiếu gì trong tài liệu.

| # | Bước | Kết quả | Ghi chú/lỗi |
|---|---|---|---|
| 1 | Clone repo A2 vào thư mục riêng |  |  |
| 2 | `npm ci` |  |  |
| 3 | `npm run setup`, điền `DATABASE_URL` cho database A2 |  |  |
| 4 | Migration và seed theo README |  |  |
| 5 | Khởi động web và API; mở menu, thấy 4 sản phẩm |  |  |
| 6 | Mở chi tiết cà phê sữa; chọn size L, Kem, Trân châu; tổng 57.000 |  |  |
| 7 | Đăng ký, đăng nhập |  |  |
| 8 | Bật `CHECKOUT_V2_ENABLED=1` theo README rồi khởi động lại web; tạo đơn PENDING |  |  |
| 9 | Thanh toán bằng Ví mô phỏng, đơn thành PAID |  |  |
| 10 | Hủy một đơn khác, xem lịch sử đơn |  |  |
| 11 | Chạy `npm test` (web và api) |  |  |

Nếu chạy bằng Docker Compose, thay bước 3–5 bằng các lệnh trong [COMPOSE.md](COMPOSE.md) và ghi riêng.

## Kết luận lượt chạy

| Mục | Điền |
|---|---|
| Làm được hết các bước không cần hỗ trợ? | Có / Không |
| Chỗ tài liệu thiếu hoặc mơ hồ |  |
| Việc phải sửa tài liệu (PR/issue) |  |
| Ghi nhận bởi, ngày |  |

Điền xong, lưu phiếu thành file mới trong `docs/assignment2/testing/` kèm tên lượt chạy và ngày, rồi dẫn link vào [HANDOVER](HANDOVER.md).
