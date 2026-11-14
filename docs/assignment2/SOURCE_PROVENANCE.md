# Nguồn kế thừa và ranh giới hai repository

Cập nhật ngày 10/11/2026. Theo yêu cầu giảng viên do PO thông báo, Assignment 1
và Assignment 2 có hai repository và hai bộ source riêng. Đây là thay đổi cách
tổ chức bàn giao, không thêm chức năng hoặc đổi chính sách checkout.

| Phạm vi | Repository | Thư mục local ví dụ |
|---|---|---|
| A1 — ba Sprint BrewLite | [BrewLite](https://github.com/giabaot400-boop/BrewLite) | `D:\cnpm\brewlite` |
| A2 — Task 1–5 | [BrewLite-Assignment2](https://github.com/giabaot400-boop/BrewLite-Assignment2) | `D:\cnpm\brewlite-a2` |

Mỗi repo chứa đầy đủ `apps/web`, `apps/api`, workspace/lockfile, tài liệu và mẫu
cấu hình để cài/chạy độc lập. A2 không dùng symlink, submodule hoặc đường dẫn
chạy code từ thư mục A1. Dependency và file cấu hình được tạo riêng trên máy;
không đưa secret vào Git. Mặc định A2 dùng database `brewlite_a2`, cookie phiên
`brewlite_a2_session` và một profile browser riêng cho giỏ/pending.

## Bổ sung checkout trên nền A2 3be4a11

Nguồn ứng dụng được nhận từ A1 `3a70df65ee5f65af49a1c3eaa080415cf30f6097`;
cây apps trùng mốc `88b4e12`. Nền A2 là
`3be4a11847f479ac87d1c3321009433d3850afb9`, đã có CI và Docker A2.
Tiếp nhận các file ứng dụng/test liên quan checkout cùng migration mới;
giữ Docker/Product routing, test và cấu hình độc lập của A2.

[Hồ sơ tích hợp](CHECKOUT_INTEGRATION.md) ghi phần điều chỉnh, kiểm tra và
những mục còn chờ. Kết quả chuẩn bị thuộc nền cộng patch, chưa có SHA A2
mới; không đổi thành lượt chạy ở commit nền hoặc kết quả người dùng Windows.
Script kiểm kê legacy cũng được tiếp nhận từ `docs/sprint3/testing/a1-final-qa-2026-11-12/scripts/legacy-preservation.mjs` của nguồn A1, điều chỉnh import và guard cho A2. Các mốc bên dưới tiếp tục là lịch sử trước khi nhận checkout.

## Mốc đưa sang A2

| Nguồn | Nội dung và giới hạn |
|---|---|
| A1 main [`69b8011`](https://github.com/giabaot400-boop/BrewLite/commit/69b801165fc0b199ac70fdc3afa75932a82601c9) | Bản source ban đầu; đã có hiệu đính Task 1 qua [PR A1 #42](https://github.com/giabaot400-boop/BrewLite/pull/42) |
| A1 [`c7554b2`](https://github.com/giabaot400-boop/BrewLite/commit/c7554b297a6a1a05d2aa5c0463f0e0e5b1a85038), [PR A1 #47](https://github.com/giabaot400-boop/BrewLite/pull/47) | Mười file Task 2/matrix/trạng thái; PO đã cherry-pick thành commit local A2 `732ca5a`, chưa chuyển review của PR A1 thành review A2 |
| PR A1 [#29](https://github.com/giabaot400-boop/BrewLite/pull/29), [#30](https://github.com/giabaot400-boop/BrewLite/pull/30), [#31](https://github.com/giabaot400-boop/BrewLite/pull/31), [#33](https://github.com/giabaot400-boop/BrewLite/pull/33) | Lịch sử tài liệu Task 1–2, layout apps, kiến trúc frontend và PWA trước khi tách repo |
| Nền S2 `a1a0e4a` | Mốc nghiệp vụ/kiểm thử tham khảo; không phải HEAD A2 và không tự chứng minh AC A2 đạt |

Git giữ lịch sử kế thừa; các commit mới ghi công việc A2 từ lúc tách. PR mang
số của A1 được dẫn đúng URL nguồn, không tạo lại PR hoặc biên bản để giả đã review
trong A2. Nghiệm thu Task 1→5 và hai Sprint A2 theo tạo phẩm/lịch sử thật.

## Trạng thái chức năng và bằng chứng

Bản nền kế thừa có menu, auth, giỏ, tạo đơn PENDING, giao diện đọc đơn và PWA.
Sự có mặt của giao diện/BFF không chứng minh backend reader, checkout V2,
payment, stock/loyalty hoặc CI/CD/production đã tích hợp đủ. Các nhánh Sprint 3
đang phát triển tại A1 chưa tự xuất hiện ở A2; cần chọn commit và rà phụ thuộc.

Các báo cáo S1/S2/S3 A1 và kết quả PWA trước khi tách được giữ để đối chiếu nguồn.
Chúng không được đổi nhãn thành kết quả A2. Mỗi lượt kiểm tra mới ghi repo/SHA,
môi trường, lệnh, expected/actual và giới hạn trong evidence/ma trận tương ứng.
Việc tách giữ nguyên 17 FR, 12 NFR, 59 AC, 14 UC và thiết kế nghiệp vụ hiện tại.

## Kiểm tra local sau khi tách — 10/11/2026

Source A2 được kiểm tra tại commit `f37c1aa7cd9bdddd1ef4baceb0f46b59e40aad1d`,
nhánh `chore/a2-independent-repo`, thư mục `D:\cnpm\brewlite-a2`.
A thực hiện trên Windows/PowerShell với PostgreSQL 17; ứng dụng chạy bằng
`npm run dev` tại frontend `http://localhost:3000` và backend cổng 3001,
cấu hình database riêng `brewlite_a2`.

| Chuẩn bị môi trường | Kết quả do A cung cấp |
|---|---|
| `node --test scripts/setup-env.test.mjs` | 8/8 đạt, không fail/skip; test dùng thư mục tạm |
| `npm run setup` | Đã tạo `apps/web/.env.local` và `apps/api/.env`; working tree vẫn sạch |
| Migration và seed A2 | Hai migration `20261024160346_init_products`, `20261030152601_sprint2_auth_orders` áp dụng thành công; seed báo bốn sản phẩm và hai topping mẫu |

Sau khi khởi chạy source A2, A xác nhận cả bốn nhóm thao tác thủ công sau cho
kết quả đúng theo hướng dẫn:

| Nhóm thao tác | Kết quả quan sát theo A |
|---|---|
| Menu/chi tiết và giỏ | Có bốn món; mở chi tiết, chọn size/topping và thêm vào giỏ được |
| Tài khoản | Đăng ký tài khoản test mới và đăng nhập được |
| Tạo đơn | Chủ động xác nhận từ giỏ, nhận mã đơn và trạng thái PENDING |
| Đăng xuất | Đăng xuất thành công, giao diện trở về trạng thái chưa đăng nhập |

Đây là lượt kiểm tra thủ công phần nền local do A báo lại trong phiên hướng
dẫn; chưa có HTTP log/ảnh hoặc đối soát trực tiếp từng bản ghi database được
lưu kèm. Không diễn giải thành đã đạt toàn bộ AC, test E2E tự động, hiệu năng,
PWA production hoặc Task 1–5. Payment/checkout V2, kho/điểm và luồng Sprint 3
chưa được kiểm chứng trong lượt này. Kết quả gắn với commit ứng dụng nêu trên;
commit bổ sung đoạn ghi nhận này chỉ thay đổi tài liệu.

## Những thay đổi tiếp theo

1. Người phụ trách A1 hoàn thiện/review phần việc tại A1 theo phân công.
2. Lead A2 chọn commit cần kế thừa, kiểm tra dependency, contract và migration;
   đưa sang nhánh A2 và ghi SHA nguồn/đích trong PR. Review và kiểm thử tại A2.
3. CI/CD, deployment, secret, database và release A2 thuộc repo A2; deployment
   diagram và cấu hình phải trỏ đúng source này. Không dùng một URL deploy A1
   làm bằng chứng production A2 nếu chưa có bản A2 được xác định/triển khai.

Sau khi phân tách tài liệu, báo cáo/checklist/ảnh và sơ đồ Sprint A1 không còn
trong cây A2 hiện hành; hồ sơ gốc vẫn ở repo A1 và lịch sử Git. Chỉ giữ
[ba bản tham khảo cần thiết](../reference/a1/README.md); xem [mục lục docs](../README.md).
Không sửa migration cũ, reset database A1 hoặc xóa lịch sử Git chỉ vì tách repo.
