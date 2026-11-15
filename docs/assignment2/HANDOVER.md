# Bàn giao A2 — trạng thái theo bằng chứng

Cập nhật 15/11/2026. Bản tích hợp tài liệu tiếp nhận #3/#8/#14/#15/#17; xem [nguồn từng PR/SHA](DOCS_INTEGRATION.md). File có trong nhánh này không đồng nghĩa PR tích hợp đã merge hoặc toàn bộ AC được duyệt.

| Đầu ra | Trạng thái/evidence |
|---|---|
| Code, CI, image, production CD | ĐÃ CÓ: source `ce4faf64f394740108eb8911a1e3076728b85860`, [CI #53](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43682250369) verify/publish/deploy SUCCESS |
| API/Web digest và deployment IDs | ĐÃ CÓ: [hai JSON nguyên bản](testing/railway-production-2026-11-15/README.md) |
| Public frontend/API/health | HTTPS https://brewlite-production.up.railway.app; BFF /api/products và /api/health; NestJS/DB private theo cấu hình báo cáo |
| Migration/kho/cờ | Bootstrap đã thực hiện; helper giữ 2 đơn legacy; CHECKOUT_V2_ENABLED=1; không lặp cấp kho |
| Backup/restore thử | A báo hash khớp và restore+SQL migration trên DB cô lập đạt; report thô giữ máy A, không là rollback live |
| Demo thanh toán/hủy | A xác nhận trên bootstrap bebd2e2; thiếu mã đơn/video, không là full E2E ce4faf6 |
| Kiến trúc/ADR/deployment | Tích hợp trong nhánh này, chờ review cuối: [kiến trúc](../architecture/system-architecture.md), [deployment](DEPLOYMENT.md) |
| QA local/PWA/UI | Đã ghi theo image/SHA/lượt lịch sử: [PWA](PWA.md); không suy đã thử PWA HTTPS |
| Backlog/commit/DoD | [SPRINT_BACKLOG](SPRINT_BACKLOG.md), [Git](../guides/GIT_WORKFLOW.md), [DoD](TASK4_REPO_BACKLOG_DOD.md). Chưa có link board ngoài được xác minh; không kết luận không tồn tại |
| 59 AC | [Ma trận](../traceability-matrix.md) giữ audit 14/11 và cập nhật deployment riêng; lead vẫn phải ký theo nội dung, benchmark/fixture thiếu chưa đóng |
| Release/tag | CHƯA CHỐT: [release notes nháp](RELEASE_NOTES.md), tag phải trỏ SHA cuối sau merge |
| Người ngoài clone/chạy | CHƯA CÓ hồ sơ thực tế: [phiếu](OUTSIDER_RUN_CHECKLIST.md) |
| Review/Retro | KHUNG, chưa có biên bản thật: [REVIEW_RETRO_A2](REVIEW_RETRO_A2.md) |
| Báo cáo/demo nộp | Cần chốt báo cáo A2, video/demo theo lớp, URL/quyền và gói nộp từ SHA cuối |

Health chỉ kiểm tiến trình; catalog smoke kiểm đọc DB riêng. Mock payment không phải tiền thật. CI không tự chứng minh PG/browser test. Rollback production, DB restart, benchmark, full accessibility và mọi 59 AC không được ghi PASS từ CD xanh.
