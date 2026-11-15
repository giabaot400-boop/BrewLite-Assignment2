# Triển khai và phục hồi BrewLite Assignment 2

Entry point Task 5.3/5.4. Hướng dẫn này bổ sung code CD; đã có deploy/smoke qua CI #53, xem bằng chứng cuối trang. Bằng chứng cũ ở [PR #15](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/15) thuộc source `0bea2e2`, trước workflow Sprint 3. Deployment diagram và cấu hình E đang review ở [PR #3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3).

## Cấu hình mục tiêu

Ba service thường trực: Next.js UI/BFF (3000), NestJS/mock payment (3001), PostgreSQL 17 có volume (5432). Chỉ Web có domain HTTPS; API và DB dùng private network. Migration là pre-deploy của API, không là service thứ tư.

| Thành phần | Cấu hình |
|---|---|
| Web | `PORT=3000`, `NODE_ENV=production`, `TZ=UTC`, `CHECKOUT_V2_ENABLED=1` |
| Web origin/cookie | `APP_ORIGIN=https://brewlite-production.up.railway.app`, `AUTH_COOKIE_NAME=brewlite_a2_session` |
| Web upstream | `BACKEND_INTERNAL_URL=http://<api>.railway.internal:3001` |
| API | `PORT=3001`, `NODE_ENV=production`, `TZ=UTC`, `FRONTEND_ORIGIN` bằng origin Web |
| API database | `DATABASE_URL` private, database `brewlite_a2`; không public DB |
| API secret | `AUTH_JWT_SECRET` đủ mạnh, chỉ trong Railway variables |
| API workflow | `MOCK_PAYMENT_OUTCOME=SUCCEEDED`, `DEMO_WORKFLOW_ENABLED=false` |
| API pre-deploy | `npm exec --workspace apps/api -- prisma migrate deploy` |
| Health | API `/health`; Web public `/api/health` proxy tới API |
| Public API | `/api/products`, `/api/auth/*`, `/api/orders/*`, `/api/payments` qua Web/BFF; route riêng tư vẫn cần phiên/guard |

`/api/health` không lộ hostname/secret và trả no-store; health tiến trình không kiểm DB. Smoke gọi thêm Product BFF để kiểm đọc DB. Không cần public NestJS hoặc DB để dùng các URL BFF trên.

## Chuẩn bị lần đầu nâng từ bản nền

1. Ghi source/digest/deployment ID hiện tại của Web/API. Tạo backup riêng trước thay schema, kiểm migration trên database test/bản sao. Giữ các log đã bỏ secret; không đưa dump vào Git.
2. Chạy CI build/publish trên main sau khi PR được review/merge, chưa chọn deploy. Lấy đúng API/Web digest trong job summary; không dùng latest làm mốc phát hành.
3. Nâng API bằng digest mới trong Railway với pre-deploy ở trên. Migration thứ ba `20261109010714_sprint3_payment_stock` backfill subtotal và giữ policy1 cho đơn cũ. Kiểm migration/health và dữ liệu cũ; cần khoảng chuẩn bị trong lúc Web cũ chưa được dùng để tạo giao dịch mới.
4. Migration đặt stock=0. Nếu đúng bốn sản phẩm mẫu, chưa từng cấp kho, chưa có reservation hoặc đơn policy2, có thể dùng thao tác một lần bên dưới. Nếu không thỏa, dừng để review dữ liệu; không reset/xóa đơn/giảm guard.
5. Kiểm tồn sẵn sàng, Web runtime variables, cookie/origin và backup. Sau đó mới bật `RAILWAY_DEPLOY_READY=true` ở GitHub Environment. Không đặt biến này để bỏ qua bước chuẩn bị.

### Khởi tạo kho một lần, giữ đơn cũ

