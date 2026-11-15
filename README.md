# BrewLite — Assignment 2

Repository: https://github.com/giabaot400-boop/BrewLite-Assignment2

Bộ source riêng cho Assignment 2, gồm Next.js/TypeScript/Tailwind, NestJS/Prisma
và PostgreSQL. Assignment 1 tiếp tục ở [BrewLite](https://github.com/giabaot400-boop/BrewLite).
Hai repo được clone, cấu hình, review và triển khai độc lập.

## Phạm vi bản kế thừa

Source bắt đầu từ main A1 `69b8011`; tài liệu Task 2/matrix được đưa sang từ
commit A1 `c7554b2`. Xem [nguồn kế thừa](docs/assignment2/SOURCE_PROVENANCE.md)
để đối chiếu commit/PR, giới hạn bằng chứng và cách nhận các bản sửa tiếp theo.

Bản tích hợp checkout tiếp nhận workflow A1 `3a70df6` trên nền A2 `3be4a11`: tạo/đọc đơn, thanh toán, hủy/hoàn mock, hết hạn, kho/điểm và giỏ v2. Giữ CI, PWA, Docker và Product API private của A2. Xem [phạm vi và kiểm tra tích hợp](docs/assignment2/CHECKOUT_INTEGRATION.md). Các kiểm tra chuẩn bị không thay review/CI/Windows/Compose A2 hoặc nghiệm thu Task 1–5; production vẫn cần triển khai riêng.

## Yêu cầu trên máy

- Node.js 24, từ 24.15 trở lên trong dòng 24; npm đi kèm.
- Git, trình soạn thảo và PostgreSQL 17.
- Database local riêng cho A2; ví dụ `brewlite_a2`.

## Cài đặt và cấu hình local

Clone repo A2 vào một thư mục riêng; ví dụ trên Windows:

```powershell
git clone https://github.com/giabaot400-boop/BrewLite-Assignment2.git D:\cnpm\brewlite-a2
Set-Location D:\cnpm\brewlite-a2
npm ci
npm run setup
```

Nếu đã có bản clone, chạy từ thư mục đó, không clone lồng vào nó.
Setup chỉ tạo các file còn thiếu:

- `apps/api/.env`: cấu hình backend; JWT secret ngẫu nhiên được sinh khi tạo file mới.
- `apps/web/.env.local`: Product API thật, upstream BFF và origin của frontend.

Setup không ghi đè file đã có hoặc in giá trị secret. Với cấu hình cũ, đối chiếu
các khóa còn thiếu theo file mẫu và điền thủ công. Không sao chép `.env`/`.env.test`
hoặc thông tin production từ repo A1; không commit file môi trường thật.

### PostgreSQL

Tạo database `brewlite_a2` bằng tài khoản quản trị PostgreSQL. Nếu đã có role
ứng dụng `brewlite`, ví dụ SQL là:

```sql
CREATE DATABASE brewlite_a2 OWNER brewlite;
```

Điền mật khẩu và thông tin thực tế vào `DATABASE_URL` trong `apps/api/.env`;
đường dẫn database phải là A2. Mã hóa ký tự đặc biệt trong phần mật khẩu URL.
Role có thể dùng chung trên máy, nhưng database A1/A2 phải tách để tránh trộn dữ liệu.
Không dùng reset hoặc seed lên database A1 để chuẩn bị A2.

Mặc định local:

| Cấu hình | Giá trị |
|---|---|
| Backend `PORT` | `3001` |
| Backend `FRONTEND_ORIGIN` | `http://localhost:3000` |
| Frontend `NEXT_PUBLIC_PRODUCTS_SOURCE` | `api` |
| Frontend `BACKEND_INTERNAL_URL` | `http://localhost:3001` |
| Frontend `APP_ORIGIN` | `http://localhost:3000` |
| Frontend `AUTH_COOKIE_NAME` | `brewlite_a2_session` |
| Frontend `CHECKOUT_V2_ENABLED` | `1` trong mẫu bàn giao; migration và chuẩn bị kho trước khi chạy |
| Backend `MOCK_PAYMENT_OUTCOME` | `SUCCEEDED` |
| Backend `DEMO_WORKFLOW_ENABLED` | `false` |

`AUTH_JWT_SECRET` thuộc backend, không đưa vào biến public hoặc log. Mở đúng
origin đã cấu hình; đổi biến môi trường thì khởi động lại ứng dụng tương ứng.

### Migration và seed

Sau khi kiểm tra database đích trong `.env`, chạy từ gốc repo:

```powershell
npm run db:generate
npm run db:validate
npm exec --workspace apps/api -- prisma migrate deploy
npm run db:seed
```

Dùng migration đã có, không sửa migration đã áp dụng. Seed catalog upsert bốn sản phẩm và hai topping. Seed kho/promotion demo dùng guard riêng trong [hướng dẫn checkout](docs/assignment2/CHECKOUT_INTEGRATION.md); không reset kho hoặc chạy khởi tạo lên volume đã có đơn.

### Checkout v2 trên bản bàn giao

Mẫu mới bật `CHECKOUT_V2_ENABLED=1` để hiển thị checkout Sprint 3. `npm run setup` giữ nguyên `.env.local` đang có: nếu dùng cấu hình cũ, kiểm tra/chỉnh cờ và khởi động lại Web. Giữ v2 sau khi storage đã chuyển.

`db:seed` chỉ tạo catalog, không cấp tồn kho. Trước khi demo tạo đơn, chuẩn bị kho/promotion theo [hướng dẫn checkout](docs/assignment2/CHECKOUT_INTEGRATION.md#demo-compose-với-dữ-liệu-mẫu). Trên fixture local mới, có thể chạy từ `apps/api` với DATABASE_URL A2 đã kiểm:

```powershell
Push-Location apps/api
$env:DEMO_SEED_ENABLED = "true"
$env:INIT_DEMO_STOCK = "true"
try {
  node --import tsx prisma/seed-demo.ts
  if ($LASTEXITCODE -ne 0) { throw "Demo preparation failed; inspect the target and existing data." }
} finally {
  Remove-Item Env:DEMO_SEED_ENABLED, Env:INIT_DEMO_STOCK -ErrorAction SilentlyContinue
  Pop-Location
}
```

Guard chỉ chấp nhận fixture A2 local/Compose chưa có Order/reservation và kho/version bằng 0. Với dữ liệu đã dùng, giữ nguyên và chọn fixture demo riêng; không xóa/reset để vượt guard. Railway có [quy trình nâng bản riêng](docs/deployment.md), không dùng lệnh seed-demo local này.

## Chạy ứng dụng

```powershell
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health tiến trình: http://localhost:3001/health
- Product API: http://localhost:3001/products

Có thể chạy riêng bằng `npm run dev:frontend` và `npm run dev:backend` trong
hai terminal tại gốc repo A2. Dừng bằng Ctrl+C. `/health` hiện chỉ kiểm tra tiến
trình; Product API giúp kiểm tra đọc database thực tế.

A1/A2 đang dùng cùng cổng local nên chỉ bật một bộ server tại một thời điểm.
Dùng một profile trình duyệt riêng cho A2 để giỏ/pending trong localStorage
không lẫn với A1. Cookie A2 dùng tên riêng; không xóa giỏ hoặc pending A1 để
làm sạch môi trường A2. Mỗi repo có `node_modules`, `.env` và database của mình.

Fixture chỉ dùng khi chủ động đặt `NEXT_PUBLIC_PRODUCTS_SOURCE=fixture` để phát
triển giao diện; không thay kiểm thử với API/PostgreSQL. Backend `DEMO_MODE`
không thay yêu cầu có database.

## Kiểm tra và PWA

```powershell
node --test scripts/setup-env.test.mjs
npm test
npm run lint
npm run typecheck
npm run build
```

Test setup chạy trong thư mục tạm, không dùng `.env` thật hoặc database. Các lệnh
kiểm tra ứng dụng được giữ theo source kế thừa. Chạy và lưu kết quả của đúng
commit A2; không đổi nhãn kết quả A1 thành kết quả A2. Integration/PostgreSQL,
E2E, hiệu năng và production cần bằng chứng riêng theo AC trong
[ma trận truy vết](docs/traceability-matrix.md).

Xem [hướng dẫn PWA](docs/assignment2/PWA.md) để build/start và kiểm tra browser.
Worker chỉ cache tài nguyên public đã chọn, không tự gửi lại giao dịch.
Kết quả PWA local trước khi tách repo được ghi rõ là bằng chứng kế thừa.

## Kiểm thử tích hợp và triển khai

[tests/README.md](tests/README.md) là đầu mối unit, integration, E2E và smoke. Các lệnh gốc `test:integration`, `test:legacy`, `test:http`, `test:e2e` gọi lại runner đang có; chỉ chạy khi đã chuẩn bị database test local và build theo hướng dẫn.

[docs/deployment.md](docs/deployment.md) hướng dẫn Railway, CI secret, migration, smoke và rollback. Sau triển khai bản mới, API catalog public ở `/api/products`, process health public ở `/api/health` qua BFF; API NestJS/database vẫn private.

Workflow có đường phát hành chủ động từ main bằng `workflow_dispatch` với `deploy=true`, sau verify/publish cùng source. Chưa cấu hình token/IDs hoặc chưa có run deploy thực tế thì tiếp tục ghi chưa kiểm chứng production/CD. [Backlog hai Sprint](docs/assignment2/SPRINT_BACKLOG.md) và [checklist bàn giao](docs/assignment2/DELIVERY_CHECKLIST.md) ghi trạng thái và việc còn mở.

## Cấu trúc và tài liệu

| Đường dẫn | Nội dung |
|---|---|
| `apps/web/` | Next.js, UI, BFF và PWA |
| `apps/api/` | NestJS, Prisma, migration/seed và kiểm thử backend |
| `docs/requirements/` | Task 1: bối cảnh, SRS, UC-09 và ngữ cảnh hỗ trợ |
| `docs/diagrams/` | Task 2: nguồn PlantUML, SVG và giải thích |
| `docs/architecture/` | Đóng góp kiến trúc; còn cần hoàn thiện tổng thể/ADR/deployment |
| `docs/guides/` | Hướng dẫn kỹ thuật và Git A2 |
| `docs/reference/a1/` | Ba bản tham khảo có nguồn, không phải hồ sơ nghiệm thu A2 |
| `docs/assignment2/` | Kế hoạch, contract, nguồn kế thừa và PWA |
| `docs/traceability-matrix.md` | Yêu cầu → thiết kế → code/test/evidence |
| `scripts/` | Thiết lập cấu hình local |
| `tests/` | Đầu mối integration/E2E, smoke và kiểm tra delivery |
| `docs/deployment.md` | Hướng dẫn production, CD và rollback |

Đọc [mục lục tài liệu A2](docs/README.md) và [quy trình Git](docs/guides/GIT_WORKFLOW.md).
Cây A2 không giữ toàn bộ hồ sơ Sprint 1–3 A1. Chỉ ba tài liệu
[tham khảo có nguồn](docs/reference/a1/README.md) còn được giữ cho contract/thiết kế/UI;
chúng không phải Review/Retro hoặc nghiệm thu hai Sprint của A2.

Mọi thay đổi A2 mở PR tại repo này, có reviewer trước merge. Task 1→5 được nghiệm thu theo thứ tự và lịch sử thật. CI xanh/đỏ đã có qua PR #2/#6; Compose/Product API private qua #7; checkout tích hợp và QA local qua #11. Hồ sơ PWA/UI ở #14 đang review. E đã báo cáo HTTPS/tạo PENDING của bản nền `0bea2e2` tại #15; không gán kết quả đó cho bản S3 mới. Run CD/smoke trên đúng bản phát hành, release và bằng chứng bàn giao cần được bổ sung theo checklist.

## Checkout và Docker A2

Đọc [tích hợp checkout](docs/assignment2/CHECKOUT_INTEGRATION.md) và [Compose](docs/assignment2/COMPOSE.md). Web Compose dùng `http://localhost:3100`, database/volume riêng A2; backend/db private. Deploy migration mới trước backend mới. Không sao chép cấu hình/secret hoặc xóa volume A1/A2 để nhận code.
