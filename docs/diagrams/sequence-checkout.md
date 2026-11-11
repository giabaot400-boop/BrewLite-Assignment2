# Task 2.2 — Sequence diagram: UC-09 Thanh toán đơn hàng

| Thông tin | Giá trị |
|---|---|
| Nguồn / hình | [sequence-checkout.puml](sequence-checkout.puml) · [sequence-checkout.svg](sequence-checkout.svg) |
| Use case | UC-09 theo [Task 1.3](../requirements/use-case-checkout.md); UC-08 tạo đơn là bước chuẩn bị |
| Căn cứ | [SRS](../requirements/srs.md), [contract](../assignment2/CONTRACTS.md), [contract checkout tham khảo](../reference/a1/checkout-contract.md) |
| Trạng thái | Bản vẽ lại theo đề Task 2.2; chờ reviewer (D) duyệt, chưa nghiệm thu |

![Sequence checkout](sequence-checkout.svg)

## Đối chiếu yêu cầu Task 2.2

| Yêu cầu của đề | Có trong hình |
|---|---|
| Lifeline Customer → Next.js UI → NestJS API → Database → Payment Service | Đủ năm lifeline; Payment Service là mock nội bộ NestJS |
| Request/response và thứ tự gọi API | `POST /orders`, `GET /orders/:id`, `POST /payments`, `GET /orders/:id` |
| Kiểm tra JWT và validate dữ liệu | Bước 4 (tạo đơn) và bước 25 (thanh toán), nhánh lỗi 401/400/404 |
| Transaction khi tạo đơn và cập nhật tồn kho | BEGIN, optimistic locking `stockVersion`, tạo Order + giữ kho, COMMIT hoặc ROLLBACK |
| Nhánh alt thanh toán thành công/thất bại | SUCCEEDED (PAID, trừ kho, cộng điểm) và FAILED (PAYMENT_FAILED, giữ kho đến hạn), cùng một transaction |
| Idempotency khi client gửi lại | Khóa đã xử lý trả lại kết quả gốc, không gọi Payment Service, không trừ kho/cộng điểm lần nữa; nhánh opt mất phản hồi |
| Thông báo kết quả cuối cùng | Đọc lại Order rồi thông báo thành công, thất bại hoặc đã hủy |

Thanh toán thất bại là kết quả nghiệp vụ trả HTTP 200, không phải lỗi transport. Khóa dòng Order trước khi kiểm tra hạn thanh toán theo đồng hồ Database.

## Giới hạn

Hình là thiết kế để review, không chứng minh code đã chạy hay AC đã đạt. Hủy đơn và hết hạn tự động tranh chấp với thanh toán được mô tả ở [ngữ cảnh hỗ trợ](../requirements/checkout-supporting-flows.md).