Helper `apps/api/prisma/initialize-railway-stock.mjs` được đưa vào API image. Chạy **trong container API Railway** bằng console/SSH của người có quyền, nơi `DATABASE_URL`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID` đã đúng. Không sao chép DATABASE_URL ra chat hoặc public TCP proxy.

```sh
npm run stock:init:railway --workspace apps/api -- --plan
```

Mặc định chỉ đọc. Khi plan hợp lệ và reviewer đã đối chiếu backup/dữ liệu:

```sh
ALLOW_A2_RAILWAY_STOCK_INIT=1 npm run stock:init:railway --workspace apps/api -- --execute
```

Helper khóa và kiểm tra trong transaction serializable, chỉ cấp 10 ly/sản phẩm cho bốn ID catalog, tăng version đúng một lần; giữ nguyên đơn policy1. Có đơn policy2, reservation, stock/version đã dùng hoặc catalog khác thì từ chối. Lần chạy lại từ chối thay vì cấp thêm. Đây là kho demo theo phạm vi môn, không là API nhập kho tổng quát. Không thêm helper vào pre-deploy, không đổi guard seed-demo local/Compose.

### Điều kiện của cả API và Web trước lượt CI đầu tiên

Trước deploy=true, kiểm **cả hai service** đã ngắt GitHub source, source là đúng GHCR image ghim digest và deployment gần nhất SUCCESS. Không chỉ kiểm API. Nếu Web chưa đạt, cấu hình Web bằng digest đã publish, đợi deployment SUCCESS và kiểm lại origin/cookie/flag; không dùng tag latest. Preflight dừng trước mutation nếu một trong hai service chưa đạt.

Lượt đối chiếu của A ngày 15/11 xác nhận cả hai source cũ đều đã ghim digest của 0bea2e2; vẫn cần đọc trạng thái deployment sau mỗi thay đổi. Cấu hình Source không tự chứng minh container mới đã active.

## GitHub Environment và secret

Tạo Environment `railway-production`. Chỉ người có quyền Railway/GitHub cấu hình; không cần gửi token cho người viết code.

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `RAILWAY_PROJECT_TOKEN` | Project token Railway chỉ cho đúng environment; dùng header Project-Access-Token |
| Variable | `RAILWAY_PROJECT_ID` | ID project A2 |
| Variable | `RAILWAY_ENVIRONMENT_ID` | ID production environment |
| Variable | `RAILWAY_API_SERVICE_ID` | ID service API, khác Web/DB |
| Variable | `RAILWAY_WEB_SERVICE_ID` | ID service Web |
| Variable | `SMOKE_BASE_URL` | `https://brewlite-production.up.railway.app` |
| Variable | `RAILWAY_DEPLOY_READY` | `true` sau khi hoàn thành chuẩn bị dữ liệu và runtime config |

Giữ package GHCR public như cấu hình E đã dùng. Script từ chối source GitHub còn nối hoặc image cũ không ghim digest, để tránh đổi nguồn deploy ngoài ý muốn. Branch main/CI verify vẫn được bảo vệ; Environment có thể thêm reviewer trước phát hành theo quyền nhóm.

## Phát hành qua CI

1. Merge code đã review, kiểm CI verify + publish-ghcr đúng source SHA.
2. Actions → CI → Run workflow → branch main → chọn `deploy=true`.
3. Pipeline chạy lại verify, build/push Web/API từ cùng SHA; chuyển chính outputs digest sang job deploy.
4. Script xác minh token đúng project/environment, IDs và variables; ghi previous digest/deployment ID đã lược secret.
5. Cập nhật API image/pre-deploy/health, đọc lại config, trigger deployment và poll đúng deployment ID tới SUCCESS. Lỗi migration/deploy hoặc timeout dừng trước khi đổi Web.
6. Cập nhật Web, đợi SUCCESS, rồi smoke GET HTTPS trang chủ, `/api/health`, catalog, chi tiết, manifest, worker và hai icon.
7. Lưu artifact `railway-release-<SHA>-<attempt>` gồm deployment IDs/previous pins và smoke. Smoke fail làm job đỏ; không gọi đó là release đạt.

Push main thường chỉ verify/publish; production release do người có quyền chủ động kích hoạt. Khi đã chọn deploy mà thiếu secret/variables/ready, lượt đó fail, không âm thầm bỏ qua rồi báo deploy đạt. Workflow không tự deploy khi mở PR.

Script dùng Railway Public API tại endpoint cố định; không dump variables hoặc lỗi GraphQL có thể chứa secret. Unit test giả không thay lượt deploy thật. Tạo một run CI release thật và bổ sung link vào hồ sơ sau khi đã cấu hình quyền.

## Rollback và xử lý failure

