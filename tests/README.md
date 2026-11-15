# Kiểm thử BrewLite A2

Thư mục này là đầu mối integration/E2E và smoke cho cấu trúc repository của đề. Unit test giữ cạnh code. Runner gọi lại bộ kiểm thử hiện có, không sao chép hoặc chuyển file làm đổi import/fingerprint của bằng chứng cũ.

## Các lệnh từ gốc repository

| Lệnh | Phạm vi | Điều kiện |
|---|---|---|
| `npm test` | Unit web/API | Dependency và Prisma Client |
| `npm run test:delivery` | Guard deploy, smoke, khởi tạo kho với fixture giả | Không database/token/network |
| `npm run test:integration` | Workflow PostgreSQL hiện có | Database test local và migration |
| `npm run test:legacy` | Migration/đơn legacy | Database test local |
| `npm run test:http` | Nest + Next production local, HTTP/BFF/CLI | Database test, build và JWT secret của phiên test |
| `npm run test:e2e` | Bộ HTTP trên và browser menu → checkout/recovery | Như trên, thêm Chromium Playwright |
| `npm run test:stock-guard` | SQL guard/rollback/concurrency của khởi tạo kho Railway | Database test local; schema fixture UUID được dọn |
| `npm run smoke -- --url https://your-web-origin` | GET trang chủ, health, catalog, chi tiết và PWA | Bản đã deploy, checkout v2 bật |

`test:delivery` kiểm logic bằng fixture, không được gọi là Railway deployment PASS. `test:stock-guard` chạy SQL trên schema cô lập trong database test; không kết nối Railway hoặc thay đổi kho ứng dụng.

## Chuẩn bị PostgreSQL và E2E

Chỉ nhận database `brewlite_a2_test` trên loopback và `A2_INTEGRATION_TEST=1`. Không dùng URL database ứng dụng hoặc production. Đọc [hướng dẫn checkout](../docs/assignment2/CHECKOUT_INTEGRATION.md) để chuẩn bị URL và secret bằng biến môi trường, không đưa giá trị thật vào log.

Từ gốc repo, sau khi cấu hình phiên PowerShell:

```powershell
npm run db:deploy --workspace apps/api
npm run build
npm run test:integration
npm run test:legacy
npm run test:stock-guard
npm run test:http
# Khi máy có Chromium Playwright:
npm run test:e2e
```

HTTP runner dùng cổng test 3300/3302, tự tạo/dọn fixture; không thao tác UI đồng thời. `test:e2e` đặt `A2_BROWSER_TEST=1`; `test:http` đặt 0. Guard gốc vẫn hoạt động. Dừng bằng Ctrl+C thì wrapper chuyển tín hiệu tới runner. Không tự migrate/seed/reset database trong wrapper.

## Smoke sau deploy

```powershell
npm run smoke -- --url https://brewlite-production.up.railway.app --report delivery-artifacts/smoke.json
```

Smoke yêu cầu `/api/health` và cờ v2 của bản mới. Nó sẽ fail trên bản nền cũ chưa có endpoint này; không sửa kết quả thành PASS. `--allow-legacy` chỉ nới kiểm cờ, vẫn yêu cầu health endpoint mới. Để kiểm local:

```powershell
npm run smoke -- --url http://localhost:3100 --allow-local --report delivery-artifacts/smoke-local.json
```

Chỉ GET, không cookie/token, không tạo đơn/payment/seed. Smoke fail trả exit code khác 0. `/api/health` kiểm Web → API tiến trình; catalog BFF kiểm đọc database. Smoke không thay kiểm chứng thanh toán, rollback dữ liệu, race hoặc PWA browser thật.

## Nguồn code và bằng chứng

- PostgreSQL: `apps/api/src/orders/workflow-postgres.integration.ts`.
- HTTP/BFF: `apps/api/prisma/check-workflow-http.ts`.
- Browser: `apps/web/scripts/check-workflow-browser.mjs`.
- Legacy: `apps/api/prisma/check-legacy-preservation.mjs`.
- [Bằng chứng chuẩn bị](../docs/assignment2/testing/checkout-preparation-2026-11-13/README.md).
- [Bằng chứng Windows/Compose](../docs/assignment2/testing/checkout-windows-2026-11-13/README.md).
- [Ma trận truy vết](../docs/traceability-matrix.md): chỉ ghi đạt theo assertion và phiên bản đã kiểm.

Các lệnh mới không tự tạo bằng chứng cho lượt cũ. Artifact mới ở `delivery-artifacts/` hoặc `tests/artifacts/` được ignore; chỉ đưa log đã rà secret vào hồ sơ QA.
