# ADR-004 — Kết hợp Mock Test và Integration Test

- Trạng thái: Đề xuất chiến lược kiểm thử, chờ review.
- Quyết định đề xuất: Sử dụng mock cho unit test; sử dụng PostgreSQL và các service thực cho integration/E2E test.
- Lý do: Cân bằng tốc độ kiểm thử với khả năng phát hiện lỗi tích hợp.
- Hệ quả: Cần chuẩn bị dữ liệu kiểm thử, cô lập môi trường và thu thập bằng chứng PASS/FAIL.
