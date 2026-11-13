# Task 4 — Cấu trúc repo, backlog, Definition of Done

## Cấu trúc repo

| Đường dẫn | Nội dung |
|---|---|
| `apps/web` | Next.js (UI + BFF), test `*.test.mjs` cạnh code |
| `apps/api` | NestJS + Prisma, test `*.spec.ts` / `*.integration.*` |
| `docs/` | Yêu cầu, UML, kiến trúc, hướng dẫn, kế hoạch A2 |
| `scripts/` | Thiết lập môi trường (`setup-env`) và test của nó |
| `.github/` | Workflow CI, mẫu PR |
| `reference/a1`, `docs/reference/a1` | Tài liệu tham khảo cố định từ A1 |

## Backlog Task 4

| ID | Việc | Trạng thái |
|---|---|---|
| T4-1 | Workflow CI install→lint→typecheck→test→build ([CI.md](CI.md)) | Xong; đã chạy xanh trên `main` (run 43013162855) |
| T4-2 | Script `npm test` gốc + api | Xong (kiểm local) |
| T4-3 | Test sản phẩm/menu (web + api) | Xong (kiểm local) |
| T4-4 | Mẫu PR có DoD | Xong |
| T4-5 | Bật branch protection yêu cầu check `verify` | Đã bật (quan sát trên PR #5: `verify` Required, cần 1 approving review); các tùy chọn khác chưa xác nhận |
| T4-6 | Chạy CI xanh + CI đỏ có chủ đích, ghi URL vào CI.md | Xong; run xanh 43013162855, run đỏ 43159409852 (PR #5, không merge); nguyên nhân lỗi xác nhận từ log (`format-price.test.mjs:7`) |
| T4-7 | ESLint cho `apps/api` | Backlog |
| T4-8 | Chạy test tích hợp API với PostgreSQL trong CI | Backlog |

## Definition of Done (một PR được merge khi)

1. Có ticket/phạm vi rõ; reviewer **khác** tác giả đã duyệt.
2. Check CI `verify` xanh trên đúng commit cuối.
3. Không có secret, `.env`, `node_modules`, `.next`, `dist`, Prisma client sinh ra.
4. Tài liệu liên quan được cập nhật; liên kết không gãy.
5. Không ghi PASS cho kết quả chưa chạy; bằng chứng nêu repo, SHA, môi trường, lệnh, mong đợi, thực tế.
6. Thay đổi hành vi có test tương ứng hoặc ghi rõ vì sao chưa có.
