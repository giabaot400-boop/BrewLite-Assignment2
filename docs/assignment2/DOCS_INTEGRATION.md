# Nguồn và phạm vi tích hợp tài liệu A2

Base main `ce4faf64f394740108eb8911a1e3076728b85860`; nhánh mới docs/a2-final-closeout. A tiếp quản cập nhật theo yêu cầu chốt gói ngày 15/11. Đây là tích hợp tài liệu, không tự nhận các PR nguồn đã merge, không đổi người chạy bằng chứng hoặc thay reviewer sign-off.

| PR nguồn | Tác giả/đóng góp | Head tiếp nhận |
|---|---|---|
| [#3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3) | E: deployment, PlantUML/SVG | eb8925f184ce82dfb73c323401de2e2a8e8aa27b |
| [#8](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/8) | D: kiến trúc và 5 ADR | 322478ebb268a1444dadb815f0bbf83498ede3ad |
| [#14](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/14) | A: PWA, responsive/keyboard local | 6830a9102656caaa001f71cc27c9944405a6c421 |
| [#15](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/15) | E: Railway 14/11, source 0bea2e2 | 700900965dfa6127e921ddaa0c48a2a7c52399be |
| [#17](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/17) | B: ma trận audit, handover/release/runbook/checklist | 878d0017b83e7d0f4995a9285c329abebbe593b9 |

Chọn riêng diff tài liệu của các PR; không merge mù nhánh cũ làm thay đổi source/config ứng dụng. Những phần trùng main được hợp nhất, không tạo hai quy ước commit/backlog cạnh tranh nhau.

## Hiệu đính tích hợp

- Giữ hồ sơ E ngày 14/11 và audit 59 AC ngày 14/11 đúng mốc lịch sử. Deployment cũ kèm source/SVG lưu riêng; bản hiện tại cập nhật CD #53, Web health /api/health, volume gCFY và cách phát hành CI.
- Đưa hai JSON nguyên bản của CD #53 vào repo, kèm digest ZIP nguồn và giới hạn. Restore/demo A được đánh dấu xác nhận thủ công, không có report/mã đơn/video mới để bịa thêm.
- Bỏ hướng dẫn SQL cấp kho có thể chạy lặp; trỏ helper có guard và ghi kho đã được cấp. Không seed promotion thay người vận hành.
- Dẫn canonical docs/deployment.md; cập nhật handover/backlog/checklist/release draft. Giữ các mục chưa có evidence mở.

Sau khi PR tích hợp được review/merge, chủ repo có thể đóng các PR nguồn như superseded và dẫn SHA tích hợp, thay vì merge lại nội dung cũ. Không đóng PR nguồn trước khi bản tích hợp có trên main. Không tự tạo tag/release, ký nghiệm thu, biên bản hay xóa Postgres 18 trong lượt sửa này.
