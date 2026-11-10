## Ticket / mã đầu ra
<!-- Ví dụ: A2-REPO-CI. Ghi lead và reviewer theo docs/assignment2/TEAM_PLAN.md -->

## Thay đổi
<!-- Vấn đề, cách làm, phạm vi. Nếu đưa commit từ A1 sang: ghi URL/SHA nguồn và SHA đích. -->

## Cách kiểm tra (ghi đúng môi trường)
- [ ] CI check `verify` đạt trên SHA của PR (dán link lần chạy):
- Lệnh đã chạy cục bộ, Node/npm, hệ điều hành, kết quả:
- Chưa kiểm tra / giới hạn:

## Definition of Done (chi tiết ở docs/assignment2/TASK4_REPO_BACKLOG_DOD.md)
- [ ] Có reviewer khác tác giả đã phản hồi trên PR này (approval A1 không thay approval A2)
- [ ] lint, typecheck, test, build đạt (CI xanh)
- [ ] Không commit secret, `.env`, `node_modules`, `.next`, `dist`, Prisma Client đã sinh
- [ ] Tài liệu, README hoặc contract liên quan được cập nhật khi hành vi đổi
- [ ] Không ghi PASS cho kết quả chưa chạy; evidence ghi repo, SHA, môi trường, lệnh, expected/actual
