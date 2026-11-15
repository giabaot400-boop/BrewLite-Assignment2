# BrewLite A2 — Rà Task 4 và Task 5 để chốt bàn giao

Ngày rà: 14/11/2026. Repository: [BrewLite-Assignment2](https://github.com/giabaot400-boop/BrewLite-Assignment2).

Đây là review yêu cầu, source, tài liệu và bằng chứng đã lưu; không phải lượt chạy test mới, nghiệm thu của giảng viên hoặc approval thay reviewer. Báo cáo này cập nhật trạng thái Task 4/5 sau khi E bổ sung bằng chứng Railway; không tự đổi toàn bộ 59 AC thành PASS.

## 1. Kết luận

- Task 4 có nền kỹ thuật và CI hoạt động. Việc cần khép chủ yếu là backlog hai Sprint, quy ước commit, liên kết tạo phẩm Task 1–3 và xác nhận nghiệm thu.
- Task 5.1/5.2 có checkout tích hợp và bằng chứng local đáng dùng: PostgreSQL, HTTP/BFF, Compose và browser. Cần nối evidence vào ma trận và bổ sung đúng AC còn thiếu.
- Task 5.3 còn thiếu bước deploy production bằng secret CI và smoke sau deploy. CI → GHCR → deploy Railway thủ công chưa đáp ứng đầy đủ pipeline mà đề yêu cầu.
- Task 5.4 có URL HTTPS bản nền và hồ sơ tạo đơn PENDING; còn nâng bản Sprint 3, hoàn thiện URL/health, release, hướng dẫn, demo, Review/Retro và kiểm chứng người ngoài nhóm chạy theo README.
- Không có cơ sở từ review này để yêu cầu viết lại checkout hoặc chạy lại toàn bộ QA đã đạt. Những mục thiếu evidence không tự là lỗi sản phẩm.

## 2. Mốc đối chiếu

| Nguồn | Mốc và kết quả |
|---|---|
| Main A2 | `4c177bfb42ae5cfd709a8587e58f67d3922a6fad`, merge #11 |
| CI main | [43549055750](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43549055750): verify và publish-ghcr đều success |
| CI đỏ có chủ đích | [43159409852](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43159409852): failure; nguyên nhân, giới hạn chặn merge được ghi trong CI.md |
| Hồ sơ PWA/UI | [PR #14](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/14), head `92f6c3f`, còn mở; [CI 43608885517](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43608885517) success |
| Kiến trúc D | [PR #8](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/8), head `34cee83`, còn mở |
| Deployment E | [PR #3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3), head `eb8925f`, còn mở; CI success |
| Railway evidence E | [PR #15](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/15), head `7009009`, còn mở; CI success |
| Source đang được báo cáo chạy Railway | `0bea2e2015c54cf23cb1d3b9f32bc146d2891136`, trước checkout Sprint 3 |
| URL công khai | [BrewLite](https://brewlite-production.up.railway.app), [Product BFF](https://brewlite-production.up.railway.app/api/products) |

Trong phiên review trước ngay cùng chuỗi công việc, đã GET độc lập URL gốc và /api/products: cả hai 200, tiêu đề BrewLite, JSON có bốn sản phẩm. Không chạy lại lượt HTTP đó trong lần rà Task 4/5 này. Đăng nhập, tạo đơn và redeploy API trên Railway vẫn là bằng chứng thủ công do E báo cáo; không có quyền dashboard để xác nhận độc lập cấu hình private/volume hoặc SQL.

Đã đọc lại đề Task 4/5, SRS, ma trận, Git workflow, backlog/DoD, CI, kế hoạch nhóm và các hồ sơ checkout/PWA/UI. Đối chiếu Git blob của 11 tệp trọng tâm với tree main: khớp, gồm README, workflow, SRS, ma trận và các tài liệu Task 4/checkout. Tree main trả đầy đủ, không truncated.

## 3. Task 4 — Triển khai Sprint 1

| Mục đề | Bằng chứng hiện có | Cần làm để khép |
|---|---|---|
| 4.1 Repository | apps/web, apps/api, docs; README, gitignore, env mẫu; hướng dẫn nhánh/PR; PR template và DoD | B cung cấp link Product Backlog/board cho cả hai Sprint và quy ước commit rõ |
| 4.2 Quản lý tài liệu | Task 1/2 và lịch sử kế thừa đã có; góp ý tài liệu qua PR; kiến trúc #8/deployment #3 đang review | Chốt review và đưa tạo phẩm Task 3 vào main; ghi baseline và cổng nghiệm thu thật |
| 4.3 MVP menu | GET products/detail, seed catalog, UI menu/chi tiết/loading/empty/error; test sản phẩm API/web; browser menu → chi tiết | Nối code/test/evidence vào FR-01/02, reviewer xác nhận đúng phần MVP |
| 4.4 CI | PR tự chạy install → lint → typecheck → unit → setup → build; run xanh/đỏ; main protected, required context verify | Giữ link run và SHA trong hồ sơ; chốt G4 sau các cổng trước |

### Các giới hạn cần giữ đúng

- GitHub Issues API trả 15 mục, tất cả là PR, không có issue thường trong lượt lấy này. Điều đó không chứng minh không có GitHub Project hoặc board ngoài. Việc cần là B cung cấp link thật, không tự tạo lịch sử ngược.
- GIT_WORKFLOW.md đã có quy trình branch/PR nhưng chưa có quy ước thông điệp commit rõ. Có thể thêm ngắn gọn định dạng và ví dụ do nhóm thống nhất.
- Required check verify được xác nhận qua API nhánh main. Chi tiết approval trong CI.md dựa trên quan sát PR #5; chưa kiểm độc lập mọi tùy chọn bảo vệ nhánh.
- Lint root chỉ phủ web; API có typecheck/test/build. PostgreSQL/browser không chạy trong CI hiện tại. Các giới hạn này đã công khai, không tự yêu cầu nhét mọi integration test vào CI hoặc thêm ESLint API chỉ để đóng Task 4.
- Các thư mục test nằm cạnh code và tên compose.yaml không tự là lỗi cấu trúc; cần hướng dẫn chạy được và liên kết rõ.

Nguồn: [Task4/DoD](https://github.com/giabaot400-boop/BrewLite-Assignment2/blob/4c177bfb42ae5cfd709a8587e58f67d3922a6fad/docs/assignment2/TASK4_REPO_BACKLOG_DOD.md), [CI.md](https://github.com/giabaot400-boop/BrewLite-Assignment2/blob/4c177bfb42ae5cfd709a8587e58f67d3922a6fad/docs/assignment2/CI.md), [Git workflow](https://github.com/giabaot400-boop/BrewLite-Assignment2/blob/4c177bfb42ae5cfd709a8587e58f67d3922a6fad/docs/guides/GIT_WORKFLOW.md).

## 4. Task 5 — Sprint 2 và Delivery

| Mục đề | Đánh giá | Phần còn mở |
|---|---|---|
| 5.1 Hoàn thiện MVP | Checkout S3 đã tích hợp: tùy chọn/giỏ/auth/tạo đơn, Ví/Thẻ mock, lịch sử/trạng thái, validation, hủy/expiry/kho/điểm | Chốt AC theo assertion thực tế; bản Railway cũ chưa chứng minh workflow mới |
| 5.2 Tích hợp và kiểm thử | Unit; PG 28/28; HTTP/BFF production local 9/9; Windows Compose 8/8 và browser 9/9; ba migration, legacy, seed có guard, Compose, health | Review PR14; nối evidence vào ma trận; bổ sung phép đo/fixture còn thiếu có chọn lọc |
| 5.3 CD | verify → build image tag SHA → push GHCR đã chạy trên main | Deploy bằng secret CI → migration → health/smoke; lỗi làm pipeline fail và có hướng dẫn rollback tương thích schema |
| 5.4 Production/bàn giao | HTTPS và Product BFF hoạt động; E có báo cáo đơn PENDING và giữ dữ liệu sau redeploy API | Nâng S3 và kiểm chứng; API/health cho người chấm; release/notes; README deploy/rollback; người ngoài chạy; demo; Review/Retro |

### 4.1 Bằng chứng local được dùng đúng phạm vi

[CHECKOUT_INTEGRATION.md](https://github.com/giabaot400-boop/BrewLite-Assignment2/blob/4c177bfb42ae5cfd709a8587e58f67d3922a6fad/docs/assignment2/CHECKOUT_INTEGRATION.md) có bảng nguồn và liên kết kiểm tra. Báo cáo chuẩn bị ghi web 970, API 190, PG 28, HTTP/BFF 9 và setup 8; Windows có Compose 8/browser 9. Đây là các bộ khác phạm vi, không cộng thành một tổng PASS chung.

- PG kiểm payment WALLET/CARD thành công, FAILED/retry, replay/race, bốn failpoint payment, refund rollback, kho 2 ly tranh 2+1, điểm, expiry và legacy.
- Browser A2 có ca mất phản hồi sau upstream commit: UI giữ chưa rõ, reload không tự POST, khách chủ động recovery bằng key/body cũ rồi reconcile. Không cần mặc định chạy lại ca này chỉ vì lượt PWA thủ công chưa thử cùng tình huống.
- Hồ sơ Windows có fingerprint/image của working tree tích hợp trước commit. Không đổi SHA của log thành main/GHCR mới.
- PWA/responsive/keyboard là quan sát thủ công theo PR14, có ghi rõ những ca chưa thử; CI xanh của PR tài liệu không thay kiểm chứng browser.
- /health hiện kiểm tiến trình, không kiểm DB; không gọi đó là readiness sâu hoặc giám sát liên tục.

### 4.2 AC cần bổ sung evidence, không phải danh sách lỗi đã phát hiện

1. **Hiệu năng NFR-01:** chưa thấy benchmark A2 có warmup, mẫu/endpoint và tách Nest/BFF/UI. Timing vài request chức năng và benchmark A1 không thay kết quả A2. C/A/E chốt O-02 rồi đo, giữ bcrypt cost đã chốt; nếu vượt mục tiêu thì ghi thật.
2. **Fixture SRS cụ thể:** đối chiếu/tìm lại log cho FAILED của cả WALLET/CARD, kho 1 tranh 1+1, DEMO10 50k/300k, thanh toán 81k → 8 điểm, lịch sử có timestamp bằng nhau. PG28 có nhiều ca gần tương ứng nhưng không tự thay đúng fixture đã định nghĩa.
3. **Transaction/race:** đối chiếu failpoint tạo đơn/snapshot/ledger và điểm đồng bộ cho các race theo NFR-04; đo độ trễ expiry theo FR-17. Không đồng nhất Promise.all với bằng chứng mọi interleaving.
4. **UI nhỏ:** hộp tạo đơn ở tablet, Space và luồng chọn món/sửa giỏ chỉ bằng bàn phím chưa ghi riêng; NFR-12 là Should, nhóm có thể review giới hạn thay vì tuyên bố đạt toàn bộ accessibility.
5. **HTTPS:** sau nâng S3, kiểm cookie/origin/owner/PWA và workflow ở URL thật theo phạm vi được chọn.

B không cần sửa nội dung 59 AC để làm khớp test. Dùng phụ lục mapping trước làm đầu vào, điền path/SHA/run/assertion/expected-actual và để mở đúng phần chưa đủ.

### 4.3 Task 5.3 là phần còn thiếu bắt buộc ngoài nâng bản thủ công

Đề yêu cầu triển khai vào production bằng secret của CI. Workflow hiện chỉ có hai job verify và publish, chưa có deploy/migrate/smoke/rollback. Railway E deploy tay được là tiến triển của production, chưa hoàn tất CD.

E/B cần một đường phát hành có thể review và có log:

1. Chọn source đã qua gate và digest định danh; deploy secret nằm ở CI secret.
2. Deploy Web/API đúng source, chạy migration theo trình tự và kiểm tra trạng thái triển khai.
3. Health/smoke sau rollout; bước lỗi phải làm pipeline thất bại, không báo success từ việc chỉ gửi yêu cầu deploy.
4. Cung cấp cách rollback theo digest và điều kiện tương thích schema; không tự đảo migration/restore đè dữ liệu.
5. Lưu run/source/digests/deployment IDs/smoke và kết quả thật.

Có thể có bước người vận hành chủ động kích hoạt hoặc duyệt phát hành; không bắt buộc mọi push tự deploy. Phần deploy sau đó vẫn phải chạy từ CI theo đề. Đề không buộc tự động rollback database hoặc dùng cổng thanh toán tiền thật.

### 4.4 Railway mới và dữ liệu đang có

PR15 đang ghi source 0bea2e2, hai migration và đơn PENDING. Main 4c177bf có ba migration và workflow S3. Các digest của hai bản khác nhau; không sửa SHA báo cáo cũ để gán nó cho bản mới.

Migration S3 backfill subtotal và giữ checkout_policy_version=1 cho đơn cũ; stock mặc định 0. Script seed-demo chỉ cho local/Compose, INIT_DEMO_STOCK còn đòi fixture chưa có đơn/reservation và stock/version 0. Railway đã có đơn nên E phối hợp C/D chuẩn bị bước cấp tồn phù hợp, có kiểm tra, trước khi demo S3; không bỏ guard hoặc xóa đơn cũ để chạy lệnh local.

Web cần CHECKOUT_V2_ENABLED=1 tại runtime cho workflow mới và giữ nhất quán sau rollout storage v2. Đơn cũ policy1 dùng để kiểm tra bảo toàn/đọc, đơn mới policy2 để kiểm thử payment/cancel/expiry.

Đã gửi góp ý #3/#15 thông qua comment do A đăng. Không tạo thêm thao tác deploy hoặc thay đổi database trong review này.

## 5. Bàn giao 5.4 cần chuẩn bị song song

| Đầu ra | Hiện trạng | Người phối hợp |
|---|---|---|
| Frontend HTTPS bản S3 | URL đã có, bản đang báo cáo là nền cũ | E, A kiểm lại |
| API và health | Product BFF public truy cập được; API/DB private theo báo cáo E; cần chỉ dẫn URL/cách kiểm health cho người chấm | E/C/B |
| Release/tag/notes | Releases API trả rỗng; truy vấn tags chưa lấy được, không kết luận chắc chắn chưa có tag | B/E |
| README local/test/build | Có; các đoạn trạng thái còn mốc cũ cần đồng bộ sau review/merge | B, A review |
| README deploy/rollback | PR3 có nội dung vận hành; cần đường dẫn rõ từ README/mục lục và hướng dẫn đúng bản cuối | E/B |
| Người ngoài nhóm clone/chạy | Chưa thấy hồ sơ A2 đáp ứng trong bộ nguồn đã rà | B tổ chức, người ngoài thực hiện |
| Demo/video | Chưa thấy hồ sơ demo bàn giao A2 đầy đủ; demo A1 không tự thay | Nhóm, A phối hợp |
| Sprint Review và Retro A2 | Kế hoạch có, chưa thấy biên bản/sự kiện thực tế trong tree | B/nhóm |
| Ma trận truy vết | Đủ nhóm yêu cầu/59 mã nhưng code/test chủ yếu CHỜ | B gom, từng lead xác nhận |

API private không tự là lỗi thiết kế; database tiếp tục private. Nhóm cần thống nhất cách đáp ứng đầu ra URL API/health theo đề, không tự mở DB hoặc thêm public mutation để thuận tiện chấm.

Tài liệu gợi ý docs/deployment.md có thể là một entrypoint dẫn tới hướng dẫn chính; không cần nhân bản toàn bộ nội dung nếu README và mục lục đã dẫn rõ, người ngoài thực hiện được.

## 6. Việc nên giao ngay

| Ưu tiên | Việc | Lead | Hoàn thành khi |
|---|---|---|---|
| 1 | Cập nhật Railway lên S3, chuẩn bị migration/tồn kho/flag | E, C/D hỗ trợ | Có source/digest/deployment và smoke workflow mới |
| 1 | Bổ sung CD từ CI | E+B | Có run deploy → migration → health/smoke thật, lỗi dừng, hướng dẫn rollback |
| 1 | Board hai Sprint, commit convention, chốt docs/review | B, D/E phần mình | Link/tài liệu và review thật trên repo |
| 1 | Điền ma trận từ evidence sẵn có | B, từng lead xác nhận | Các ô đã kiểm có path/SHA/assertion; phần chưa đủ giữ mở |
| 2 | Benchmark và fixture thiếu | C/D, A/E hỗ trợ | Đúng phép đo/fixture SRS, log A2 và giới hạn rõ |
| 2 | Release/README/demo/Review/Retro/người ngoài chạy | B điều phối, cả nhóm | Bộ bàn giao có thể kiểm lại |

Các phần B làm về board, ma trận, quy ước và khung bàn giao có thể tiến hành ngay khi E đang triển khai. A không cần chờ E rồi kiểm kê lại toàn bộ repository.

## 7. Giới hạn review

Không chạy mới lint/unit/build/PG/browser/Compose, không deploy, không ghi dữ liệu production, không tạo release/tag hoặc gửi tin nhắn/comment từ lượt này. Không suy ra mọi AC đã đạt từ CI hoặc một demo. Tạo phẩm Task 1–3 cần reviewer chốt theo lịch sử thật trước khi ký Task 4/5; không sửa ngược lịch sử.

Không đọc được tag không có nghĩa không có tag; không thấy link board không có nghĩa board không tồn tại. E cần giữ bằng chứng API redeploy riêng với DB persistence/backup-restore. Không yêu cầu triển khai payment gateway tiền thật ngoài phạm vi mock của đề.

