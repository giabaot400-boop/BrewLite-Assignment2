# Product Backlog và hai Sprint Assignment 2

Snapshot ngày 15/11/2026 để theo dõi bàn giao, không tạo lại lịch sử họp hoặc đổi nhãn ba Sprint A1. Hai nhóm Sprint dưới đây theo Task 4 và Task 5 của đề; việc kế thừa có nguồn riêng. Trạng thái mô tả tạo phẩm/evidence, không thay nghiệm thu Task 1→5.

## Sprint 1 — nền kỹ thuật và MVP menu (Task 4)

| ID | Ưu tiên | Đầu ra | Lead | Trạng thái/evidence |
|---|---|---|---|---|
| A2-S1-01 | Must | Monorepo apps/web, apps/api, docs; env mẫu/setup/README | B | Có trên main `4c177bf`; nguồn kế thừa xem SOURCE_PROVENANCE.md |
| A2-S1-02 | Must | Branch/PR, commit convention, DoD và Product Backlog | B | Git workflow/DoD có; bản cập nhật này bổ sung convention/backlog, chờ review |
| A2-S1-03 | Must | Task 1–2 được version hóa, source/render và truy vết | A/B | Có tài liệu trên main; lead/reviewer chốt baseline và các điểm mở |
| A2-S1-04 | Must | Kiến trúc/ADR và deployment phù hợp code/hạ tầng | D/E | Tích hợp từ #8/#3 trong nhánh tài liệu này, chờ review cuối |
| A2-S1-05 | Must | GET products/detail, menu/loading/empty/error, seed | A/C | Implementation/test có trên main; nối evidence FR-01/02 |
| A2-S1-06 | Must | CI install/lint/unit/build và chặn merge khi lỗi | B | CI.md có xanh/đỏ; main required verify; không suy ra PostgreSQL chạy trong CI |

## Sprint 2 — checkout, production và delivery (Task 5)

| ID | Ưu tiên | Đầu ra | Lead | Trạng thái/evidence |
|---|---|---|---|---|
| A2-S2-01 | Must | Checkout S3: auth/cart/order/payment/history/validation | A/C/D | Đã tích hợp #11, main `4c177bf`; không tự ký toàn bộ AC |
| A2-S2-02 | Must | Unit/integration/E2E, migration/seed/Compose/health | D/C, A hỗ trợ | Hồ sơ chuẩn bị và Windows có; PWA/UI #14 được tích hợp theo lịch sử, tests/ đã có đầu mối; chờ review cuối |
| A2-S2-03 | Must | Nâng Railway đúng source, dữ liệu/stock/cờ v2 | E, C/D hỗ trợ | Đã bootstrap bebd2e2 và CD ce4faf6; [evidence](testing/railway-production-2026-11-15/README.md), stock không cấp lại |
| A2-S2-04 | Must | CD bằng secret CI, migration, health/smoke/failure/rollback | E/B | CD #53 đã SUCCESS, smoke 8/8; rollback production chưa thực hiện |
| A2-S2-05 | Must | Benchmark/fixture SRS và ma trận AC có evidence | C/D, B gom | Có nhiều log A2; các assertion còn thiếu tiếp tục để mở |
| A2-S2-06 | Must | URL HTTPS/API/health, secret/DB private, release/notes/README | E/B | HTTPS/BFF health và catalog đã smoke qua CD #53; release/tag cuối chưa xác nhận |
| A2-S2-07 | Must | Demo, Review/Retro, người ngoài clone/chạy, gói nộp | B/nhóm, A phối hợp | Cần hoạt động và evidence thật; không dùng demo/Retro A1 đổi nhãn |
| A2-S2-08 | Should | Hoàn thiện kiểm bàn phím/focus và giới hạn accessibility | A/B | PR14 ghi các ca đã thử và thiếu; chốt Should theo review |

## Cách cập nhật

Mỗi item giữ ID, lead, trạng thái và link PR/SHA/run. Bổ sung ngày/kết quả thật khi thay đổi; không tự ghi XONG khi chỉ có code hoặc kế hoạch. Nếu nhóm có board ngoài, thêm link và map các ID này; Product Backlog dạng file này đã có lịch sử PR/Git để reviewer tra cứu.

- [DoD](TASK4_REPO_BACKLOG_DOD.md)
- [Kế hoạch/lead/cổng nghiệm thu](TEAM_PLAN.md)
- [Ma trận yêu cầu](../traceability-matrix.md)
- [Checklist delivery](DELIVERY_CHECKLIST.md)
