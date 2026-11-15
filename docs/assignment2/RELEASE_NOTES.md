# BrewLite Assignment 2 — ghi chú phát hành (NHÁP)

Trạng thái: **nháp, chưa phát hành**. Trên GitHub chưa có release hoặc tag cho A2 tại thời điểm viết (15/11/2026, theo bản rà của A; chưa liệt kê đủ tag).
B/E chốt SHA cuối rồi tạo tag và release; cập nhật mục "Mốc phát hành" bằng giá trị thật. Không điền số liệu chưa kiểm chứng.

## Mốc phát hành

| Mục | Giá trị |
|---|---|
| Tag đề xuất | `a2-v1.0.0` (nhóm chốt tên) |
| Commit | main `4c177bf` tại thời điểm viết; cập nhật khi chốt |
| CI | [run 43549055750](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43549055750): `verify` và `publish-ghcr` thành công |
| Hướng dẫn chạy | [README](../../README.md), [COMPOSE.md](COMPOSE.md) |
| Hướng dẫn deploy/rollback | Chưa có bản cuối; xem [CD_DEPLOY_PLAN](CD_DEPLOY_PLAN.md) |

## Image đã publish lên GHCR

Digest dưới đây lấy từ log job `publish-ghcr` của run trên, theo bản rà của A. B chưa pull hoặc chạy các image này.

| Image | Tag | Digest |
|---|---|---|
| `ghcr.io/giabaot400-boop/brewlite-a2-api` | `sha-4c177bfb42ae5cfd709a8587e58f67d3922a6fad` | `sha256:deb2b1af714ddaeb2951242dc80823c42ba0e42b749d33b1c42a932e2ba97420` |
| `ghcr.io/giabaot400-boop/brewlite-a2-web` | `sha-4c177bfb42ae5cfd709a8587e58f67d3922a6fad` | `sha256:39d94c5bd7a9c0149f2ec4c77e367bb2de80324ef6009b41335f2cf6ba5d4094` |

Khi chốt release, đối chiếu lại digest với trang Actions của run tương ứng. Đây là digest registry, khác với image ID của các lượt QA local.

## Nội dung

- Menu, chi tiết sản phẩm, chọn size/topping, giỏ hàng, đăng ký/đăng nhập.
- Tạo đơn PENDING với giá và khuyến mãi (DEMO10) do backend tính; chống tạo trùng bằng khóa idempotency.
- Thanh toán mô phỏng (Ví/Thẻ), thất bại và thử lại, hủy/hoàn tiền mô phỏng, hết hạn thanh toán, kho theo Product, điểm thưởng.
- Giỏ v2 có khôi phục khi mất phản hồi; PWA cơ bản.
- Docker Compose cho Web, API, PostgreSQL; CI `verify` chặn merge; image Web/API được build và push khi `verify` xanh trên main.

Chi tiết nguồn và phạm vi kiểm tra: [CHECKOUT_INTEGRATION](CHECKOUT_INTEGRATION.md), [CHECKOUT_WINDOWS_QA](CHECKOUT_WINDOWS_QA.md), [ma trận 59 AC](../traceability-matrix.md).

## Giới hạn đã biết

- Thanh toán là mô phỏng, không có cổng tiền thật.
- Bằng chứng PostgreSQL, HTTP/BFF, Compose và browser là các lượt local riêng, ở mốc và image riêng; CI không chạy PostgreSQL hoặc browser.
- Ma trận 59 AC: 30 CÓ, 25 MỘT PHẦN, 2 THIẾU (benchmark NFR-01), 2 CHỜ TRIỂN KHAI. Đây là mức chứng cứ theo bản rà, chưa phải PASS đã ký từng lead.
- Production (Railway) được báo cáo chạy source `0bea2e2`, trước checkout Sprint 3; chưa nâng lên bản phát hành này.
- Chưa có deploy bằng secret của CI, smoke sau triển khai và hướng dẫn rollback bản cuối.
- `/health` chỉ kiểm tiến trình, không kiểm database.
- Lint chỉ phủ web; API có typecheck, test và build.
