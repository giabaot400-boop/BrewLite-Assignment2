# Bàn giao Assignment 2 — trạng thái các đầu ra (Task 5.4)

Cập nhật 15/11/2026 (B). Nguồn trạng thái: [bản rà Task 4–5 của A, 14/11](reviews/BrewLite_A2_Task4_5_Closeout_Review_2026-11-14.md) và main `4c177bf`.
Bảng này chỉ ghi điều có bằng chứng trong repo hoặc do người phụ trách báo cáo. **Ô "Link/bằng chứng" trống nghĩa là chưa có**, không phải đã làm.
Khi một mục xong, người phụ trách điền link thật (PR, run, URL, SHA) và ngày; B không tự điền thay.

## Đầu ra theo đề

| # | Đầu ra | Trạng thái | Phụ trách | Link/bằng chứng |
|---|---|---|---|---|
| 1 | Mã nguồn và CI trên main | CÓ | B, E | main `4c177bf`; [CI](CI.md); [run xanh 43549055750](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43549055750) |
| 2 | Image Web/API trên GHCR, tag theo SHA | CÓ (theo log CI) | E | Digest ghi trong [run 43549055750](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43549055750); xem [RELEASE_NOTES](RELEASE_NOTES.md) |
| 3 | Deploy production bằng secret của CI, migration, smoke, rollback | CHƯA CÓ | E, B | Kế hoạch: [CD_DEPLOY_PLAN](CD_DEPLOY_PLAN.md) |
| 4 | URL frontend HTTPS bản Sprint 3 (checkout) | CHƯA CÓ | E, A kiểm | URL nền: https://brewlite-production.up.railway.app, bản đang báo cáo là `0bea2e2`, trước checkout |
| 5 | URL API/health cho người chấm | CHƯA CHỐT | E, C, B | Product BFF `/api/products` công khai; API/DB private theo báo cáo E; cần thống nhất cách kiểm health |
| 6 | Release/tag/notes | NHÁP | B, E | [RELEASE_NOTES](RELEASE_NOTES.md); chưa có release object hoặc tag trên GitHub |
| 7 | README local/test/build | CÓ | B, A | [README](../../README.md); cần đồng bộ các câu trạng thái cũ sau merge |
| 8 | README deploy/rollback | CHƯA CÓ | E, B | Nội dung ở [PR #3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3) (chưa merge); cần đường dẫn từ README |
| 9 | Người ngoài nhóm clone và chạy theo hướng dẫn | CHƯA CÓ | B tổ chức | Mẫu ghi nhận: [OUTSIDER_RUN_CHECKLIST](OUTSIDER_RUN_CHECKLIST.md) |
| 10 | Demo/video | CHƯA CÓ | Nhóm, A | Demo A1 không thay thế demo A2 |
| 11 | Sprint Review và Retrospective A2 | KHUNG | B, nhóm | [REVIEW_RETRO_A2](REVIEW_RETRO_A2.md); chưa có biên bản thật |
| 12 | Ma trận truy vết 59 AC | ĐÃ ĐIỀN MỨC CHỨNG CỨ | B, từng lead xác nhận | [traceability-matrix](../traceability-matrix.md); cột "Lead xác nhận" đang CHỜ |
| 13 | Backlog/board hai Sprint, quy ước commit | MỘT PHẦN | B | [TASK4 mục Backlog](TASK4_REPO_BACKLOG_DOD.md#backlog-và-board-hai-sprint-cập-nhật-15112026-b); [quy ước commit](../guides/GIT_WORKFLOW.md#quy-ước-thông-điệp-commit); link board thật: CHƯA CÓ |
| 14 | Kiến trúc tổng thể/ADR (Task 3.1) và deployment (3.2) | ĐANG REVIEW | D, E | [PR #8](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/8), [PR #3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3), [PR #15](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/15): chưa merge |
| 15 | Hồ sơ PWA/UI thủ công | ĐANG REVIEW | A | [PR #14](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/14), chưa merge |

## Giới hạn cần giữ khi trình bày

- `/health` chỉ kiểm tiến trình, không kiểm database; không gọi là readiness sâu.
- Thanh toán là mô phỏng; không có cổng tiền thật.
- CI không chạy PostgreSQL hoặc browser; bằng chứng đó nằm ở các báo cáo local riêng và không cộng thành một tổng PASS.
- Railway đang báo cáo chạy source `0bea2e2`, trước checkout Sprint 3. Không gán kết quả QA S3 cho bản đó.
- Không suy "chưa thấy" thành "chưa từng làm" hoặc "lỗi ứng dụng". Mục thiếu chỉ là khoảng trống hồ sơ hoặc kiểm chứng.
