# Docker Compose local — BrewLite Assignment 2

Ngày kiểm tra: 13/11/2026.

Nền source A2: db2afc7, cùng thay đổi trên nhánh chore/e-a2-docker.

Chỉ xác nhận môi trường local; chưa triển khai Railway/GHCR.

## Yêu cầu

- Docker Desktop chạy Linux containers.

- Chạy lệnh tại thư mục gốc repo BrewLite-Assignment2.

- Web dùng http://localhost:3100.

- Database/volume riêng A2, không dùng dữ liệu A1.

## Tạo secret lần đầu

File .env.compose phải được Git bỏ qua.

Không ghi đè file đã tồn tại hoặc đưa nội dung vào Git/log.

```powershell

node -e "const fs=require('node:fs'),c=require('node:crypto');const p='.env.compose';if(fs.existsSync(p))throw Error('File already exists; keep existing secrets.');fs.writeFileSync(p,'POSTGRES_PASSWORD='+c.randomBytes(24).toString('hex')+'\nAUTH_JWT_SECRET='+c.randomBytes(32).toString('hex')+'\n');console.log('Created A2 .env.compose');"

git check-ignore .env.compose

docker compose --env-file .env.compose config --quiet

```

## Cài đặt lần đầu

```powershell

docker compose --env-file .env.compose build backend frontend

docker compose --env-file .env.compose up -d --wait db

docker compose --env-file .env.compose run --rm --no-deps backend npm exec --workspace apps/api -- prisma migrate deploy

docker compose --env-file .env.compose run --rm --no-deps backend npm run db:seed --workspace apps/api

docker compose --env-file .env.compose up -d --wait backend frontend

```

Chỉ chạy seed catalog A2 khi cần dữ liệu mẫu.

Không dùng seed-demo hoặc cấu hình database A1.

Migration/seed không tự chạy ở mỗi app container.

## Chạy lại

```powershell

docker compose --env-file .env.compose up -d --wait

docker compose --env-file .env.compose ps

curl.exe -i http://localhost:3100/api/products

```

## Kiến trúc local

- Frontend publish 127.0.0.1:3100 → container port 3000.

- API port 3001 và PostgreSQL port 5432 chỉ dùng trong network Compose.

- Browser lấy menu qua /api/products trên Web.

- Web server lấy chi tiết sản phẩm qua BACKEND_INTERNAL_URL.

- Database: brewlite_a2.

- Volume: brewlite-a2_postgres_data.

- Cookie phiên: brewlite_a2_session.

- Production HTTPS phải kiểm tra lại cookie/Origin và hostname private.

## Biến build và runtime

- NEXT_PUBLIC_PRODUCTS_SOURCE và NEXT_PUBLIC_AUTH_SOURCE được truyền lúc build.

- Không đưa secret hoặc hostname private vào NEXT_PUBLIC_*.

- Web runtime dùng BACKEND_INTERNAL_URL và APP_ORIGIN.

- API runtime dùng DATABASE_URL, AUTH_JWT_SECRET, FRONTEND_ORIGIN và PORT.

- Web hiện chạy cố định port 3000.

- Image API giữ Prisma CLI, cấu hình và migration để chạy migrate deploy.

## Kết quả đã quan sát

- Build image API và Web: PASS.

- Prisma CLI/client 7.10.1 trong image API: PASS.

- bcrypt hash/compare trong image API: PASS.

- Hai migration áp dụng trên database Docker A2 sạch: PASS.

- Seed bốn sản phẩm và hai topping: PASS.

- Ba service Healthy; Product BFF trả 200 với bốn sản phẩm.

- Browser hiển thị menu và chi tiết cà phê sữa.

- Size L + Kem + Trân châu: 57000; UI báo thêm vào giỏ.

- Restart: ba service Healthy, API vẫn 200, dữ liệu còn 4 sản phẩm/2 topping.

- Lint Web: PASS.

- Web tests: 429/429 PASS.

- API tests: 62/62 PASS.

- Ngoài unit test, đã kiểm tra thủ công đăng nhập và tạo đơn PENDING
  qua UI/BFF/API trong Compose; chưa kiểm thử thanh toán.
- Đăng nhập qua giao diện Compose A2 thành công.
- Tạo đơn từ giỏ qua UI/BFF/API: PENDING, total 57000.
- Mã đơn kiểm chứng: c95ceabb-e1ac-4dbd-ba98-9bf122a9c885.
- Database brewlite_a2 xác nhận ledger SUCCEEDED, hash khớp Order.
- Giỏ được xóa sau khi tạo đơn thành công.
- Đã tái hiện EACCES khi user node ghi .next/cache.
- Dockerfile cấp quyền riêng cho thư mục cache; vẫn chạy USER node.
- Sau rebuild/recreate, Web Healthy; user 1000 ghi và xóa file cache thành công.
## Kiểm tra trong image

```powershell

docker run --rm brewlite-a2-web:local npm run lint --workspace apps/web

docker run --rm brewlite-a2-web:local npm test --workspace apps/web

docker run --rm brewlite-a2-api:local npm test --workspace apps/api

```

## Dừng

```powershell

docker compose --env-file .env.compose down

```

Lệnh down giữ named volume. Không dùng down -v với dữ liệu cần giữ.

## Giới hạn

- Chưa xác nhận thanh toán hoặc toàn bộ checkout end-to-end.

- Chưa kiểm thử trên máy thành viên khác.

- Chưa kiểm thử backup/restore hoặc rollback deployment.

- Chưa push registry, deploy Railway hoặc xác nhận production HTTPS.

- Image hiện giữ devDependencies; chưa tối ưu dung lượng.

- Web hiện dùng next start --port 3000, chưa đọc PORT động.
  Railway phải đặt PORT=3000 và target port 3000 nếu giữ cách chạy này.
- getProduct hiện phục vụ trang chi tiết trên server.
  Chưa có route BFF /api/products/:id cho browser.
  Nếu chuyển chi tiết sang client, cần bổ sung route tương ứng.
- Build arg NEXT_PUBLIC_API_URL đã bỏ vì mã Product API không còn đọc.
