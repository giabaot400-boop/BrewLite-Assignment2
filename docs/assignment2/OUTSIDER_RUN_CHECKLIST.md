# Người ngoài nhóm chạy thử — phiếu ghi nhận

Phiếu trống, chưa có người thử hoặc kết quả được điền. Một người có thể làm hai lượt bên dưới; không giao cả 59 AC cho người dùng thử. Review PR/code, bằng chứng test kỹ thuật và chữ ký lead là các hoạt động riêng.

## Metadata

| Mục | Người thử điền |
|---|---|
| Người thử (không thuộc nhóm), ngày/giờ | |
| OS, browser/version; Node/Docker nếu local | |
| Repo branch và git rev-parse HEAD (local) | |
| Local: Docker Compose hay native; project/env filename, không ghi secret | |
| Online: URL và buildSha từ /api/health | |

## Lượt A — clone và chạy theo README

Chọn [Docker Compose](COMPOSE.md) hoặc local native trong [README](../../README.md); chỉ cần một đường local. Với Docker không chạy npm ci/setup native. Ghi từng lệnh lỗi và chỗ phải hỏi nhóm; không biến thiếu hướng dẫn thành PASS. Nếu nhóm hỗ trợ sửa, giữ lỗi ban đầu và ghi lượt thử lại. Không gửi .env, URL có mật khẩu, cookie/token vào phiếu.

| Ca | Kết quả mong đợi | Thực tế / đạt-chưa đạt / ảnh hoặc mã đơn |
|---|---|---|
| A1 Clone, chuẩn bị và mở app | Làm theo tài liệu được; ghi SHA, service healthy; catalog có 4 món | |
| A2 Chi tiết/tùy chọn | Cà phê sữa L + Kem + Trân châu, không promo, 57.000đ | |
| A3 Giỏ | Thêm món, tăng/giảm/xóa; tổng thay đổi đúng cấu hình | |
| A4 Auth/validation | Form trống có lỗi rõ; tài khoản thử đăng ký/đăng nhập được | |
| A5 Tạo đơn | Mở hộp, xác nhận cuối tạo PENDING; món/tổng đúng, giữ giỏ trước PAID | |
| A6 Thanh toán | Ví mock qua xác nhận cuối thành PAID, giỏ khớp được dọn | |
| A7 Hủy | Tạo đơn khác, hủy khi còn PENDING thành CANCELLED | |
| A8 Đọc lại | F5/mở lịch sử/chi tiết giữ đúng mã và trạng thái; không tự tạo giao dịch mới theo quan sát | |

Các ca quan sát không chứng minh SQL side effect đúng một lần, race kho, idempotency/replay, refund/loyalty hoặc toàn bộ accessibility. Unit/integration/E2E chuyên sâu dùng report kỹ thuật riêng, không bắt người thử UI chạy toàn bộ suite.

## Lượt B — truy cập production

Mở https://brewlite-production.up.railway.app; ghi buildSha và browser. Không dùng seed/reset/CLI hoặc cấu hình Railway. Dùng tài khoản thử riêng; ghi mã đơn khi tạo giao dịch. Thanh toán mô phỏng, không nhập dữ liệu thẻ thật.

| Ca | Kết quả mong đợi | Thực tế / ảnh/mã đơn |
|---|---|---|
| B1 URL/health/catalog | HTTPS vào được; /api/health status/api ok và checkoutV2Enabled=true; menu hiển thị | |
| B2 Luồng người dùng | Xem món, thêm giỏ, đăng nhập, tạo/xác nhận và thanh toán mock; PAID và giỏ đúng | |
| B3 Hủy/đọc lại | Đơn mới khác còn chờ được hủy; history/F5 đúng trạng thái | |

Lượt B chỉ thử các thao tác người dùng trong bảng. Nếu hết hàng thì ghi tình trạng, không cấp kho lại để làm đẹp phiếu. Mã giảm giá production chưa được seed/kiểm trong lượt CD, nên không yêu cầu DEMO10 phải thành công ở lượt B.

## Kết luận

| Mục | Điền theo thực tế |
|---|---|
| Local chạy được theo hướng dẫn? Vướng ở đâu? | |
| Online dùng được các ca nào? | |
| Lỗi/chỗ tài liệu cần sửa, PR liên quan | |
| Người ghi, ngày và các ảnh/log đã bỏ secret | |

Lưu bản đã điền thành file mới dưới docs/assignment2/testing/ rồi dẫn vào [HANDOVER](HANDOVER.md). Không ghi phiếu trống thành lượt đã chạy hoặc ký PASS thay lead AC.
