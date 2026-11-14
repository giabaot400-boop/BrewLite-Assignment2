# Tích hợp checkout vào Assignment 2

## Nguồn và phạm vi

- Nền A2: `3be4a11847f479ac87d1c3321009433d3850afb9`, sau PR #6 và #7.
- Nguồn A1: `3a70df65ee5f65af49a1c3eaa080415cf30f6097`.
  Cây `apps` của mốc này trùng với `88b4e12`; các thay đổi sau đó là tài liệu.
- Đây là bản tích hợp trên nền A2 cùng patch, chưa có SHA commit A2 mới khi
  chạy kiểm tra chuẩn bị. Kết quả bên dưới không gán cho source nền chưa sửa.
- Giữ năm API nghiệp vụ, 17 FR, 12 NFR, 59 AC và 14 UC đã có. Không thêm
  cổng thanh toán thật, API báo giá hoặc API đổi trạng thái công khai.

Đưa sang backend tạo/đọc đơn, payment, hủy/hoàn mock, expiry, CLI demo,
pricing/điểm, reservation/CAS và migration Sprint 3. Frontend nhận checkout
v2, migration giỏ, owner/session guard, payment recovery và BFF tương ứng.
Các test nghiệp vụ được chuyển cùng code; script workflow được đổi guard
database và tên biến môi trường để chạy đúng A2.

Giữ Dockerfile, Product BFF, URL private và các test sản phẩm của PR #7;
giữ lệnh test tổng, CI, PWA, cookie `brewlite_a2_session`, database/volume
và cổng Web `3100` của A2. Compose bổ sung cờ checkout/mock/workflow.
Không mang toàn bộ hồ sơ QA/Review/Retro A1 sang thành evidence A2.

## Các điểm contract được dùng khi tích hợp

Các chi tiết runtime được ghi tại [contract A2](CONTRACTS.md). Hai reason
giá là `PRODUCT_PRICE_CHANGED` và `EXPECTED_TOTAL_MISMATCH`; lỗi thiếu kho
dùng `INSUFFICIENT_STOCK`. Recovery chỉ nhận marker
`NO_ATTEMPT_TERMINAL_ORDER` khi backend đã tìm theo đúng khóa và không có
attempt; không thay một phản hồi lỗi chung thành kết quả payment đã rõ.

Tạo PENDING giữ giỏ. Chỉ dọn phần giỏ khớp binding sau khi đọc trạng thái
thanh toán thành công hiện tại. Không auto-POST khi F5/đăng nhập lại.
Migration giữ canonical/ledger cũ và backfill policy 1 chỉ đọc. Đơn mới dùng
policy 2, giữ kho Product 15 phút; retry không gia hạn deadline.

## Liên kết code và kiểm tra trọng tâm

| Yêu cầu | Code | Kiểm tra được chuyển |
|---|---|---|
| FR-07/08 tạo đơn và chống lặp | `apps/api/src/orders/orders.controller.ts`, `orders.service.ts` | service/controller/HTTP mock; concurrent create PostgreSQL |
| FR-09/10 thanh toán và recovery | `order-workflow.service.ts`; BFF payment; `cart-payment-*-v2.ts` | FAILED/retry, replay cùng/khác key, mất phản hồi và owner guard |
| FR-11/12 xác nhận/lịch sử | `orders-reader.service.ts`; UI orders, BFF đọc đơn | đọc đúng chủ, trạng thái/phiên bản hiện tại, history |
| FR-13/14 trạng thái/kho | `order-workflow.ts`, `workflow-transaction.ts`, `database/stock.ts` | ma trận cạnh, tranh kho, race và rollback |
| FR-15/16 ưu đãi/điểm | `price-order.ts`, `loyalty.ts`, workflow | snapshot giá, DEMO10, cộng/thu hồi điểm đúng một lần |
| FR-17 hủy/hết hạn | `order-actions.controller.ts`, `order-expiry.service.ts` | hủy, refund, expiry, startup catch-up, cạnh tranh với payment |

Đây là địa chỉ code/test để điền tiếp [ma trận truy vết](../traceability-matrix.md),
chưa ký PASS từng AC hay hoàn tất Task 5. Task 3/ADR, CI PostgreSQL/E2E,
production/CD, HTTPS, release và bàn giao vẫn được theo dõi riêng.

## Kiểm tra chuẩn bị ngày 13/11/2026

Thực hiện trong môi trường trợ lý Linux: Node 24.22.1, npm 11.9.0,
PostgreSQL 17.11. Dependency sử dụng cùng phiên bản đã cài; cần chạy
`npm ci` lại từ lockfile trên máy A và qua CI A2.

| Kiểm tra | Kết quả |
|---|---|
| Typecheck web/api | Mã 0 |
| Lint web | Mã 0 |
| Unit web | 970/970, không fail/skip |
| Unit api | 190/190, không fail/skip; có guard chặn DB A1/production |
| Build web/api | Mã 0; backend generate Prisma và Nest build |
| Migration trên DB test riêng | Ba migration áp dụng được |
| Workflow PostgreSQL | 28/28; fixture riêng được dọn |
| Chuyển đổi legacy | SQL migration thật trong schema UUID riêng; digest cột gốc giữ nguyên, replay/read-only đạt, schema đã dọn |
| Script cấu hình local | 8/8; cấu hình đang có được giữ nguyên |
| HTTP/BFF/CLI production local | 9/9; dùng cookie A2, Nest/Next build thật; fixture được dọn |
| Browser | Chưa đạt lượt kiểm ở đây: Chromium bị chặn khi khởi động do môi trường không cho Unix socket; không có bước browser nào được ghi PASS |
| Docker/Windows/HTTPS | Chưa chạy cho bản checkout A2 này |

