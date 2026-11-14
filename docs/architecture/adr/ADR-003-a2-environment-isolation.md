# ADR-003 — Tách môi trường và dữ liệu A2 khỏi A1

- Trạng thái: Đề xuất quy trình, chờ review.
- Quyết định đề xuất: Sử dụng database và cấu hình môi trường riêng cho Assignment 2; không mặc định tái sử dụng database A1.
- Lý do: Tránh xung đột schema, migration và dữ liệu giữa hai repository.
- Hệ quả: Cần chuẩn bị database, secrets, migration và seed độc lập.
