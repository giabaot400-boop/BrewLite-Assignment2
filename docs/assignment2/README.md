# BrewLite Assignment 2 — Task 1–2

Bản tích hợp checkout: [nguồn, phạm vi và kiểm tra](CHECKOUT_INTEGRATION.md). Tình trạng Task/AC phải đối chiếu evidence của A2; thông tin lịch sử bên dưới không tự xác nhận bản tích hợp mới đã nghiệm thu.

[QA Windows ngày 13/11/2026](CHECKOUT_WINDOWS_QA.md): Compose checkout A2 8/8, browser 9/9, cleanup và persistence đạt; có fingerprint source chưa commit và image ID. Đây là kiểm chứng local cho phần tích hợp, chưa thay nghiệm thu toàn A2 hoặc triển khai production.

[PWA Windows ngày 14/11/2026](testing/pwa-windows-2026-11-14/README.md): bản ghi thủ công trên Chrome 157 và image Compose local ngày 13/11, gồm cài/mở app, offline, cache, checkout và đổi tài khoản. Giữ riêng Git HEAD/image; chưa thay HTTPS production, recovery mất phản hồi hoặc nghiệm thu toàn bộ AC.

[Responsive và bàn phím ngày 14/11/2026](testing/ui-keyboard-windows-2026-11-14/README.md): quan sát thủ công ba viewport theo SRS, auth/validation trống và focus/hộp thoại checkout/logout; ghi riêng phần chưa kiểm, không xác nhận toàn bộ NFR-06/12 hoặc accessibility.

