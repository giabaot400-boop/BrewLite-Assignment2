# Runbook production Railway — nâng lên bản checkout và rollback (ĐỀ XUẤT)

Cập nhật 15/11/2026 (B). Đây là **đề xuất** để E thực hiện và xác nhận; chưa có bước nào trong tài liệu này được chạy trên production.
Mô tả hiện trạng và cấu hình Railway nằm ở `DEPLOYMENT.md` ([PR #3](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/3)) và bằng chứng
kiểm chứng ở `RAILWAY_VERIFICATION.md` ([PR #15](https://github.com/giabaot400-boop/BrewLite-Assignment2/pull/15)); hai file này chưa merge vào main khi viết.
Ô "Kết quả thật" trong các bảng để trống cho tới khi E chạy và ghi đúng.

## 1. Hiện trạng production (theo PR #15, 14/11/2026)

| Mục | Giá trị |
|---|---|
| Source đang chạy | `0bea2e2015c54cf23cb1d3b9f32bc146d2891136`, trước checkout Sprint 3 |
| Migration đã áp dụng | 2: `init_products`, `sprint2_auth_orders` |
| Dữ liệu | 4 sản phẩm, 2 topping, 1 đơn PENDING (`7c13e6f8-0b0e-4df3-bba3-a05c7b187001`, 57.000đ) |
| Cách deploy | Thủ công, image GHCR theo digest; chưa có CD |
| Chưa kiểm chứng | Thanh toán, hủy, expiry, rollback, backup/restore, restart PostgreSQL |

Bản đích là main `4c177bf`: ba migration, workflow thanh toán/hủy/hết hạn, giỏ v2. Digest do CI ghi tại [run 43549055750](https://github.com/giabaot400-boop/BrewLite-Assignment2/actions/runs/43549055750);
đối chiếu lại trên trang Actions trước khi dùng (B chưa pull các image này).

| Image | Digest (theo bản rà của A) |
|---|---|
| API `sha-4c177bf…` | `sha256:deb2b1af714ddaeb2951242dc80823c42ba0e42b749d33b1c42a932e2ba97420` |
| Web `sha-4c177bf…` | `sha256:39d94c5bd7a9c0149f2ec4c77e367bb2de80324ef6009b41335f2cf6ba5d4094` |

## 2. Ba điểm phải xử lý trước khi nâng bản

### 2.1 Migration thứ ba làm tồn kho về 0

`20261109010714_sprint3_payment_stock` thêm cột `products.stock` với mặc định 0. Sau migration, mọi sản phẩm có tồn 0 nên **tạo đơn mới sẽ bị từ chối vì hết hàng**
cho tới khi cấp tồn. Nếu không chuẩn bị bước này, nâng bản xong mà checkout không dùng được.

`seed-demo.ts` với `INIT_DEMO_STOCK=true` **không dùng được trên production**, vì hai guard trong code:
- Chỉ cho phép host `localhost`, `127.0.0.1`, `::1` hoặc `db` (`assertA2DemoTarget`).
- Từ chối khi đã có đơn hoặc tồn khác 0; production đã có một đơn.

Không sửa hoặc bỏ guard, không xóa đơn cũ. Đề xuất một bước cấp tồn có kiểm soát, E chạy một lần sau khi sao lưu, C/D duyệt trước. Tương đương ý nghĩa của seed
(tồn 10, tăng `stock_version` 1), chỉ chạm sản phẩm chưa có tồn và chưa bị giữ chỗ:

```sql
-- ĐỀ XUẤT, chưa chạy. Xem trước số dòng bị ảnh hưởng bằng SELECT cùng điều kiện.
UPDATE products
SET stock = 10, stock_version = stock_version + 1
WHERE id IN ('coffee-milk', 'americano', 'cappuccino', 'peach-tea')
  AND stock = 0 AND reserved_stock = 0;   -- kỳ vọng: 4 dòng
```

Ghi lại tồn trước và sau, và số dòng bị cập nhật, vào bảng kết quả ở mục 5.

### 2.2 Đơn PENDING cũ thành đơn policy 1

Migration giữ đơn hiện có với `checkout_policy_version = 1`, `subtotal = total`, không có hạn thanh toán. Đơn này **chỉ để đọc**: thanh toán hoặc hủy sẽ trả
`LEGACY_ORDER_REQUIRES_REVIEW`. Đây là bằng chứng giữ dữ liệu cũ, không phải lỗi. Kiểm tra checkout mới bằng một đơn mới (policy 2), không cố thanh toán đơn cũ.

### 2.3 Cờ và biến runtime của Web

- `CHECKOUT_V2_ENABLED=1` trên service Web (đọc lúc chạy, phía server). Mặc định là 0 nên không thấy nút thanh toán nếu thiếu cờ.
- Chuyển v1 → v2 là một chiều. Kiểm tra bằng trình duyệt hồ sơ mới hoặc đóng mọi tab cũ; không tắt cờ sau khi người dùng đã chuyển sang v2.
- Giữ `PORT=3000`, target port 3000, `APP_ORIGIN` và `FRONTEND_ORIGIN` đúng domain Railway như hiện tại.
- API: giữ `MOCK_PAYMENT_OUTCOME=SUCCEEDED` (mặc định) và `DEMO_WORKFLOW_ENABLED=false` trên production.

## 3. Các bước nâng bản (đề xuất thứ tự)

| # | Bước | Điều kiện chuyển bước | Kết quả thật |
|---|---|---|---|
| 1 | Ghi lại digest và deployment ID đang chạy (API, Web) để rollback | Có đủ 4 giá trị | |
| 2 | Sao lưu database (cách E xác nhận: backup Railway hoặc `pg_dump`) và kiểm tra bản sao đọc được | File/bản sao tồn tại, kích thước hợp lý | |
| 3 | Đặt API lên digest `4c177bf`; pre-deploy chạy `npm exec --workspace apps/api -- prisma migrate deploy` | Log: áp dụng migration `20261109010714_sprint3_payment_stock`, không lỗi | |
| 4 | Cấp tồn theo mục 2.1 | 4 dòng cập nhật, tồn = 10 | |
| 5 | Đặt `CHECKOUT_V2_ENABLED=1`, đặt Web lên digest `4c177bf` | Web Active, healthcheck `/` OK | |
| 6 | Smoke sau triển khai (mục 4) | Tất cả đạt | |
| 7 | Ghi digest, deployment ID, kết quả vào mục 5 và `HANDOVER.md` | Đã ghi | |

Nếu bước 3 hoặc 6 lỗi: dừng, không chạy các bước sau, xem mục 6.

## 4. Smoke sau triển khai

Chỉ kiểm tra qua Web (API và DB là private). Dùng tài khoản thử riêng; không dùng dữ liệu thật.

1. `GET /` trả 200; `GET /api/products` trả 200 với 4 sản phẩm.
2. Đăng nhập, thêm Cà phê sữa size L + Kem + Trân châu (57.000đ), tạo đơn: PENDING, có hạn thanh toán.
3. Thanh toán bằng Ví: PAID; điểm cộng theo tổng/10.000.
4. Tạo đơn thứ hai rồi hủy khi PENDING: CANCELLED, tồn trả lại.
5. Đơn cũ `7c13e6f8…` vẫn đọc được, còn PENDING; không thanh toán thử.
6. Tải lại trang không tạo thêm đơn.

Chưa nằm trong smoke này: restart PostgreSQL, backup/restore, hết hạn thanh toán thật (15 phút), tải đồng thời.

## 5. Bảng ghi nhận khi thực hiện (E điền)

| Mục | Giá trị |
|---|---|
| Ngày, người thực hiện |  |
| Digest và deployment ID trước nâng (API, Web) |  |
| Digest và deployment ID sau nâng (API, Web) |  |
| Cách và vị trí sao lưu |  |
| Log migration |  |
| Tồn trước và sau, số dòng cập nhật |  |
| Kết quả từng bước smoke (1–6) |  |
| Vấn đề phát sinh và cách xử lý |  |

## 6. Rollback

**Quy tắc:** quay lại bằng digest đã duyệt, chỉ khi tương thích schema. Không tự đảo migration, không restore đè dữ liệu production nếu chưa có người duyệt.

| Tình huống | Cách xử lý | Lưu ý |
|---|---|---|
| Lỗi trước khi migration áp dụng (bước 3 thất bại ở bước pull/khởi động) | Đặt lại API về digest cũ | Schema chưa đổi, an toàn |
| Lỗi sau migration, cần quay về `0bea2e2` | **Không khuyến nghị.** Cột `orders.subtotal` là NOT NULL không có mặc định, nên bản `0bea2e2` không biết cột này và **tạo đơn mới sẽ lỗi** (đọc vẫn được) | Muốn quay về bản cũ đầy đủ phải restore từ bản sao ở bước 2, có người duyệt, chấp nhận mất dữ liệu sau thời điểm sao lưu |
| Lỗi sau migration, bản `4c177bf` có lỗi nhỏ | Triển khai bản sửa tiếp theo (digest mới) thay vì quay lại | Đây là đường rollback thực tế |
| Web lỗi, API ổn | Đặt Web về digest trước; giữ `CHECKOUT_V2_ENABLED` như đã chọn | Tránh tắt cờ khi người dùng đã chuyển v2 |

Tài liệu và kịch bản restore chưa được thử. Trước khi tuyên bố có rollback, cần một lượt restore thử trên database riêng và ghi kết quả.

## 7. Việc E/B cần chốt

- Cách sao lưu và khôi phục thật sự có trên Railway (E xác nhận); thử restore trên database riêng.
- Người duyệt bước cấp tồn (C/D) và người duyệt rollback (nhóm).
- Dọn service PostgreSQL 18 ban đầu sau khi xác nhận không dùng; kiểm tra chi phí volume còn lại.
- Nối các bước này vào job deploy của CI sau khi chạy tay thành công: xem [CD_DEPLOY_PLAN](CD_DEPLOY_PLAN.md).
