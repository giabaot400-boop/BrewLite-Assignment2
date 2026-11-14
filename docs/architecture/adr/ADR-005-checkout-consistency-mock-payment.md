# ADR-005 — Mock Payment và tính nhất quán Checkout V2

- Trạng thái: Đề xuất, chờ review.
- Mốc source đối chiếu: `origin/main` tại commit `4c177bf` (Checkout V2).
- Quyết định: Sử dụng Mock Payment trong NestJS, Prisma transaction và idempotency để quản lý tính nhất quán của Checkout V2.

## Bối cảnh

Checkout V2 xử lý các nghiệp vụ liên quan đến thanh toán, trạng thái đơn hàng, tồn kho và điểm thưởng.

Các thao tác này cần được phối hợp để hạn chế tình trạng thanh toán thành công nhưng tồn kho hoặc điểm thưởng không được cập nhật tương ứng.

Ngoài ra, client có thể gửi lại request do lỗi mạng hoặc timeout, dẫn đến nguy cơ tạo giao dịch trùng.

Assignment 2 chưa tích hợp cổng thanh toán thực nên cần cơ chế mô phỏng để phát triển và kiểm thử workflow.

## Quyết định

### 1. Mock Payment trong backend

Sử dụng `MockPaymentService` thuộc NestJS để giả lập kết quả thanh toán.

Biến môi trường `MOCK_PAYMENT_OUTCOME` nhận `SUCCEEDED` hoặc `FAILED`, mặc định `SUCCEEDED`.

Mock Payment hỗ trợ workflow với hai phương thức `WALLET` và `CARD`, không thực hiện giao dịch với cổng thanh toán bên ngoài.

### 2. Transaction cho Checkout Workflow

`OrderWorkflowService` sử dụng `runWorkflowTransaction()` để thực hiện các thay đổi dữ liệu liên quan trong Prisma transaction.

Khi thanh toán thành công:

1. Tạo `PaymentAttempt` với trạng thái `SUCCEEDED`.
2. Tiêu thụ tồn kho đã giữ bằng `consumeStock()`.
3. Cộng điểm thưởng bằng `awardPoints()`.
4. Cập nhật Order thành `PAID`.

Khi thanh toán thất bại, hệ thống ghi nhận `PaymentAttempt` với trạng thái `FAILED` và cập nhật Order thành `PAYMENT_FAILED`. Tồn kho đang được giữ không bị tiêu thụ trong nhánh này.

Khi hủy đơn đã thanh toán, hệ thống kiểm tra bằng chứng thanh toán, hoàn tồn kho, thu hồi điểm thưởng, cập nhật thông tin hoàn tiền trong `PaymentAttempt` và chuyển Order sang `CANCELLED`.

Khi hủy đơn chưa thanh toán, hệ thống giải phóng tồn kho đã giữ và chuyển Order sang `CANCELLED`.

Các thay đổi trên được thực hiện thông qua transaction client của Prisma.

### 3. Kiểm soát đồng thời và retry

Workflow sử dụng khóa PostgreSQL và kiểm tra phiên bản dữ liệu để hạn chế xung đột giữa các thao tác đồng thời.

`runWorkflowTransaction()` cho phép tối đa ba lần thử khi gặp lỗi được phân loại có thể retry, bao gồm một số lỗi xung đột tồn kho, serialization/deadlock và unique constraint liên quan đến thanh toán.

Nếu không xử lý thành công sau các lần thử, hệ thống trả lỗi `TRANSACTION_RETRY_EXHAUSTED` với HTTP 503.

### 4. Idempotency và Replay

Các API tạo đơn và thanh toán sử dụng `Idempotency-Key` kết hợp request hash để nhận diện yêu cầu.

Đối với thanh toán:

- Cùng user, cùng key và cùng nội dung: trả về PaymentAttempt đã lưu.
- Cùng user và key nhưng nội dung khác: trả lỗi `IDEMPOTENCY_CONFLICT`.
- Yêu cầu mới hợp lệ: xử lý và ghi nhận PaymentAttempt mới.

Đối với tạo đơn Checkout V2, `decideOrderIdempotencyV2()` phân biệt ba trường hợp `NEW`, `REPLAY` và `CONFLICT` dựa trên canonical version và request hash.

Cơ chế replay giúp tránh thực hiện lại các tác động nghiệp vụ đối với yêu cầu đã được ghi nhận.

## Lý do

- Kiểm thử được cả nhánh thanh toán thành công và thất bại mà không phụ thuộc cổng thanh toán ngoài.
- Tập trung nghiệp vụ checkout trong backend.
- Sử dụng transaction để phối hợp thay đổi Order, PaymentAttempt, StockReservation và LoyaltyEntry.
- Hạn chế xử lý trùng khi client retry request.
- Có cơ chế phát hiện và thử lại một số xung đột giao dịch.

## Trade-off

- Mock Payment không mô phỏng đầy đủ lỗi mạng, timeout hoặc phản hồi bất đồng bộ của cổng thanh toán thực.
- Transaction, khóa và idempotency làm tăng độ phức tạp của backend.
- Retry cần được giới hạn để tránh xử lý kéo dài hoặc lặp vô hạn.
- Việc tích hợp thanh toán thực trong tương lai cần thiết kế thêm webhook, xác thực callback, đối soát và xử lý side effect ngoài database.

## Giới hạn

- Chưa tích hợp thanh toán production.
- Thông tin hoàn tiền hiện được ghi nhận trong database, không phải bằng chứng đã chuyển tiền qua cổng thanh toán.
- Transaction wrapper hiện tại không khai báo tường minh `isolationLevel`; không khẳng định workflow sử dụng `Serializable`.
- Các test hiện có không thay thế việc kiểm thử đầy đủ trên môi trường production.
- ADR này không xác nhận toàn bộ acceptance criteria của Assignment 2 đã hoàn thành.
