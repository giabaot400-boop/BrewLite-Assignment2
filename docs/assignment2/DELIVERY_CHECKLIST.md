# Checklist chốt Assignment 2

Cập nhật 15/11/2026. PO xác nhận hạn nộp hết ngày 15/11; đối chiếu LMS khi nộp và không tự điền giờ hệ thống khác thông báo. Đây là checklist còn mở, không là biên bản nghiệm thu hoặc kết quả deploy.

| Đầu ra | Trạng thái cần chốt | Người phối hợp | Bằng chứng để đóng |
|---|---|---|---|
| Task 1–2/baseline | Reviewer xác nhận điểm mở | A/B/D | PR/SHA, scope/BR và source/SVG |
| Kiến trúc | Review #8 bản mới rồi merge | D/reviewer | Nội dung/ADR khớp S3, CI cuối |
| Deployment | Đồng bộ trạng thái và sơ đồ #3 | E/C | Hạ tầng, digest/source và cách phát hành thật |
| QA local/PWA/UI | Review #14 | A/B | Giữ image/fingerprint, không đổi lịch sử |
| Railway nền | Review #15 | E/B/C | Giới hạn bản `0bea2e2`, API redeploy riêng với DB |
| Railway S3 | Chưa có evidence trong nguồn đối chiếu | E, A/C/D hỗ trợ | Migrate/stock/flag, IDs/digests và workflow HTTPS |
| CD/smoke | Code mới cần review và run thật | E/B | Run deploy bằng secret CI, health/smoke, failure/rollback |
| Tests/root docs/backlog/convention | Bản sửa này, chờ review | A/B | Tests entrypoints, hướng dẫn/DoD và check phù hợp |
| 59 AC/benchmark/fixture thiếu | Chưa đóng toàn bộ | B/C/D/A | Path/SHA/assertion/expected-actual, không sửa tiêu chí cho khớp test |
| Release/tag/notes | Chưa công bố bản chốt | B/E | Tag đúng SHA, nội dung và giới hạn release |
| Người ngoài clone/chạy | Chưa có hồ sơ trong nguồn rà | B tổ chức | Người/máy/ngày/lệnh/kết quả và vấn đề gặp phải |
| Demo hoặc video | Cần ghi nhận A2 | Nhóm | Luồng menu → xác nhận → payment/history trên đúng bản |
| Sprint Review/Retro | Cần hoạt động thật | Nhóm | Ngày, người tham gia, feedback, điều làm được/chưa được/action |
| Báo cáo A2 | Chuẩn bị song song | A/nhóm | Đủ Task 1–5, nguồn hình và evidence, giới hạn thật |
| Nộp bài/quyền truy cập | PO thực hiện cuối | A | Repo/URL/tệp/link xem được bằng quyền người chấm |

Ghi kết quả sau khi thực hiện. Nếu một mục chưa đạt, mô tả ảnh hưởng và quyết định của nhóm; không ký PASS từ kế hoạch hoặc CI chỉ build image. [Backlog](SPRINT_BACKLOG.md) giữ hai Sprint; [deployment](../deployment.md) có hướng dẫn release/rollback.
