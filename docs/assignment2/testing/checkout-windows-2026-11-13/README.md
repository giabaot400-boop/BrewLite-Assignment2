# Bằng chứng checkout A2 trên Windows / Compose

Lượt chạy 13/11/2026, 20:45:48–20:47:40 UTC+7 (report gốc dùng UTC).
Repository `giabaot400-boop/BrewLite-Assignment2`, nhánh
`integration/a2-checkout-e2e`, nền HEAD `3be4a11847f479ac87d1c3321009433d3850afb9`
cộng thay đổi chưa commit. 347 source fingerprint được lưu trong report.

## Kết quả

- Compose 8/8; browser 9/9; không page error.
- Sau stop/start, ba dịch vụ healthy và dữ liệu/phiên thử được giữ nguyên.
- Cleanup đạt; tồn kho sản phẩm có sẵn trước/sau trùng nhau; outcome cuối SUCCEEDED.
- Exit code terminal do người thực hiện cung cấp: 0.

Ba file `compose-result.json`, `run.txt`, `browser-result.json` được sao
nguyên byte từ ZIP report người thực hiện gửi, không tạo lại kết quả.
Report không chứa mật khẩu fixture, cookie, JWT hoặc DATABASE_URL.
Không đưa `.env`, backup VHD/database hoặc screenshot vào bộ hồ sơ này.

## Tái lập

Script và guard trong `scripts/` là helper đã gửi để chạy lượt này. Từ gốc
repository, khi project `brewlite-a2-checkout` đã healthy và cấu hình như
[QA Windows](../../CHECKOUT_WINDOWS_QA.md):

```powershell
node docs/assignment2/testing/checkout-windows-2026-11-13/scripts/BrewLite_A2_Compose_Check.cjs .
```

Script tạo report cạnh helper; sau khi script đã được đưa vào repo, nên sao
cả helper và guard ra thư mục ngoài repo trước khi chạy để giữ checkout gọn.
Không thao tác ứng dụng đồng thời. Không cần chạy lại lượt đã đạt chỉ để chép
QA. Guard có 26 bài kiểm tra; chạy riêng bằng `node --test` nếu thay guard.

`browser-menu-runner.mjs` khớp SHA-256 của bản thực thi ghi trong report,
được tái lập từ runner source và đúng hai thay đổi helper đã áp dụng: resolve
Playwright từ repository và đi từ menu tới product. Bản này giữ đường dẫn
Windows của lượt gốc; để chạy ở checkout khác, dùng helper tạo runner mới.

Xem [kết luận và giới hạn](../../CHECKOUT_WINDOWS_QA.md). Không dùng lượt local
này như chứng cứ GitHub CI, HTTPS production hoặc nghiệm thu toàn bộ AC.

## Tái lập hash tổng manifest mà không chạy Docker

Thuật toán nằm trong `scripts/BrewLite_A2_Compose_Check.cjs`, ở dòng gán
`report.sourceManifestSha256`: SHA-256 của UTF-8 `JSON.stringify(report.sourceFiles)`.
Mảng được tạo từ danh sách file Git (tracked và untracked không bị ignore),
loại trùng, sắp xếp theo tên file; từng entry giữ thứ tự thuộc tính
`file`, `bytes`, `sha256` (hoặc `file`, `missing` nếu đã bị xóa).
Hash từng file source dùng byte gốc; không chuẩn hóa CRLF cho manifest này.
Chuẩn hóa CRLF/JSON chỉ áp dụng ở bước đối chiếu source trong image riêng.

Từ gốc repo chạy đoạn PowerShell đọc report đã lưu, không ghi file hoặc gọi Docker:

```powershell
@'
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const report = JSON.parse(fs.readFileSync(
  'docs/assignment2/testing/checkout-windows-2026-11-13/compose-result.json', 'utf8'
));
const actual = createHash('sha256')
  .update(JSON.stringify(report.sourceFiles), 'utf8').digest('hex');
if (actual !== report.sourceManifestSha256) {
  throw new Error('Stored source manifest hash mismatch.');
}
console.log('FILES:', report.sourceFiles.length);
console.log('SHA256:', actual);
console.log('STORED_SOURCE_MANIFEST_HASH_PASSED');
'@ | node
```

Kết quả mong đợi: 347 file và
`28a047822fbaf4cb5e91e93712a66dd1bbc221e123c2924abd86b8da5d995dae`.
Đoạn này kiểm tra hash tổng của mảng được lưu trong report; không chứng minh
source hiện tại trùng bản QA cũ. Khi đối chiếu từng file với checkout mới cần
xét các sửa đổi sau QA, đặc biệt ba file từ #9/#10 và tài liệu đã bổ sung;
xem [ranh giới bằng chứng](../../CHECKOUT_WINDOWS_QA.md#thay-đổi-sau-lượt-compose-và-giới-hạn-gán-kết-quả).

## SHA-256

| File | Byte | SHA-256 |
|---|---:|---|
| `browser-result.json` | 491 | `a04a2376b73f817978ae25aaee33d59799f603dda0fe692eb2ba69a097939112` |
| `compose-result.json` | 72636 | `67c163471b33f4986b614a504ab818765bbcc603d633f5b0e8f87cb79ad30642` |
| `run.txt` | 2809 | `c48cdef51b0e5006fc7694d41c0af2359c6b96726d6d07937e05c3f7d788d5aa` |
| `scripts/BrewLite_A2_Compose_Check.cjs` | 30211 | `e5ed0559dbf2d6ea69dbfd89deb7ec9c55d9615a457de3d05f35cfc053966190` |
| `scripts/a2-compose-guards.cjs` | 4965 | `7a7b5be1dfb704e4f30c52bd52e64f4821120c9156c30a9fd10b3b9393b7d4ea` |
| `scripts/a2-compose-guards.test.cjs` | 4563 | `138b75670a48c4e9059ec451fb1099fe96f531ad0a5246fee0dbf7c4745c1c5b` |
| `scripts/browser-menu-runner.mjs` | 6449 | `8a8fcc8f7b81cf9cae7fe9348d4a7f9ee1ff0d19bb66a69cba8b2186be1e26e7` |
