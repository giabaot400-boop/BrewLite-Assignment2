# Tài liệu BrewLite — Assignment 2

Repository hiện hành: https://github.com/giabaot400-boop/BrewLite-Assignment2.
A1 và A2 có hai source riêng theo yêu cầu giảng viên do PO thông báo ngày
10/11/2026. [Nguồn kế thừa](assignment2/SOURCE_PROVENANCE.md) ghi commit, kiểm tra
local và giới hạn bằng chứng; các PR A1 được dẫn đúng repo nguồn.

## Tạo phẩm A2

| Nhóm | Tài liệu |
|---|---|
| Task 1 | [Bối cảnh](requirements/context-and-scope.md), [SRS](requirements/srs.md), [UC-09](requirements/use-case-checkout.md), [ngữ cảnh hỗ trợ](requirements/checkout-supporting-flows.md) |
| Task 2 | [Danh mục UML](diagrams/README.md): use case, activity, sequence và class, kèm nguồn/SVG |
| Task 3 | [Kiến trúc frontend/BFF/PWA](architecture/frontend-bff-pwa.md); phần tổng thể/module/ADR và deployment còn phải hoàn thiện |
| Kế hoạch Task 1–5 | [Phân công/cổng nghiệm thu](assignment2/TEAM_PLAN.md), [contract A2](assignment2/CONTRACTS.md) |
| PWA | [Hướng dẫn và kết quả theo môi trường](assignment2/PWA.md) |
| CI và DoD | [CI](assignment2/CI.md), [Cấu trúc repo/backlog/DoD](assignment2/TASK4_REPO_BACKLOG_DOD.md) |
| Truy vết | [Ma trận FR/NFR→thiết kế→code/test](traceability-matrix.md) |
| Kỹ thuật và chạy source | [API sản phẩm](guides/API_CONTRACT.md), [UI dùng chung](guides/UI_SHARED_COMPONENTS.md), [Git A2](guides/GIT_WORKFLOW.md), [README gốc](../README.md) |

## Tham khảo có giới hạn

[Ba bản tham khảo A1](reference/a1/README.md) chỉ gồm contract checkout, thiết kế
nghiệp vụ và mô tả UI đơn hàng được source A2 kế thừa. Chúng có nguồn cố định,
không phải Sprint/Review/Retro hoặc nghiệm thu A2. Không giữ toàn bộ báo cáo,
checklist, ảnh kiểm thử và bộ sơ đồ Sprint 1–3 A1 trong cây A2 hiện hành.
Hồ sơ gốc tiếp tục ở [repo A1](https://github.com/giabaot400-boop/BrewLite).

A2 giữ 14 UC = UC-01…UC-13 và S2-UC-LOGOUT; Task 1.3 chỉ đặc tả UC-09. Các AC,
chính sách và trạng thái kiểm thử không đổi vì lượt sắp xếp tài liệu này.