**Cập nhật 10/11/2026 · Thiết kế kế thừa Sprint 3 / nền Sprint 2 a1a0e4a.** Tài liệu gốc đã được merge qua [PR A1 #29](https://github.com/giabaot400-boop/BrewLite/pull/29); hiệu đính Task 1 nằm ở [PR A1 #42](https://github.com/giabaot400-boop/BrewLite/pull/42), còn lượt này đồng bộ Task 2 và truy vết; chưa xác nhận đã nghiệm thu Task 1–2, code đã đạt AC hoặc production đã triển khai.

Repository hiện hành: [BrewLite-Assignment2](https://github.com/giabaot400-boop/BrewLite-Assignment2). Các mốc main/PR của phần kế thừa thuộc repo A1; xem [nguồn và ranh giới hai repo](SOURCE_PROVENANCE.md).

## Đọc trước

1. [Kế hoạch giao nhóm](TEAM_PLAN.md): một lead/reviewer mỗi mục, lịch mục tiêu tới 15/11 và cổng nghiệm thu Task 1→5.
2. [Contract đồng bộ](CONTRACTS.md): năm API checkout, kế thừa session/logout, invariant Order–ledger, lỗi/retry v1 và môi trường nền.
3. [Ghi chú thiết kế](CHANGELOG.md): các quyết định và giới hạn hiện tại; lịch sử repo theo commit/PR.

## Tạo phẩm theo đề

| Task | Tài liệu | Nguồn/hình |
|---|---|---|
| 1.1 | [Bối cảnh và phạm vi](../requirements/context-and-scope.md) | Stakeholder, IN/OUT, giả định/ràng buộc/rủi ro |
| 1.2 | [SRS](../requirements/srs.md) | [Master SVG](../diagrams/master-use-case.svg) / [nguồn](../diagrams/master-use-case.puml) |
| 1.3 | [UC-09 Thanh toán không tiền mặt](../requirements/use-case-checkout.md) | [SVG](../diagrams/use-case-checkout.svg) / [nguồn](../diagrams/use-case-checkout.puml) |
| 2.1 | [Activity](../diagrams/activity-checkout.md) | [Activity](../diagrams/activity-checkout.svg) / [nguồn](../diagrams/activity-checkout.puml) |
| 2.2 | [Sequence](../diagrams/sequence-checkout.md) | [Sequence UC-09](../diagrams/sequence-checkout.svg) / [nguồn](../diagrams/sequence-checkout.puml) |
| 2.3 | [Domain class](../diagrams/class-domain.md) | [SVG](../diagrams/class-domain.svg) / [nguồn](../diagrams/class-domain.puml) |
| Truy vết | [Ma trận FR/NFR→UC→thiết kế→API→test](../traceability-matrix.md) | Code/test chưa xác minh ghi CHỜ |

Trong repo, đọc trực tiếp các liên kết bên dưới docs; mở SVG bằng trình duyệt và chỉnh qua nguồn PlantUML. Các tệp được bố trí theo đường dẫn tạo phẩm của đề, không commit gói ZIP. Bảy tài liệu nội dung (gồm ngữ cảnh hỗ trợ), năm nguồn và năm SVG cùng nội dung thiết kế.

## Phạm vi và trạng thái

Giữ nguyên **17 FR, 12 NFR, 59 AC, 14 UC, 10 lớp domain**. Payment↔PaymentAttempt, LoyaltyTransaction↔LoyaltyEntry chỉ ánh xạ tên, không thêm bảng. Mock PaymentService có lifeline riêng bên trong NestJS. Giữ ba giản lược S3: không API quote, không API đọc payment riêng, chỉ kho Product; Topping vẫn chọn/tính giá/snapshot.

Task 1–2 đã có trên main qua [PR A1 #29](https://github.com/giabaot400-boop/BrewLite/pull/29). Source đã chuyển sang `apps/web` và `apps/api` qua [PR A1 #30](https://github.com/giabaot400-boop/BrewLite/pull/30); phần đóng góp A cho Task 3.1 ở [kiến trúc frontend/BFF/PWA](../architecture/frontend-bff-pwa.md) đã merge qua [PR A1 #31](https://github.com/giabaot400-boop/BrewLite/pull/31). PWA đã triển khai qua [PR A1 #33](https://github.com/giabaot400-boop/BrewLite/pull/33), với [kết quả và giới hạn kiểm tra local](PWA.md). Các mốc này chưa tự hoàn tất kiến trúc tổng thể/ADR, Task 3.2 deployment hoặc production. A2 vẫn bắt buộc health endpoint, PWA, CI/CD, kiểm thử/truy vết và production HTTPS; Compose A1 không thay các đầu ra này.

Hạn **15/11/2026** do PO cung cấp; giờ LMS cần xác nhận. Lịch đề xuất ban đầu (không phải kết quả hoàn thành): 05/11 Task 1–2 trên repo, 06/11 Task 3, 07–08/11 cổng Task 4, 09–12/11 Task 5, 13–14/11 dự phòng/đóng gói. Lead và lịch là đề xuất nhận việc, chưa là capacity cam kết. Không chờ hoàn thành A1 mới chuẩn bị toàn bộ A2.

Nguồn: Assignment2-BrewLite.pdf, hồ sơ S1/S2 lịch sử, Sprint 3 và nền S2 a1a0e4a, hồ sơ docs/SPRINT2_CLOSEOUT.md sau [PR A1 #24](https://github.com/giabaot400-boop/BrewLite/pull/24) / [PR A1 #26](https://github.com/giabaot400-boop/BrewLite/pull/26) / [PR A1 #28](https://github.com/giabaot400-boop/BrewLite/pull/28) / [PR A1 #27](https://github.com/giabaot400-boop/BrewLite/pull/27). Tái sử dụng evidence S2 cần đối chiếu đúng AC/môi trường/commit; không tự ghi toàn bộ S2 hoặc A2 PASS. [PR A1 #29](https://github.com/giabaot400-boop/BrewLite/pull/29) chỉ chỉnh tài liệu và sơ đồ UML; không xác nhận đã chạy test ứng dụng. Kết quả review được ghi trên PR, không suy ra việc phê duyệt toàn bộ tài liệu từ một lần kiểm tra.

## Use case trọng tâm

Task 1.3 chỉ chọn **UC-09 Thanh toán không tiền mặt**. UC-08 và các UC khác vẫn thuộc master/SRS; các bước tạo đơn, hủy và expiry chuyển sang [ngữ cảnh hỗ trợ](../requirements/checkout-supporting-flows.md), không bị bỏ khỏi sản phẩm. Activity Task 2.1 vẫn end-to-end. Hình sequence payment là hình chính Task 2.2 với đủ Customer/UI/API/Database/PaymentService, có ngữ cảnh tạo Order/transaction/CAS trước ranh giới UC-09; hình tạo đơn chi tiết hóa ngữ cảnh ấy; hình hủy/expiry bổ trợ cạnh tranh trạng thái. Không đổi nghiệp vụ S3 hoặc yêu cầu Task 3–5.

## Kiểm tra tài liệu

Đã kiểm tra tập 17 FR/12 NFR/59 AC và 14 mã UC; kiểm tra liên kết, nguồn PlantUML và năm SVG. Ba sơ đồ Task 2 được vẽ lại theo đề; sequence có khung tạo đơn/giữ kho, UC-09 vẫn là trọng tâm. Đây là kiểm tra tài liệu, không phải test ứng dụng, PR review hoặc nghiệm thu Task 1–5.

## Quan hệ A1 và A2

A2 tiếp tục đề tài BrewLite nhưng có repository và bộ source riêng theo yêu cầu giảng viên do PO thông báo ngày 10/11/2026. A1 tiếp tục ở `BrewLite`; A2 ở `BrewLite-Assignment2`. Kế thừa code/thiết kế có ghi nguồn và kiểm chứng tương thích, không tự đồng bộ hoặc đưa mọi chi tiết A1 thành yêu cầu bắt buộc A2. Hai phần có thể chuẩn bị song song; A2 nghiệm thu Task 1→5 theo tạo phẩm và lịch sử thật trên repo A2. Hai Sprint A2 là các mốc Task 4/5, không đổi nhãn ba Sprint A1 để thay nghiệm thu. Giữ giới hạn tái sử dụng evidence theo đúng phiên bản, môi trường và AC; xem [nguồn kế thừa](SOURCE_PROVENANCE.md).
