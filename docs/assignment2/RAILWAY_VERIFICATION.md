# Kiểm chứng triển khai Railway A2

Ngày kiểm chứng: 14/11/2026.
Người thực hiện: E.

## Phiên bản triển khai

- Repository: giabaot400-boop/BrewLite-Assignment2.
- Source SHA của image: 0bea2e2015c54cf23cb1d3b9f32bc146d2891136.
- CI #32: verify và publish-ghcr PASS.
- CI: https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43546562005
- Hai package GHCR có visibility public.
- Railway dùng image theo digest; nguồn GitHub của Web/API đã được ngắt.

API:
`ghcr.io/giabaot400-boop/brewlite-a2-api@sha256:bfb55dd146abde9a32bb91e3a66183b31aefc52a9b44a6d5e547f185e2a9b59a`

Web:
`ghcr.io/giabaot400-boop/brewlite-a2-web@sha256:a48c8ba4812a590215472273673a6937abb07042425bdcdf1684b0f50268e9a3`

## Hạ tầng đã chạy

- Project Railway: BrewLite-Assignment2, environment production.
- Web: service BrewLite, cổng 3000, healthcheck `/`.
- URL HTTPS: https://brewlite-production.up.railway.app
- API: service BrewLite-Assignment2, cổng 3001, healthcheck `/health`.
- API dùng hostname private, chưa tạo public domain/TCP proxy.
- Database: service postgres, image postgres:17-bookworm.
- Log xác nhận PostgreSQL 17.12 khởi động và sẵn sàng kết nối.
- Database brewlite_a2, kết nối private cổng 5432.
- Volume riêng gắn tại /var/lib/postgresql/data.
- PGDATA=/var/lib/postgresql/data/pgdata.
- Service Postgres 18 ban đầu vẫn còn; chưa dọn tài nguyên thừa.
- Không ghi mật khẩu, JWT secret hoặc DATABASE_URL có secret vào báo cáo.

## Migration và seed

API pre-deploy chạy:

`npm exec --workspace apps/api -- prisma migrate deploy`

Kết quả: áp dụng thành công 2 migration:
- 20261024160346_init_products
- 20261030152601_sprint2_auth_orders

Seed chạy thủ công trong container API:

`npm run db:seed --workspace apps/api`

Kết quả: 4 sản phẩm và 2 topping mẫu.
Seed không được thêm vào pre-deploy.

## Kiểm chứng thực tế

- Web và API đạt trạng thái Active/Online.
- HTTPS GET /api/products trả 200 và đủ 4 sản phẩm sau seed.
- Trang chi tiết Cà phê sữa tải được.
- Size L + Kem + Trân châu: tổng 57.000đ.
- Thêm vào giỏ thành công.
- Đăng nhập qua giao diện production thành công.
- Xác nhận đặt hàng thành công; giỏ hàng được xóa.
- Đơn: 7c13e6f8-0b0e-4df3-bba3-a05c7b187001.
- Giao diện hiển thị PENDING, tổng chính thức 57.000đ.

Đối chiếu trực tiếp PostgreSQL:

| Trường | Kết quả |
| --- | --- |
| status | PENDING |
| total | 57000 |
| order_requests.state | SUCCEEDED |
| request_hash của ledger khớp Order | true |

Đây là kiểm thử thủ công luồng tạo đơn trên production,
không phải kết quả chạy bộ E2E tự động.

## Kiểm tra sau redeploy API

- Deployment API 473519f1 đạt Active.
- Pre-deploy báo: No pending migrations to apply.
- HTTPS /api/products vẫn trả 200 và đủ 4 sản phẩm.
- Đơn 7c13e6f8-0b0e-4df3-bba3-a05c7b187001 vẫn PENDING,
  total 57000, ledger SUCCEEDED và hash khớp.
- Không chạy seed lại.
- Kết quả chỉ xác nhận dữ liệu còn nguyên sau redeploy API;
  chưa kiểm chứng restart/redeploy PostgreSQL hoặc backup/restore.
  
## Chưa kiểm chứng

- Thanh toán, hoàn tiền, loyalty, cancel và expiry.
- Rollback ứng dụng và phục hồi database từ backup.
- Khả năng giữ dữ liệu sau restart/redeploy PostgreSQL trên Railway.
- Tự động triển khai Railway sau CI; lần này cấu hình triển khai thủ công.
- Chi phí vận hành thực tế và cảnh báo ngân sách.

Chưa kết luận toàn bộ checkout hoặc Assignment 2 đã hoàn thành.