# CI — A2-REPO-CI

Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). Chạy trên mọi `pull_request` và `push` vào `main`.

## Các bước (job `verify`)

| # | Bước | Lệnh | Fail thì |
|---|---|---|---|
| 1 | Cài phụ thuộc | `npm ci --ignore-scripts` | job đỏ |
| 2 | Sinh Prisma client | `npm run db:generate` | job đỏ |
| 3 | Lint | `npm run lint` (ESLint cho `apps/web`) | job đỏ |
| 4 | Typecheck | `npm run typecheck` (web + api) | job đỏ |
| 5 | Unit test | `npm test` (web: `node --test`; api: `tsx --test`) | job đỏ |
| 6 | Test script setup | `node --test scripts/setup-env.test.mjs` | job đỏ |
| 7 | Build | `npm run build` | job đỏ |

Bất kỳ bước nào lỗi thì các bước sau không chạy và check `verify` đỏ. Môi trường: Node theo `.nvmrc`, `NEXT_PUBLIC_PRODUCTS_SOURCE=fixture`, không cần database.

## Chặn merge (cổng G4)

Workflow chỉ *báo* đỏ/xanh. Để *chặn* merge, admin repo phải bật branch protection cho `main` (Settings → Branches → rule cho `main`).

- Cấu hình đã quan sát trên PR #5 (xem bảng bằng chứng): check `verify` ở trạng thái **Required** và cần ít nhất 1 approving review (hai mục: **Require status checks to pass before merging** với `verify`, và **Require a pull request before merging** kèm approval).
- Chưa xác nhận: tùy chọn **Require branches to be up to date before merging**. Đây là khuyến nghị, không phải cấu hình đã quan sát; không được hiểu rằng toàn bộ danh sách tùy chọn trên đã được kiểm chứng.

## Phạm vi và giới hạn

- Chưa chạy: test tích hợp API (`*.integration.*`) cần PostgreSQL, không nằm trong CI.
- `apps/api` chưa có ESLint nên lint chỉ phủ web (backlog).
- Test sản phẩm/menu: `apps/web/src/features/products/*.test.mjs`, `apps/api/src/products/products-prisma.service.spec.ts`.

## Bằng chứng CI (ghi ngày 12/11/2026)

| Trường hợp | PR / commit SHA | URL run | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| Thành công | Push vào `main` sau merge PR #4, commit `db2afc7c20dafb09d1d2c43cff9c0e3364a573cc` | [run 43013162855](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43013162855) | `verify` xanh | `verify` thành công, tổng 1m 3s (job 59s); Node v24.22.2, npm 11.19.1; run có 1 annotation cảnh báo, nội dung chưa được xem |
| Thất bại có chủ đích | PR #5 `[TEST] CI đỏ có chủ đích, KHÔNG MERGE`, nhánh `test/ci-red-demo`, commit `285c25bf62ae3b31cf184dd0189cd1379bab5cda` (đổi 1 dòng, +1/−1, trong `apps/web/src/features/products/format-price.test.mjs`) | [run 43159409852](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43159409852), [job 130986791687](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43159409852/job/130986791687) | `verify` đỏ, merge bị chặn | Bước **Unit test (web và api)** lỗi: test web 427, pass 426, **fail 1** tại `src/features/products/format-price.test.mjs:7`, ca "giá VND hiển thị theo vi-VN, không phần thập phân": `ERR_ASSERTION`, expected `/^35\.000 ₫$/`, actual `'36.000 ₫'`; sau đó `Process completed with exit code 1`; hai bước sau (**Test script cấu hình local**, **Build**) không chạy (0s). Hộp merge của PR hiển thị `CI / verify (pull_request)` ở trạng thái **Required** và đang failing, nút **Merge pull request** bị khóa |

Ghi chú và giới hạn của bằng chứng:

- Hộp merge của PR #5 ghi lý do chặn là "At least 1 approving review is required" **đồng thời** với `verify` Required đang đỏ. Chưa thử một PR đã có approve để chứng minh riêng check đỏ chặn một mình.
- Nguyên nhân thất bại được xác nhận từ log (ảnh chụp log, tìm `format-price`): đúng ca test web bị sửa cố ý. Trong run đó phần test API chạy 62/62 pass.
- PR #5 là PR thử nghiệm, đã đóng, không merge; không có code lỗi nào vào `main`.
- Branch protection quan sát được trên PR #5: check `verify` là Required và cần ít nhất 1 review approve. Các tùy chọn khác của rule (ví dụ bắt buộc nhánh up to date) chưa được xác nhận.
- Các run PR #2, #3, #4 và push `main` sau PR #2 cũng hiển thị xanh trong tab Actions (chưa lưu URL riêng).
