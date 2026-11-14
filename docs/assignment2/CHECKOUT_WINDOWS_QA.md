# QA tích hợp checkout A2 trên Windows

Ngày thực hiện: **13/11/2026**. Phạm vi: checkout được tích hợp vào repository
`giabaot400-boop/BrewLite-Assignment2`; không dùng kết quả chạy A1 thay cho A2.

## Phiên bản được kiểm tra

- Nhánh: `integration/a2-checkout-e2e`.
- Nền HEAD: `3be4a11847f479ac87d1c3321009433d3850afb9` **cùng các thay đổi chưa commit**.
  Không gán các kết quả này cho riêng HEAD nền chưa nhận checkout.
- Manifest SHA-256 của 347 file source tại thời điểm kiểm tra:
  `28a047822fbaf4cb5e91e93712a66dd1bbc221e123c2924abd86b8da5d995dae`.
- Helper đã đối chiếu 67 file của backend và 142 file của frontend trong image
  với checkout tại thời điểm chạy; CRLF/LF và cách thụt JSON được chuẩn hóa khi đối chiếu.
- Docker Engine `29.9.3`; Compose `v5.7.0`; PostgreSQL trong container `17.11`;
  Chromium `158.0.8127.18`.

Mốc chạy Compose: **20:45:48–20:47:40, UTC+7**. Report giữ timestamp UTC gốc.
Các tài liệu QA được bổ sung sau lượt chạy; fingerprint trên mô tả source trước
khi bổ sung hồ sơ, không phải SHA commit cuối cùng.

## Thay đổi sau lượt Compose và giới hạn gán kết quả

Lượt Compose/browser ngày 13/11 kiểm tra source chưa commit trên nền `3be4a11`,
sau đó được ghi nhận cùng commit `0a086f2`. Nhánh tiếp nhận `main` qua commit
`3726bace5f43336377fa354ca6c26d2576ea371f`; so với `0a086f2`, ba file thay đổi:

| Nguồn | File | Thay đổi |
|---|---|---|
| PR #9 | `apps/web/Dockerfile` | Tạo và cấp quyền ghi riêng cho `.next/cache`, giữ `USER node` |
| PR #9 | `docs/assignment2/COMPOSE.md` | Ghi kiểm chứng cache của E và điều chỉnh trình bày |
| PR #10 | `.github/workflows/ci.yml` | Đổi checkout/setup-node v4 sang v6 |

Kết quả Compose **8/8**, browser **9/9**, image ID và source/image fingerprint
ở report chỉ thuộc lượt local đã mô tả. Chưa build lại image Web/chạy lại
Compose sau ba thay đổi trên; không gán kết quả đó cho Dockerfile mới,
workflow CI mới, commit `3726bac` hoặc SHA cuối của PR.
Các thay đổi tài liệu bổ sung sau QA cũng không nằm trong fingerprint gốc.

CI là bằng chứng riêng: [run 43444806943](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43444806943)
đã đạt `verify` trên head `3726bace5f43336377fa354ca6c26d2576ea371f`.
Run này không thực thi PostgreSQL, browser hoặc Compose. Sau các chỉnh sửa
review cần kiểm lại `verify` trên đúng head cuối; không tái sử dụng run cũ để
khẳng định CI của head mới đã đạt.

