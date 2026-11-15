# ADR-001 — Phân chia Frontend/BFF và Backend API

- Trạng thái: Ghi nhận kiến trúc hiện tại.
- Quyết định: Sử dụng Next.js cho giao diện và các BFF Route Handlers; NestJS đảm nhiệm API và nghiệp vụ.
- Lý do: Phân tách giao diện, xử lý request phía server và logic nghiệp vụ.
- Hệ quả: Cần quản lý hợp đồng API, cookie/session và cấu hình kết nối giữa các service.
- Tham chiếu: `docs/architecture/frontend-bff-pwa.md` và Product BFF trong PR A2 #7.