Lần build đầu không resolve được Next.js vì dependency nằm sau symlink ngoài
workspace. Đổi sang dependency nằm trong workspace rồi chạy build đạt, không
sửa cấu hình sản phẩm để vượt lỗi môi trường. Lượt HTTP bật browser đã qua
9 nhóm HTTP nhưng exit 1 ở launch Chromium; lượt HTTP riêng sau đó exit 0.
Không biến lượt browser này thành kết quả đạt hoặc dùng bằng chứng A1 thay thế.

## Kiểm chứng Windows và Compose ngày 13/11/2026

[QA Windows](CHECKOUT_WINDOWS_QA.md) ghi nhận các kiểm tra terminal và bằng
chứng Compose A2 mới: **8/8 nhóm Compose, browser 9/9**, cleanup đạt, tồn kho
có sẵn không đổi và dữ liệu/phiên giữ qua stop/start. Đây là source tích hợp
chưa commit trên nền `3be4a11`, có fingerprint và image ID trong report;
không gán kết quả cho riêng nền sạch. Lượt chuẩn bị Linux ở trên được giữ
nguyên với giới hạn riêng. Không cần chạy lại toàn bộ chỉ để bổ sung hồ sơ QA.

## Các lệnh kiểm tra trên bản A2 đã áp dụng

Từ gốc repo:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
node --test scripts/setup-env.test.mjs
```

Mỗi lệnh phải mã 0. Các lệnh trên không deploy hoặc chạy seed. `npm ci`
không cần tải browser để chạy unit/build; bước browser riêng có thể cần
`npm exec --workspace apps/web -- playwright install chromium`.

### Workflow trên PostgreSQL riêng

Chuẩn bị database test mới `brewlite_a2_test` và kết nối local. Đặt
`DATABASE_URL` cho riêng phiên kiểm tra, `A2_INTEGRATION_TEST=1`, rồi chạy
migration, build và các lệnh sau. Không dán URL có mật khẩu vào report.

```powershell
npm run db:deploy --workspace apps/api
npm run test:workflow --workspace apps/api
npm run test:legacy --workspace apps/api
npm run test:workflow-http --workspace apps/api
```

HTTP runner tự mở server kiểm tra ở cổng 3300/3302, dừng chúng khi kết thúc;
`AUTH_JWT_SECRET` cần được cấu hình cho phiên này. Đặt `A2_BROWSER_TEST=1`
để chạy thêm browser. Không bật bộ dev/production khác trên hai cổng đó.
Guard chỉ nhận `brewlite_a2_test` trên localhost/127.0.0.1/IPv6 loopback;
chặn database ứng dụng, database A1 và override host/schema.

### Demo Compose với dữ liệu mẫu

Đọc [COMPOSE.md](COMPOSE.md). Migration mới phải được deploy trước khi khởi
động backend mới. Với volume đang có đơn, giữ nguyên dữ liệu và kiểm kê trước;
không reset database hoặc sửa migration cũ. Catalog seed không khởi tạo kho.

Seed demo mới yêu cầu `DEMO_SEED_ENABLED=true` và đích local/Compose
`brewlite_a2`. Chỉ khi fixture sạch, chưa có Order/reservation và kho/version
đều 0 mới cho `INIT_DEMO_STOCK=true`; giữ nguyên điều kiện bảo vệ này.
Nếu volume đã có dữ liệu, dùng project Compose riêng cho checkout demo,
ví dụ `-p brewlite-a2-checkout`, thay vì xóa volume cũ. Mọi lệnh Compose trong
một lượt phải dùng cùng project, env-file và database đã kiểm tra.

Biến `CHECKOUT_V2_ENABLED=1` bật provider v2. File mẫu local để 0 cho đến khi
hoàn tất migration/kiểm tra; Compose mặc định 1 sau quy trình chuẩn bị.
`MOCK_PAYMENT_OUTCOME` mặc định SUCCEEDED; CLI chỉ mở khi
`DEMO_WORKFLOW_ENABLED=true`. Không bật CLI demo trên production tùy tiện.

## Phần tiếp theo

Các kiểm tra chức năng trên Windows và Compose đã chạy đạt trong phạm vi
[QA tích hợp](CHECKOUT_WINDOWS_QA.md). Rà diff/dependency, commit/push nhánh
và review PR; sau đó theo dõi GitHub CI của commit cuối. Điền evidence theo AC,
kiểm PWA/owner/cookie trên HTTPS khi có production. Hoàn thiện Task 3, CD/release
và nghiệm thu Task 1-5 theo đầu ra; không suy hoàn thành toàn A2 từ kết quả local.

Log kiểm tra và fingerprint source chuẩn bị:
[checkout preparation](testing/checkout-preparation-2026-11-13/README.md).
Bằng chứng Compose trên Windows:
[checkout Windows](testing/checkout-windows-2026-11-13/README.md).