Sau đó `main` còn nhận [PR #12](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/12)
qua merge `8ccf0368e2666e5833970eb3ee8d932f01700d14`, bổ sung job publish GHCR
sau `verify`. Khi nhánh cập nhật thêm mốc này, workflow mới cũng nằm ngoài
phạm vi lượt Compose cũ. Publish GHCR, deployment Railway và smoke production
cần bằng chứng riêng; không suy ra đã đạt từ report local hoặc CI trước đó.

Muốn có evidence Compose cho phiên bản mới, cần build image từ phiên bản đó
và chạy kiểm tra tương ứng. Lượt sửa tài liệu ngày 14/11 giữ nguyên giới hạn
và report gốc, không bổ sung một lượt Docker chưa thực hiện.

## Bằng chứng Compose trực tiếp

[Report và script](testing/checkout-windows-2026-11-13/README.md) lưu ba file
gốc từ máy Windows. `compose-result.json` và `browser-result.json` cùng xác
nhận PASS; log có marker kết thúc; exit code được người thực hiện cung cấp là 0.

| Nhóm | Kết quả được kiểm tra |
|---|---|
| 1 | Ba dịch vụ healthy; DB/backend không publish cổng; đăng ký/đăng nhập thật qua BFF; chặn sai owner/session/origin |
| 2 | Tổng có khuyến mãi; payment thành công; replay cùng key; cộng điểm; hoàn tiền đầy đủ; hủy lặp không lặp hiệu ứng |
| 3 | Outcome FAILED giữ kho/deadline; đổi cấu hình không đổi kết quả key cũ; key mới thanh toán cùng đơn đúng một lần |
| 4 | Marker không có attempt chỉ áp dụng đúng đơn đã kết thúc; không tạo payment mới |
| 5 | CLI build thật kiểm tra cờ, ba cạnh PAID → PREPARING → READY → COMPLETED và chặn hủy muộn |
| 6 | Backend startup xử lý đơn policy 2 thử đã quá hạn và nhả giữ chỗ |
| 7 | Trình duyệt thật 9/9: đăng nhập → menu → món → giỏ → PENDING; reload, mất phản hồi/replay, hoàn tiền, lịch sử và mobile |
| 8 | Stop/start ba dịch vụ giữ nguyên đơn, payment ledger, điểm, kho và phiên đăng nhập |

Sau lượt chạy: cả ba dịch vụ healthy; `MOCK_PAYMENT_OUTCOME=SUCCEEDED`;
fixture được dọn, snapshot tồn kho sản phẩm có sẵn trước/sau trùng nhau.
Không ghi nhận page error trong bộ browser.

## Môi trường Compose

- Project: `brewlite-a2-checkout`; Web `http://localhost:3100`, chỉ bind loopback.
- Backend nội bộ `http://backend:3001`; database `brewlite_a2` tại service `db`.
- Volume: `brewlite-a2-checkout_postgres_data`; cookie `brewlite_a2_session`.
- `CHECKOUT_V2_ENABLED=1`; CLI demo không bật toàn cục. Cờ CLI chỉ bật trong
  tiến trình thử. Không sửa `.env.compose` trong lượt kiểm tra.
- Image API: `sha256:83960bc7324edf613d158107f347cf230e710923433070de0f797c06d6f9645c`.
- Image Web: `sha256:99172636a2b5b088c60a9c484a793f7e68abd584afd42dd97d7dd3a9d8b22db3`.
- Image PostgreSQL: `sha256:665dc7b37ac52a17e298511414c21d23ffa4e6a6ef6225b3e5d59c7afb35e994`.

Ba migration đã deploy và catalog/demo được khởi tạo trước lượt Compose.
Helper không build, migrate, seed hoặc reset; chỉ thao tác fixture riêng và
các container của project A2 đã kiểm tra. Không dùng DB PostgreSQL trên host.

## Các kiểm tra Windows trước Compose

Các kết quả dưới đây dựa trên output terminal người thực hiện đã cung cấp;
không có đầy đủ raw log Windows của chúng trong thư mục evidence Compose.
Giữ nguyên [QA chuẩn bị Linux](testing/checkout-preparation-2026-11-13/README.md)
với môi trường và giới hạn riêng, không đổi nhãn log Linux thành Windows.

| Kiểm tra | Kết quả terminal |
|---|---|
| Typecheck web/api; lint web; build web/api | Đạt, mã 0 |
| Unit web / API | 970/970 và 190/190, không fail/skip |
| Setup config | 8/8; chạy trước lượt cập nhật dependency |
| PostgreSQL riêng `brewlite_a2_test` trên host | Ba migration; workflow 28/28; cleanup fixture riêng |
| Legacy trong schema test riêng | Digest cột gốc trước/sau trùng; replay/read-only đạt; schema đã dọn |
| HTTP/BFF production local | 9/9; lượt bật browser đạt 10/10, gồm browser 9/9; cleanup đạt |
| Tên sản phẩm trên API Compose | `coffee-milk` và `peach-tea` đạt UTF-8; chữ sai trong PowerShell không được dùng làm căn cứ sửa dữ liệu |

## Dependency và sự cố môi trường

Trong quá trình tích hợp, NestJS common/core/platform-express được đồng bộ
từ 12.1.3 lên **12.5.0**; audit fix cập nhật dependency tương thích.
Next.js giữ **16.4.2**. Typecheck, lint, unit và build được chạy lại đạt sau
lượt cập nhật. Theo output audit đã cung cấp: production (`--omit=dev`) 0
vulnerability; full audit còn nhóm moderate của minimatch qua tooling dev.
Không coi đây là tuyên bố toàn bộ dependency không còn rủi ro; override thử
không có tác dụng đã được bỏ, không dùng `audit fix --force` để chốt lượt QA.

Image A2 ban đầu chứa file config/build rỗng, gây lỗi Prisma thiếu datasource
và Next không đọc được config. File tương ứng trên host có nội dung. Sau khi
rebuild riêng backend/frontend với `--no-cache`, migration và startup đạt;
lượt Compose này kiểm tra lại source trong các image đang chạy. Chưa kết luận
nguyên nhân gốc của các file rỗng chỉ từ việc ổ đĩa từng thiếu dung lượng.

## Kết luận trong phạm vi

Checkout A2 đã qua kiểm chứng chức năng local trên Windows và Compose nêu trên.
Nhánh đã commit/push và đang xử lý review PR #11. CI và Compose được ghi
riêng theo phiên bản, không suy kết quả local cũ thành chứng cứ cho SHA mới.
Kết quả này chưa thay cho nghiệm thu toàn bộ 59 AC, GitHub CI của commit cuối,
kiến trúc/ADR còn lại, CD/HTTPS production, release hoặc việc giảng viên chấp nhận A2.
