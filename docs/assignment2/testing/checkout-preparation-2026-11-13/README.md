# Kiểm tra chuẩn bị checkout A2

Ngày 13/11/2026, môi trường trợ lý Linux. Source: A2 `3be4a11` cộng patch
nhận workflow A1 `3a70df6`; chưa có SHA commit A2 mới khi chạy. Không gán kết
quả này cho `3be4a11` nguyên bản, máy Windows, CI, Compose hoặc production.

- Unit web 970/970; api 190/190; setup 8/8.
- Lint/typecheck/build mã 0. Build đầu vướng symlink dependency; log giữ riêng.
- PostgreSQL 17.11: 28/28, cleanup fixture; HTTP/BFF/CLI production local 9/9.
- Legacy: SQL migration thật trên schema UUID riêng, original-column digest
  giữ nguyên, success/rejection replay và policy1 read-only đạt; schema đã dọn.
- Browser chưa được xác minh: launch Chromium bị môi trường chặn Unix socket.
  Lượt combined HTTP/browser exit 1 được giữ; HTTP riêng sau đó exit 0.
- Chưa kiểm Docker/Windows/HTTPS cho bản này. Dependency được tái dùng theo
  cùng phiên bản; cần npm ci và GitHub CI trên bản A2 được commit.

[result.json](result.json) có fingerprint toàn bộ source ứng dụng/test và
checksum log. Các file `.txt` là output thực của từng lệnh, không sửa số liệu.
Không cộng số test từ các suite thành số AC. Guard chỉ nhận database test A2
riêng; fixture không dùng dữ liệu A1 hoặc database ứng dụng của người dùng.
Đọc [phạm vi và lệnh chạy](../../CHECKOUT_INTEGRATION.md).