- Nếu API fail trước Web: Web chưa bị đổi bởi script; kiểm trạng thái API và deployment ID. Nếu API thành công nhưng Web/smoke fail, bản có thể đang trộn phiên bản: dùng artifact để xác định chính xác, không giả định cả hai đã tự quay lại.
- Nếu timeout, kiểm deployment đã ghi còn QUEUED/BUILDING/DEPLOYING không; hủy lượt đang chạy trong Railway nếu cần trước khi phát hành tiếp. CI không tự tạo deployment thứ hai để retry mutation không rõ.
- Chỉ rollback ứng dụng tới cặp digest/SHA đã kiểm và tương thích schema. Dashboard Railway có thể phục hồi cả image lẫn variables; kiểm origin/cookie/checkout flag sau thao tác. Không tắt v2 trên storage đã chuyển.
- Đặc biệt, không mặc định rollback toàn bộ về image Sprint2 sau khi đã có đơn policy2. Giữ API/schema mới, dùng bản sửa tương thích và kiểm dữ liệu trước.
- Không tự chạy down migration, reset DB, xóa volume hoặc restore đè production. Restore phải có quyết định riêng, bản backup và hiểu dữ liệu phát sinh sau backup.
- Sau phục hồi, chạy smoke lại, kiểm đơn cũ/mới và ghi run/digest/deployment/kết quả. Rollback chưa thực hiện thì ghi chưa kiểm chứng.

## Đầu ra bàn giao

- HTTPS: `https://brewlite-production.up.railway.app`.
- Public catalog BFF: `/api/products`; public process health: `/api/health` trên cùng origin sau bản mới.
- [Tests và lệnh smoke](../tests/README.md); [local checkout](assignment2/CHECKOUT_INTEGRATION.md); [Compose](assignment2/COMPOSE.md).
- Release/tag/notes, run CD/smoke, kết quả workflow HTTPS và PWA, demo, Review/Retro và người ngoài clone/chạy vẫn cần bằng chứng thật. Hướng dẫn/code này không tự đánh dấu những mục đó đạt.

Nguồn API Railway đã đối chiếu: [Authentication](https://docs.railway.com/integrations/api), [Services](https://docs.railway.com/integrations/api/manage-services), [Deployments](https://docs.railway.com/integrations/api/manage-deployments), [schema CLI chính thức](https://github.com/railwayapp/cli/blob/master/src/gql/schema.json). Token project dùng header riêng; không dùng account token rộng hơn cho workflow này.

Thông báo lỗi chỉ cho phép AssertionError có message viết tay do code kiểm soát; assertion tự sinh và lỗi từ SQL/API được che bằng thông báo chung. Artifact vẫn giữ stage/status/deployment ID để gỡ lỗi mà không in variables hoặc payload.

## Xác nhận đúng build và review bổ sung

CI truyền `BREWLITE_BUILD_SHA` vào Docker build Web; Next.js inline giá trị này khi build. `/api/health` trả `buildSha` của image, không lấy từ biến Railway lúc chạy. Smoke trong CI so sánh nó với `GITHUB_SHA`; thiếu SHA hoặc đang chạy bản cũ thì thất bại. Báo cáo phân biệt `expectedSourceSha` với `observedSourceSha`. Chạy local không có GITHUB_SHA vẫn kiểm chức năng, không chứng minh đúng release. Digest API/Web và deployment ID vẫn được ghi riêng trong deploy artifact; SHA Web không tự chứng minh digest API.

Trước khi dùng project token production, cấu hình Environment chỉ cho nhánh `main` và required reviewer. Workflow concurrency tách push/dispatch; chỉ chạy một lượt production deploy tại một thời điểm. Artifact giữ 7 ngày.

Review bổ sung có test API thành công rồi Web thất bại (giữ hai deployment ID/pin cũ, không rollback database), deployment sai service, GitHub source còn nối, deployment cũ thất bại và checkout flag sai. Các test dùng fixture, không thay thế live Railway.

## Bằng chứng triển khai đã chạy

[CI #53 / source ce4faf6](assignment2/testing/railway-production-2026-11-15/README.md) đã verify/publish/deploy API rồi Web và smoke 8/8. Hai JSON nguyên bản được giữ trong repo. Đây là mốc code production, không tự là tag/release hoặc SHA của mọi commit tài liệu về sau. Kho đã bootstrap một lần; không lặp initializer ở production hiện tại.
