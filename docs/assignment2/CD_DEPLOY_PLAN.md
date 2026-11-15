# Task 5.3 — CD đã thực hiện và phạm vi chứng cứ

Bản kế hoạch B PR #17 được cập nhật theo [CI #53](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43682250369), source `ce4faf64f394740108eb8911a1e3076728b85860`. Không còn là workflow chỉ verify/publish. Hướng dẫn thực thi chính: [docs/deployment.md](../deployment.md); [bằng chứng CD](testing/railway-production-2026-11-15/README.md).

1. Quality gate verify trên main; publish GHCR trả digest Web/API cùng source.
2. workflow_dispatch với deploy=true, Environment railway-production và secret project token đúng scope. Required reviewer/branch restriction phải được chủ repo kiểm tra theo hướng dẫn; không suy trạng thái quyền chỉ từ run xanh.
3. Script kiểm context read-only trước mutation, cập nhật API digest + pre-deploy migrate deploy, chờ đúng deployment SUCCESS.
4. Sau đó cập nhật Web digest, chờ SUCCESS; không sửa scaling, không chạy seed/cấp kho trong pipeline.
5. Smoke GET-only 8 checks, so build SHA Web; riêng health/SHA retry có thời hạn 120s, catalog/product/PWA không retry. Sai trạng thái/SHA sau hạn làm job fail.
6. Artifact chứa deployment ID, pin cũ và smoke; hai JSON của lượt #53 đã lưu trong repo. Không ghi token/variables vào report.

## Kết quả và giới hạn

- Run #53: verify/publish/deploy/smoke SUCCESS; API rồi Web, smoke 8/8.
- Run [43680264304](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43680264304): deploy fail ở preflight replica, trước mutation. Đây là bằng chứng dừng preflight, không chứng minh rollback sau migration.
- Test delivery có API OK/Web fail và sai deployment identity; không đổi fixture thành live failure injection.
- Rollback là thao tác có kiểm soát theo digest và schema compatibility trong [runbook](DEPLOY_RUNBOOK.md); chưa chạy rollback production. Không tự đảo migration/restore đè DB.
- Deploy dùng digest nên không phụ thuộc latest; push và dispatch có thể publish song song. Không dùng latest để suy release đang chạy.
