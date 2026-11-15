# Checklist chốt Assignment 2

Cập nhật 15/11/2026. PO xác nhận hạn nộp hết ngày 15/11; đối chiếu LMS khi nộp và không tự điền giờ hệ thống khác thông báo. Đây là checklist còn mở, không là biên bản nghiệm thu; CD đã có bằng chứng riêng.

| Đầu ra | Trạng thái cần chốt | Người phối hợp | Bằng chứng để đóng |
|---|---|---|---|
| Task 1–2/baseline | Reviewer xác nhận điểm mở | A/B/D | PR/SHA, scope/BR và source/SVG |
| Kiến trúc | Đã gom #8 vào nhánh tích hợp, chờ review cuối | D/reviewer | Nội dung/ADR khớp S3, CI cuối |
| Deployment | Đã cập nhật theo CD #53, chờ review source/SVG | E/C | Hạ tầng, digest/source và cách phát hành thật |
| QA local/PWA/UI | Đã gom #14 và giữ giới hạn QA, chờ review cuối | A/B | Giữ image/fingerprint, không đổi lịch sử |
| Railway nền | Đã gom #15 như báo cáo lịch sử 14/11 | E/B/C | Giới hạn bản `0bea2e2`, API redeploy riêng với DB |
| Railway S3 | Đã bootstrap và CD #53; xem evidence Railway 15/11 | E, A/C/D hỗ trợ | Migrate/stock/flag, IDs/digests và workflow HTTPS |
| CD/smoke | CD #53 SUCCESS và smoke 8/8; rollback production chưa chạy | E/B | Run deploy bằng secret CI, health/smoke, failure/rollback |
| Tests/root docs/backlog/convention | Có trên main từ #16/#18; nhánh này hợp nhất tài liệu | A/B | Tests entrypoints, hướng dẫn/DoD và check phù hợp |
| 59 AC/benchmark/fixture thiếu | Chưa đóng toàn bộ | B/C/D/A | Path/SHA/assertion/expected-actual, không sửa tiêu chí cho khớp test |
| Release/tag/notes | Chưa công bố bản chốt | B/E | Tag đúng SHA, nội dung và giới hạn release |
| Người ngoài clone/chạy | Chưa có hồ sơ trong nguồn rà | B tổ chức | Người/máy/ngày/lệnh/kết quả và vấn đề gặp phải |
| Demo hoặc video | Cần ghi nhận A2 | Nhóm | Luồng menu → xác nhận → payment/history trên đúng bản |
| Sprint Review/Retro | Cần hoạt động thật | Nhóm | Ngày, người tham gia, feedback, điều làm được/chưa được/action |
| Báo cáo A2 | Chuẩn bị song song | A/nhóm | Đủ Task 1–5, nguồn hình và evidence, giới hạn thật |
| Nộp bài/quyền truy cập | PO thực hiện cuối | A | Repo/URL/tệp/link xem được bằng quyền người chấm |

Ghi kết quả sau khi thực hiện. Nếu một mục chưa đạt, mô tả ảnh hưởng và quyết định của nhóm; không ký PASS từ kế hoạch hoặc CI chỉ build image. [Backlog](SPRINT_BACKLOG.md) giữ hai Sprint; [deployment](../deployment.md) có hướng dẫn release/rollback.
