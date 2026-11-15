# Railway production — bằng chứng ngày 15/11/2026

## CD thực tế

[CI #53](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43682250369), workflow_dispatch trên main `ce4faf64f394740108eb8911a1e3076728b85860`, cả verify/publish-ghcr/deploy-railway-and-smoke SUCCESS. Run bắt đầu 12:42:49 ngày 15/11/2026 (UTC+7). Script deploy bắt đầu 12:44:41, kết thúc 12:46:29; smoke kết thúc 12:46:30. Thời gian lấy từ artifact UTC, đổi UTC+7; không phải thời gian thao tác thủ công.

Hai JSON được tải nguyên byte từ artifact `railway-release-ce4faf64f394740108eb8911a1e3076728b85860-1`, artifact ID `14148826704`. ZIP nguồn có digest `sha256:cc19559c94334d4bcbdc880ce8dfb2a0d70145fb6ec7bb0d62d398c3a1220e8f`; không lưu signed download URL. Artifact GitHub hết hạn 22/11/2026; bản JSON trong repo giữ bằng chứng.

- [railway-deploy.json](railway-deploy.json): API SUCCESS trước Web, ghi service/deployment ID, digest mới và pin/deployment trước đó. Không có token/variables/payload database.
- [smoke.json](smoke.json): 8/8 GET-only PASS, expected/observed Web SHA đều `ce4faf64f394740108eb8911a1e3076728b85860`, health thành công ở lượt đầu; catalog kiểm đọc DB. Đây không phải test auth/order/payment.

| Service | Digest image được CI triển khai | Deployment ID |
|---|---|---|
| API | `sha256:b0769ed1a2696795c453dfaa85d467ce24cc8d9bf64cd37f465796a3109dc861` | `202eb2e2-f6d9-4d77-91b5-d608d64d8780` |
| Web | `sha256:88ec02b921b01277be14e5e120da1ee25fa5bfe5e6c2629f9dba8effd09aa9eb` | `f0a97554-4745-45e5-be8f-de18e7606701` |

SHA được Web trả từ build; không dùng nó để khẳng định đã đọc SHA nội bộ API. Bằng chứng API là digest/pin và deployment identity trong artifact, không phải endpoint API build identity.

## Chuẩn bị và demo thủ công — nguồn A cung cấp

Các mục sau được tổng hợp từ output/ảnh/xác nhận A gửi, không là log automation kèm theo:

- PostgreSQL 17.12. A tạo pg_dump trước nâng schema, tải về máy riêng và đối chiếu SHA256 `C79E2AE5F2616CF710EB1C02F6B3D7272A7CBA02549FB12BF134E9227CAEC8A5`. Dump không đưa vào Git.
- Restore + chạy SQL migration thứ ba trên container PostgreSQL 17 cô lập đã báo RESTORE_AND_MIGRATION_CHECK_PASSED, container đã dọn. Report riêng trên máy A: `BrewLite_A2_Restore_Result/20261115_105534.txt`. Script kiểm dữ liệu cũ qua digest và đơn legacy; report thô chưa đính kèm repo. Đây không phải restore đè production hoặc rollback live.
- API bootstrap image source bebd2e2 đã chạy pre-deploy migration. Helper stock plan và execute trả products=4, stockPerProduct=10, preservedLegacyOrders=2; execute mode initialized. Đây là cấp kho lần đầu, không phải số tồn hiện tại sau demo.
- Web bootstrap source bebd2e2, CHECKOUT_V2_ENABLED=1; smoke trên máy A 8/8, có so SHA. Sau đó A xác nhận tạo/thanh toán một đơn (PAID, giỏ trống) và hủy một đơn khác (CANCELLED). Chưa lưu mã đơn, raw Network/SQL hoặc video; không khẳng định replay/loyalty/refund từ xác nhận này.
- Sau đó CD #53 triển khai source ce4faf6 và có hai JSON nguyên bản ở trên. Không đổi nhãn demo bebd2e2 thành demo thủ công ce4faf6.

## Giới hạn còn mở

Chưa có rollback production, restart/redeploy PostgreSQL được kiểm chứng trong lượt này, benchmark theo NFR-01, PWA install/offline trên HTTPS, full acceptance sign-off hoặc lượt clone/chạy của người ngoài. Không suy CD xanh thành hoàn tất toàn bộ 59 AC, secret audit toàn hệ thống hoặc high availability. Không lặp stock initializer trên DB đã sử dụng.
