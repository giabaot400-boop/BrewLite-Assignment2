# Runbook Railway — phát hành và xử lý sự cố

Cập nhật 15/11/2026, sau CD #53. Hướng dẫn chuẩn: [docs/deployment.md](../deployment.md). [Hiện trạng/bằng chứng](testing/railway-production-2026-11-15/README.md) giữ source, digest, deployment IDs và pin trước rollout.

## Trước một release mới

- Chọn source main đã review; kiểm CI, backup và tương thích schema. Không dùng lại digest 0bea2e2/4c177bf chỉ vì nằm trong hồ sơ lịch sử.
- Giữ Web CHECKOUT_V2_ENABLED=1 sau khi chuyển storage v2; không tắt cờ để rollback client storage.
- Không public DB/API, không sao chép DATABASE_URL/token ra chat/log. Chỉ deploy khi không có release khác đang thao tác cùng production.
- Chạy workflow_dispatch trên main với deploy=true; RAILWAY_DEPLOY_READY=true chỉ khi bước chuẩn bị thực sự hoàn tất. Không rerun lượt cũ để nhận code mới.

## Migration và kho

API image chạy pre-deploy `npm exec --workspace apps/api -- prisma migrate deploy`; Web không migration. Migration thứ ba đặt kho mới bằng 0 và giữ đơn cũ policy1 read-only. Không migrate reset hoặc seed lại production để sửa lỗi.

Production hiện tại đã qua bước khởi tạo kho một lần: helper báo 4 sản phẩm × 10 và giữ 2 đơn legacy, theo output A cung cấp. Sau demo, số tồn có thể đã đổi; không ghi 10 là tồn hiện tại.

Không dùng SQL `UPDATE ... WHERE stock=0 AND reserved_stock=0` để cấp kho: sản phẩm đã bán hết cũng có thể khớp điều kiện. Helper `stock:init:railway` chỉ dành cho bootstrap đúng điều kiện, có plan/execute guard, transaction và khóa. DB đã dùng phải từ chối cấp lại. Xem hướng dẫn gốc cho database mới, không chạy lại ở deployment này.

## Khi pipeline hoặc ứng dụng lỗi

| Tình huống | Xử lý |
|---|---|
| Preflight lỗi | Dừng, đọc thông báo an toàn/context; chưa mutation thì không cần rollback chỉ vì job đỏ |
| API migration/deploy lỗi | Dừng trước Web; kiểm log và pin/deployment đã ghi. Chỉ phục hồi image khi xác định schema tương thích |
| API SUCCESS, Web lỗi | Giữ API, kiểm lỗi Web và cân nhắc digest Web trước đó từ artifact; không reverse migration tự động |
| Smoke sai SHA hoặc health quá hạn | Xác minh deployment identity/rollout; không đổi expected SHA thành bản đang lỗi để làm xanh |
| Cần quay về ứng dụng cũ | Kiểm schema trước. Source 0bea2e2 không biết orders.subtotal NOT NULL, có thể đọc nhưng tạo đơn lỗi sau migration thứ ba |
| Cần phục hồi dữ liệu | Cần người duyệt, backup phù hợp và quyết định về dữ liệu sau thời điểm backup; không restore đè production theo lệnh tự động |

Backup có hash đối chiếu và restore+SQL migration thử trên PostgreSQL 17 cô lập đã đạt theo report A. Chưa thực hiện rollback/restore production, chưa kiểm restart DB ở lượt CD. Không ghi “rollback đã kiểm” từ kết quả restore thử hoặc từ việc có hướng dẫn.
