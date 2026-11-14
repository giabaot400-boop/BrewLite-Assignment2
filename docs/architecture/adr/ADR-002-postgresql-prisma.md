# ADR-002 — PostgreSQL và Prisma

- Trạng thái: Ghi nhận kiến trúc hiện tại.
- Quyết định: Sử dụng PostgreSQL làm database và Prisma để định nghĩa schema, truy cập dữ liệu, quản lý migration.
- Lý do: Dữ liệu sản phẩm, người dùng và đơn hàng có quan hệ và ràng buộc rõ ràng.
- Hệ quả: Cần quản lý migration có phiên bản, generate Prisma Client và kiểm thử tích hợp với database thực.
