# Tài liệu BrewLite — Assignment 2

Repository hiện hành: https://github.com/giabaot400-boop/BrewLite-Assignment2.
A1 và A2 có hai bộ source riêng theo yêu cầu giảng viên do PO thông báo ngày
10/11/2026. Xem [nguồn kế thừa và quy tắc đồng bộ](assignment2/SOURCE_PROVENANCE.md).

## Tạo phẩm A2

- [Task 1–2](assignment2/README.md): bối cảnh, SRS, UC-09, UML và truy vết.
- [Task 3.1 — đóng góp frontend/BFF/PWA](architecture/frontend-bff-pwa.md): chưa thay kiến trúc tổng thể/ADR hoặc Task 3.2 deployment.
- [Kế hoạch Task 1–5](assignment2/TEAM_PLAN.md): đầu ra, lead/reviewer và cổng nghiệm thu.
- [PWA](assignment2/PWA.md): code kế thừa, cách kiểm tra và giới hạn bằng chứng local.
- [Ma trận truy vết](traceability-matrix.md): code/test chưa đối chiếu đủ bằng chứng vẫn ghi CHỜ.
- [Quy trình Git A2](GIT_WORKFLOW.md) và [README chạy source A2](../README.md).

## Tài liệu tham khảo từ A1

Các hồ sơ `SPRINT1_*`, `SPRINT2_*`, `SPRINT3_B_UI.md`, `Testing/`,
`sprint3/`, sơ đồ `diagrams/sprint1/` và `diagrams/sprint3/` được giữ từ
source kế thừa để tra chính sách và lịch sử. Chúng chưa là bằng chứng chạy
trên repo A2 hoặc nghiệm thu Sprint/Task A2. Không sửa nội dung lịch sử để
đổi tên thành báo cáo A2. Mục lục [sơ đồ Sprint 1](diagrams/README.md) cũng
thuộc hồ sơ A1, không phải danh mục Task 2 hiện hành.

Master A2 giữ **14 UC = UC-01 đến UC-13 và S2-UC-LOGOUT**; Task 1.3 chỉ đặc tả
UC-09. Activity/sequence tạo đơn, hủy và hết hạn là ngữ cảnh hỗ trợ. Nguồn và
hình hiện hành được liệt kê trong [bảng tạo phẩm](assignment2/README.md).

Mã nguồn A2 ở `apps/web` và `apps/api`; tài liệu hiện hành tham chiếu đường dẫn
này. Đường dẫn cũ trong hồ sơ A1 giữ ý nghĩa tại thời điểm ghi nhận. Những PR
kế thừa được dẫn về repo A1; PR mới của A2 có lịch sử review riêng.
