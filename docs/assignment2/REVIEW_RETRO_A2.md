# Sprint Review và Retrospective — Assignment 2 (khung điền từ sự việc thật)

Cập nhật 15/11/2026 (B). **Đây là khung, chưa phải biên bản.** Chưa có buổi Review hoặc Retro A2 nào được ghi nhận trong repo.
Không ghi đã họp, đã demo, người tham gia hoặc feedback khi chưa xảy ra. Nếu lớp yêu cầu buổi trực tiếp, hình thức bất đồng bộ
phải theo hướng dẫn của lớp. Không dùng Review/Retro Sprint 3 của A1 thay cho tài liệu này.

## 1. Sprint Review (điền sau khi có buổi thật)

| Mục | Điền |
|---|---|
| Ngày, hình thức, người tham gia |  |
| Increment trình bày (SHA, URL) |  |
| Demo đã thực hiện (xem [HANDOVER](HANDOVER.md) #10) |  |
| Feedback nhận được và người đưa ra |  |
| Quyết định/backlog sau feedback |  |

## 2. Retrospective (điền sau khi có buổi thật)

| Nhóm | Ghi nhận (sự việc, ngày, bằng chứng) |
|---|---|
| Làm tốt, nên giữ |  |
| Chưa tốt |  |
| Việc cải thiện (việc / owner / hạn) |  |

## 3. Sự việc đã có bằng chứng trong repo (ứng viên cho Retro)

Các dòng dưới đây có PR hoặc commit thật. Nhóm quyết định dòng nào đưa vào Retro; B không tự gán là "làm tốt" hay "chưa tốt".

| Sự việc | Bằng chứng |
|---|---|
| Run CI đỏ có chủ đích và run xanh để chứng minh cổng chặn merge | [CI.md](CI.md); [run đỏ 43159409852](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43159409852) |
| UML Task 2 vẽ lại theo đề, sửa qua nhiều vòng review | PR #4; commit `docs(a2): vẽ lại UML Task 2 theo đề Assignment 2` |
| Review PR #7 nêu ba điểm (cổng Web không theo `PORT`, `getProduct` chỉ phía server, build arg thừa); E sửa hoặc ghi giới hạn | PR #7, [COMPOSE.md](COMPOSE.md) |
| Lỗi quyền ghi `.next/cache` khi chạy `USER node` phát hiện và sửa | PR #9, commit `fix(a2): allow node user to write Next.js cache` |
| Job GHCR được chuyển thành phụ thuộc `verify` thay cho workflow riêng | PR #12, commits `ci: gate GHCR publish behind verify`, `ci: remove standalone GHCR publish workflow` |
| Tích hợp checkout từ A1 sang A2 kèm QA riêng trên Windows | PR #11, [CHECKOUT_INTEGRATION.md](CHECKOUT_INTEGRATION.md), [CHECKOUT_WINDOWS_QA.md](CHECKOUT_WINDOWS_QA.md) |
| Bản rà của A phát hiện thiếu deploy bằng CI, benchmark và bộ bàn giao | [Closeout review 14/11](reviews/BrewLite_A2_Task4_5_Closeout_Review_2026-11-14.md) |

## 4. Snapshot backlog ngày 14/11 (không phải trạng thái hiện tại)

| Mã | Việc | Phụ trách đề xuất |
|---|---|---|
| A2-BL-01 | Deploy bằng CI secret, migration, smoke, rollback ([CD_DEPLOY_PLAN](CD_DEPLOY_PLAN.md)) | E, B |
| A2-BL-02 | Nâng Railway lên bản checkout Sprint 3; chuẩn bị bước cấp tồn kho phù hợp cho database đã có đơn | E, C, D |
| A2-BL-03 | Benchmark NFR-01 với warmup, mẫu theo endpoint, tách Nest/BFF/UI; chốt O-02 trước khi đo | C, A, E |
| A2-BL-04 | Fixture SRS còn thiếu: FAILED cho WALLET và CARD, kho 1 hai khách 1+1, DEMO10 tại 50k/300k, 81k → 8 điểm, timestamp bằng nhau | C, D |
| A2-BL-05 | Người ngoài nhóm chạy theo README ([phiếu](OUTSIDER_RUN_CHECKLIST.md)); demo/video | B, nhóm |
| A2-BL-06 | Review và merge PR #3, #8, #14, #15 | Reviewer theo TEAM_PLAN |
| A2-BL-07 | Lead xác nhận các ô "CHỜ" trong [ma trận](../traceability-matrix.md) | Từng lead |

Cập nhật 15/11: A2-BL-01/02 đã có [CD #53 và bootstrap](testing/railway-production-2026-11-15/README.md), rollback live vẫn chưa chạy. A2-BL-06 được gom trong nhánh tích hợp; chỉ đóng sau review/merge. Dùng [SPRINT_BACKLOG](SPRINT_BACKLOG.md) làm trạng thái hiện tại. Những dòng sự việc này không tự tạo một buổi Review/Retro.
