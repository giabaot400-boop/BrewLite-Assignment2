# Ghi chú thiết kế Assignment 2

Cập nhật ngày 14/11/2026.

## 14/11/2026 — Làm rõ bằng chứng theo review PR #11

- Bổ sung ranh giới giữa lượt Compose local ngày 13/11 và source sau khi nhận
  main qua commit `3726bace5f43336377fa354ca6c26d2576ea371f`.
- PR #9 thay Dockerfile Web và tài liệu Compose; PR #10 thay action CI. Không
  gán kết quả Compose cũ cho các thay đổi này hoặc SHA cuối chưa chạy lại Docker.
- Bổ sung cách tái lập hash tổng của manifest 347 file từ report gốc. Giữ nguyên
  report, script, image ID và hash của lượt chạy đã ghi nhận.
- Lượt sửa này chỉ thay tài liệu; không đổi code, dependency, migration hoặc
  contract. CI của commit cuối cần được đối chiếu riêng trước khi merge.

## 13/11/2026 — Tích hợp checkout A2

- Nguồn A1: `3a70df65ee5f65af49a1c3eaa080415cf30f6097`; nền A2:
  `3be4a11847f479ac87d1c3321009433d3850afb9`. Phạm vi và nguồn tại
  [CHECKOUT_INTEGRATION.md](CHECKOUT_INTEGRATION.md).
- Nhận có chọn lọc backend checkout/payment/hủy/expiry/kho/điểm, frontend v2
  và BFF tương ứng; migration giữ dữ liệu legacy. Không nhập toàn bộ hồ sơ A1
  thành evidence A2; giữ môi trường và cookie riêng của A2.
- Thực hiện `npm audit fix --ignore-scripts` và đồng bộ NestJS
  common/core/platform-express **12.1.3 → 12.5.0**. Next.js giữ **16.4.2**.
  Theo output đã cung cấp, audit production không còn vulnerability được báo;
  full audit vẫn còn moderate của minimatch qua tooling dev. Không tuyên bố
  toàn bộ dependency không còn rủi ro.
- Ghi [QA Windows](CHECKOUT_WINDOWS_QA.md): Compose 8/8 và browser 9/9 trên
  source chưa commit, report/fingerprint riêng; không coi đó là lượt GitHub CI.
- Commit tích hợp đầu: `0a086f231af21911807f81dc466820f51e6633cb`,
  [PR #11](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/11).

## Ghi chú nền ngày 10/11/2026

Cập nhật ngày 10/11/2026. Từ yêu cầu giảng viên do PO thông báo, A1/A2 dùng hai repo và hai source riêng. Xem [nguồn kế thừa](SOURCE_PROVENANCE.md); phương án dùng chung repo trước đây được thay bằng tổ chức này, giữ nguyên nghiệp vụ/AC. Các thay đổi trên repository được truy vết bằng commit và pull request; không dùng lịch sử các gói soạn thảo bên ngoài Git làm lịch sử phát hành của repo.

- Task 1.3 chọn duy nhất UC-09 Thanh toán không tiền mặt. Các bước M-01…M-05 thuộc UC-09; các bước C- thuộc ngữ cảnh tạo đơn/hủy/hết hạn, không phải trọng tâm thứ hai.
- Sequence chính có khung tạo Order/giữ Product trong transaction và optimistic locking trước ranh giới UC-09. Tạo đơn và thanh toán vẫn là hai lượt xác nhận/transaction riêng; retry payment không tạo đơn mới.
- FR-13 và state machine thuộc phạm vi. D16 chỉ đặt giao diện quầy đầy đủ ngoài MVP; cơ chế CLI phục vụ demo/test cần được hiện thực và kiểm chứng. Không thêm actor/UC quầy.
- Công thức giá, chuẩn hóa mã và canonical/hash được đối chiếu theo contract. BFF chuyển nguyên request; pending/key/body bất biến khi retry.
- A1/A2 có thể chuẩn bị song song; A2 nghiệm thu tuần tự Task 1→5. PWA, health endpoint, CI/CD và production HTTPS vẫn là đầu ra bắt buộc khi đến task tương ứng.

Giữ 17 FR, 12 NFR, 59 AC, 14 UC và 10 lớp domain. Code/test chưa xác minh tiếp tục ghi CHỜ; tài liệu chưa xác nhận Task 1–5 đã nghiệm thu.
