# Task 5.3 — kế hoạch triển khai bằng CI (đề xuất, chưa thực hiện)

Cập nhật 15/11/2026 (B), để E và B cùng chốt. Hiện workflow [ci.yml](../../.github/workflows/ci.yml) có hai job: `verify` và `publish-ghcr`.
Chưa có bước deploy, migration, smoke hoặc rollback. Triển khai Railway thủ công là tiến triển của production, **chưa phải CD theo đề**.
Tài liệu này chốt điều kiện chấp nhận; không phải bằng chứng đã triển khai.

## Điều kiện chấp nhận (theo bản rà của A, mục 4.3)

| # | Điều kiện | Bằng chứng cần lưu |
|---|---|---|
| 1 | Deploy chạy từ CI, dùng secret trong GitHub (không secret trong repo hoặc log) | Run Actions, tên secret/environment (không giá trị) |
| 2 | Chỉ deploy source đã qua `verify` và đã publish; định danh bằng digest | SHA, digest Web/API trong log |
| 3 | Migration chạy trước khi bản mới nhận lưu lượng, đúng trình tự | Log lệnh migrate deploy và kết quả |
| 4 | Sau rollout có kiểm tra trạng thái và smoke; **lỗi làm pipeline thất bại** | Run xanh; run đỏ hoặc kiểm chứng có kiểm soát |
| 5 | Hướng dẫn rollback theo digest và điều kiện tương thích schema | Tài liệu + (nếu có) run rollback |
| 6 | Lưu run, source, digest, deployment ID và kết quả smoke | Mục trong [HANDOVER](HANDOVER.md) và [RELEASE_NOTES](RELEASE_NOTES.md) |

Được phép: bước phê duyệt hoặc kích hoạt thủ công (`workflow_dispatch`, môi trường có reviewer). Không bắt buộc mọi push tự deploy.
Không bắt buộc: tự động rollback database, cổng thanh toán tiền thật.

## Việc E cần xác nhận trước khi viết job (B không tự biết)

1. Railway nhận image từ GHCR thế nào: service dạng image, token pull, hay deploy từ repo. Loại token dùng trong CI và quyền tối thiểu.
2. Cách cập nhật service lên đúng digest (CLI, API hoặc cấu hình service) và cách lấy deployment ID/trạng thái.
3. Chạy migration ở đâu: pre-deploy command của API, hoặc one-off. Lệnh dự kiến: `npm exec --workspace apps/api -- prisma migrate deploy`.
4. Cách smoke khi API/DB private: qua Web (`/api/products`, trang gốc) và qua đường nào để thấy health API.
5. Tên service, environment và biến runtime: `CHECKOUT_V2_ENABLED=1` cho Web, origin/cookie/upstream đúng domain, và `PORT` của Web (Web chạy `--port 3000` cố định, xem [COMPOSE.md](COMPOSE.md)).
6. Cách cấp tồn kho cho database đã có đơn: `seed-demo` và `INIT_DEMO_STOCK` chỉ dành cho local/Compose và có guard; không bỏ guard hoặc xóa đơn cũ.

## Phác thảo job (cần E kiểm chứng)

Bản nháp workflow nằm ngoài repo, đánh dấu CHƯA KIỂM CHỨNG, chỉ để E sửa theo thực tế Railway. Cấu trúc đề xuất:

1. `deploy` cần `publish-ghcr`; chạy trên main, kích hoạt bằng `workflow_dispatch` và environment `production`.
2. Nhận digest Web/API từ job publish (output), không dùng `latest`.
3. Cập nhật service API, chạy migration, chờ trạng thái SUCCESS.
4. Cập nhật service Web, chờ trạng thái SUCCESS.
5. Smoke có thử lại và thời hạn: `GET /` trả 200, `GET /api/products` trả 200 và có 4 sản phẩm; bất kỳ lỗi nào làm `exit 1`.
6. Ghi digest, deployment ID, kết quả smoke vào `$GITHUB_STEP_SUMMARY`.

## Rollback (nguyên tắc)

- Quay lại digest của lần deploy thành công trước (lưu trong step summary).
- Migration chỉ thêm (additive) mới an toàn để chạy lại bản cũ; migration phá vỡ tương thích phải ghi rõ và không rollback tự động.
- Không đảo migration hoặc restore đè dữ liệu production nếu chưa có quyết định riêng và bản sao lưu.
