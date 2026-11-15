# Chạy BrewLite A2 local bằng Docker Compose

Hướng dẫn hiện hành cho checkout v2; [hồ sơ Compose cũ](COMPOSE_HISTORY_2026-11-13.md) giữ các kết quả ngày 13/11. Hướng dẫn này được đối chiếu compose.yaml/Dockerfile/seed guard, chưa là lượt người ngoài chạy đã đạt.

## Chọn cách chạy

Đây là nhánh Docker của [README](../../README.md). Cần Git, Node.js 24 (>=24.15 <25) để tạo secret và Docker Desktop chạy Linux containers. Không cần cài PostgreSQL trên host, không cần npm ci/npm run setup trên host; dependency được cài trong bước build image. Dùng PowerShell, chạy tại gốc một bản clone A2 riêng.

Người thử clone repo vào thư mục mới theo README. Nếu thử trước khi PR tài liệu merge, chọn đúng nhánh docs/a2-final-closeout; sau merge dùng main. Ghi `git rev-parse HEAD`, Node, Docker và OS vào [phiếu](OUTSIDER_RUN_CHECKLIST.md). Không clone lồng vào repo đã có.

## 1. Tạo cấu hình lần đầu

Dùng project riêng `brewlite-a2-review` cho toàn bộ lệnh bên dưới để tách named volume. Đóng bộ local khác đang chiếm cổng 3100 trước; không dừng production. Không xóa/reset volume để vượt lỗi fixture.

Lệnh sau chỉ tạo .env.compose nếu chưa có, sinh secret ngẫu nhiên và không in giá trị:

```powershell
node -e "const fs=require('node:fs'),c=require('node:crypto');const p='.env.compose';if(fs.existsSync(p))throw Error('File already exists; keep existing secrets.');fs.writeFileSync(p,'POSTGRES_PASSWORD='+c.randomBytes(24).toString('hex')+'\nAUTH_JWT_SECRET='+c.randomBytes(32).toString('hex')+'\nCHECKOUT_V2_ENABLED=1\n');console.log('Created A2 .env.compose');"
git check-ignore .env.compose
docker compose -p brewlite-a2-review --env-file .env.compose config --quiet
```

Nếu file đã tồn tại, giữ nguyên secret và kiểm CHECKOUT_V2_ENABLED=1; không chạy lại lệnh tạo file. Không gửi .env.compose hoặc output config chứa secret vào phiếu.

## 2. Build, migration và fixture mới

Chạy từng bước, chỉ tiếp tục khi lệnh mã 0. Migration trước khi mở backend mới; không tự chạy seed khi restart.

```powershell
docker compose -p brewlite-a2-review --env-file .env.compose build backend frontend
docker compose -p brewlite-a2-review --env-file .env.compose up -d --wait db
docker compose -p brewlite-a2-review --env-file .env.compose run --rm --no-deps backend npm exec --workspace apps/api -- prisma migrate deploy
docker compose -p brewlite-a2-review --env-file .env.compose run --rm --no-deps backend npm run db:seed --workspace apps/api
```

Catalog seed tạo bốn sản phẩm/hai topping, **chưa cấp kho**. Trên fixture mới chưa có Order/reservation và stock/reserved/version đều 0, chạy demo seed một lần:

```powershell
docker compose -p brewlite-a2-review --env-file .env.compose run --rm --no-deps -e DEMO_SEED_ENABLED=true -e INIT_DEMO_STOCK=true backend sh -c 'cd /app/apps/api && node --import tsx prisma/seed-demo.ts'
```

Kỳ vọng `Demo ready: stock initialized to 10; DEMO10 upserted.` Guard kiểm database brewlite_a2 trên host db và fixture chưa sử dụng. Dữ liệu đã có đơn hoặc kho/version đã dùng thì dừng; không xóa đơn, sửa guard, reset hoặc down -v. Nếu cần fixture mới, dùng một project review mới thống nhất cho toàn bộ lệnh, ghi tên đó vào phiếu. Cửa sổ DEMO10 cố định 01/11–01/12/2026 UTC; sau mốc đó không đổi ngày hệ thống để làm ca khuyến mãi đạt.

## 3. Khởi động và thử local

```powershell
docker compose -p brewlite-a2-review --env-file .env.compose up -d --wait backend frontend
docker compose -p brewlite-a2-review --env-file .env.compose ps
Invoke-RestMethod http://localhost:3100/api/health
Invoke-RestMethod http://localhost:3100/api/products
```

Kỳ vọng ba service healthy, health status/api ok và checkoutV2Enabled=true, catalog có bốn sản phẩm. Build SHA local có thể unknown vì Compose không truyền CI build-arg; không lấy đó làm bằng chứng đã chạy đúng release production.

Mở **http://localhost:3100**, dùng profile/browser riêng cho A2. Kiểm tám ca trong phiếu: menu/tùy chọn/giỏ/auth/tạo đơn/thanh toán/hủy/lịch sử. Chọn không dùng mã giảm giá khi đối chiếu cà phê sữa L + Kem + Trân châu = 57.000đ. Nhãn “Tạo và xem đơn” mở hộp; phải xác nhận cuối mới gửi tạo đơn. Thanh toán là Ví/Thẻ mô phỏng, không nhập thông tin thẻ thật.

## 4. Chạy lại và dừng

Sau lần đầu, không lặp seed hoặc initializer:

```powershell
docker compose -p brewlite-a2-review --env-file .env.compose up -d --wait
docker compose -p brewlite-a2-review --env-file .env.compose down
```

Chỉ chạy down khi kết thúc lượt thử. Down giữ volume; không thêm -v. Giữ cùng project/env-file khi đọc lại dữ liệu. Thay runtime env cần recreate service; không rebuild image chỉ để thay CHECKOUT_V2_ENABLED. Thay NEXT_PUBLIC_* hoặc source thì build lại.

## Ranh giới môi trường

Frontend publish 127.0.0.1:3100→3000. API:3001 và DB:5432 private trong Compose, BACKEND_INTERNAL_URL=http://backend:3001, cookie brewlite_a2_session; named volume có tiền tố project. Không dùng DATABASE_URL/token Railway trong lượt local. API Dockerfile giữ Prisma CLI, tsx, migration và client để chạy lệnh fixture.

Kiểm unit/integration/E2E chuyên sâu theo [tests](../../tests/README.md); không bắt người dùng thử chạy mọi test để thay nghiệm thu nghiệp vụ. [Production](DEPLOYMENT.md) và [CD #53](testing/railway-production-2026-11-15/README.md) có source/evidence riêng.
