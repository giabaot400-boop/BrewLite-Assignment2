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

Workflow chỉ *báo* đỏ/xanh. Để *chặn* merge, admin repo phải bật:
Settings → Branches → rule cho `main` → **Require status checks to pass before merging** → chọn check `verify`; bật **Require a pull request before merging** và **Require branches to be up to date**.

## Phạm vi và giới hạn

- Chưa chạy: test tích hợp API (`*.integration.*`) cần PostgreSQL, không nằm trong CI.
- `apps/api` chưa có ESLint nên lint chỉ phủ web (backlog).
- Test sản phẩm/menu: `apps/web/src/features/products/*.test.mjs`, `apps/api/src/products/products-prisma.service.spec.ts`.

## Bằng chứng CI (điền sau khi chạy trên GitHub)

| Trường hợp | PR / commit SHA | URL run | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| Thành công | _chưa có_ | _chưa có_ | `verify` xanh, merge được | _chưa chạy_ |
| Thất bại có chủ đích (vd. sửa 1 test sai trên nhánh thử, không merge) | _chưa có_ | _chưa có_ | `verify` đỏ, nút merge bị chặn | _chưa chạy_ |

Không ghi PASS cho dòng nào chưa có URL run thật.
