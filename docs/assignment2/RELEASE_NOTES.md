# BrewLite Assignment 2 — release notes nháp

Chưa tạo release/tag trong lượt tích hợp tài liệu này. Tag đề xuất `a2-v1.0.0`; nhóm quyết định và trỏ đúng SHA chốt sau merge, không điền trước SHA chưa tồn tại.

## Mốc production đã kiểm

Source `ce4faf64f394740108eb8911a1e3076728b85860`; [CI #53](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43682250369) verify/publish/deploy/smoke SUCCESS. [Digest và deployment IDs](testing/railway-production-2026-11-15/README.md) là image đã chạy, khác SHA của commit tài liệu bổ sung sau đó. Nếu phát hành source mới thì giữ riêng bằng chứng triển khai ce4faf6; không đổi nhãn thành bản mới đã được thử.

## Chức năng và tài liệu

- Menu, chi tiết, size/topping, giỏ, xác thực, tạo đơn idempotent, payment WALLET/CARD mô phỏng, lịch sử, hủy/hoàn tiền mô phỏng, expiry, stock và points.
- Promotion DEMO10 có trong code/demo seed; stock initializer Railway không tự seed promotion. Chưa có bằng chứng kiểm khuyến mãi trên production trong lượt này.
- PWA tài nguyên public, không tự gửi lại giao dịch offline; QA local/responsive/keyboard giữ đúng source/image từng lượt.
- CI, pinned GHCR images, API pre-deploy migration, API trước Web, smoke so SHA và failure stop; rollback có hướng dẫn có điều kiện, không tự reverse DB.
- Kiến trúc, deployment source/SVG, backlog, truy vết, handover và khung nghiệm thu đã gom trong nhánh tài liệu này.

## Giới hạn

Mock không tích hợp cổng tiền thật. CD smoke chỉ GET; demo mutation A xác nhận trên bebd2e2 không có mã đơn/video/raw SQL. Restore thử khác rollback production. Chưa hoàn tất benchmark NFR-01, fixture/lead sign-off 59 AC, người ngoài clone/chạy, Review/Retro thực tế hoặc PWA install/offline trên HTTPS. [Checklist](DELIVERY_CHECKLIST.md) là nguồn việc còn mở.

Chạy local/test/build: [README](../../README.md), [tests](../../tests/README.md), [Compose](COMPOSE.md). Deploy/rollback: [hướng dẫn chuẩn](../deployment.md). Không công bố bản phát hành khi tag/notes/đối chiếu ZIP còn chưa thực hiện.
