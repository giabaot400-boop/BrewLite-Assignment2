# BrewLite — Assignment 2

Repository: https://github.com/giabaot400-boop/BrewLite-Assignment2

Bộ source riêng cho Assignment 2, gồm Next.js/TypeScript/Tailwind, NestJS/Prisma
và PostgreSQL. Assignment 1 tiếp tục ở [BrewLite](https://github.com/giabaot400-boop/BrewLite).
Hai repo được clone, cấu hình, review và triển khai độc lập.

## Phạm vi bản kế thừa

Source bắt đầu từ main A1 `69b8011`; tài liệu Task 2/matrix được đưa sang từ
commit A1 `c7554b2`. Xem [nguồn kế thừa](docs/assignment2/SOURCE_PROVENANCE.md)
để đối chiếu commit/PR, giới hạn bằng chứng và cách nhận các bản sửa tiếp theo.

Nền này có danh mục, auth, giỏ, tạo đơn PENDING và PWA. Luồng checkout V2,
payment, kho/điểm và các phần Sprint 3 đang trên nhánh A1 phải được tích hợp,
review và kiểm chứng riêng trước khi ghi hoàn tất A2. Có source không đồng nghĩa
đã nghiệm thu Task 1–5 hoặc đã triển khai production.

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
| Frontend `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |
| Frontend `BACKEND_INTERNAL_URL` | `http://localhost:3001` |
| Frontend `APP_ORIGIN` | `http://localhost:3000` |
| Frontend `AUTH_COOKIE_NAME` | `brewlite_a2_session` |

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

Dùng migration đã có, không sửa migration đã áp dụng. Seed hiện có upsert bốn
sản phẩm và hai topping; chưa thay seed kho/promotion của phần Sprint 3.

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
npm test --workspace apps/web
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

## Cấu trúc và tài liệu

| Đường dẫn | Nội dung |
|---|---|
| `apps/web/` | Next.js, UI, BFF và PWA |
| `apps/api/` | NestJS, Prisma, migration/seed và kiểm thử backend |
| `docs/requirements/` | Task 1: bối cảnh, SRS, UC-09 và ngữ cảnh hỗ trợ |
| `docs/diagrams/` | Task 2: nguồn PlantUML, SVG và giải thích |
| `docs/architecture/` | Đóng góp kiến trúc; còn cần hoàn thiện tổng thể/ADR/deployment |
| `docs/assignment2/` | Kế hoạch, contract, nguồn kế thừa và PWA |
| `docs/traceability-matrix.md` | Yêu cầu → thiết kế → code/test/evidence |
| `scripts/` | Thiết lập cấu hình local |

Đọc [mục lục tài liệu A2](docs/README.md) và [quy trình Git](docs/GIT_WORKFLOW.md).
Các hồ sơ Sprint 1–3 A1 còn trong bản kế thừa là tài liệu tham khảo có nguồn,
không phải Review/Retro hoặc nghiệm thu hai Sprint của A2.

Mọi thay đổi A2 mở PR tại repo này, có reviewer trước merge. Task 1→5 được
nghiệm thu theo thứ tự và lịch sử thật. CI/CD, Compose, health/deployment,
production HTTPS, release và bằng chứng bàn giao còn phải được hoàn thiện;
README này không ghi nhận các đầu ra đó đã đạt.
