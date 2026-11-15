# A2 - Bố cục responsive và bàn phím, Windows ngày 14/11/2026

Người thao tác: A. Bản ghi tổng hợp từ các xác nhận A gửi trong phiên hướng dẫn. Các thao tác dưới đây là thủ công, không có ảnh mới, video liên tục, HAR, log Network/SQL hoặc bản ghi focus tự động kèm theo. Không có giờ bắt đầu/kết thúc chính xác; ngày theo Việt Nam (UTC+7).

## Môi trường và nguồn

- Repository A2: `BrewLite-Assignment2`, thư mục `D:\cnpm\brewlite-a2`.
- Trước lượt này A đã push nhánh `docs/a2-pwa-local-qa` tại `b86e51d2e1a7654f06cab24d20a2f5b9269ba656`. Đây là mốc tài liệu trên đĩa, không là SHA build của image đang chạy.
- Docker Linux containers, Compose project `brewlite-a2-checkout`, `.env.compose`. Ba container cũ được `start --wait`, A xác nhận mở lại menu được; không build/recreate/seed trong lượt hướng dẫn này.
- Cùng bộ Compose local ở `http://localhost:3100` với [lượt PWA trước đó](../pwa-windows-2026-11-14/README.md). Full image ID đã ghi ở lượt đó; lượt responsive không chạy lại `docker inspect`, không khẳng định đây là image GHCR mới.
- Chrome theo phiên bản A đã cung cấp trong cùng ngày: `157.0.8103.51` Stable, 64 bit. Không lấy lại `chrome://version` trong lượt responsive.
- Responsive bằng Chrome DevTools, nhập kích thước CSS viewport `360x800`, `768x1024`, `1366x768`. Đây là mô phỏng viewport trên Windows; không phải thiết bị điện thoại/tablet thật, không có kiểm chứng bàn phím ảo hoặc mobile browser thật.
- Các màn hình chính dùng tab Chrome thường cùng profile đăng nhập; form Đăng nhập/Đăng ký dùng cửa sổ ẩn danh để giữ phiên đang thử ở cửa sổ thường. Không gán các quan sát form ẩn danh thành cài PWA trong chế độ ẩn danh.
- Sau khởi động, giỏ báo đang thuộc tài khoản khác hoặc phiên trước. A đăng nhập lại thì giỏ mở bình thường; không có log phiên để kết luận nguyên nhân chắc chắn là JWT hết hạn. Không xóa storage để xử lý.

Nguồn tiêu chí: [SRS NFR-06 và NFR-12](../../../requirements/srs.md). Kết quả là quan sát trong trình tự cụ thể, không thay toàn bộ AC hoặc tiêu chuẩn accessibility đầy đủ.

## Bố cục theo viewport

Trong các màn hình được đánh dấu đã xem, A xác nhận không thấy tràn ngang, chồng/cắt chữ gây cản trở thao tác hoặc nút chính bị che. Cuộn dọc bình thường được cho phép. Không có số đo bounding box hoặc ảnh đối chứng từng màn hình.

| Màn hình/phần UI | 360x800 | 768x1024 | 1366x768 |
|---|---|---|---|
| Menu, chi tiết món, size/topping và nút thêm giỏ | Đã xem, ổn | Đã xem, ổn | Đã xem, ổn |
| Giỏ: các món, tổng tiền và nút thao tác đang hiển thị | Đã xem, ổn | Đã xem, ổn | Đã xem, ổn |
| Hộp xác nhận tạo đơn | Đã mở/xem rồi Quay lại, ổn | Chưa ghi thao tác mở hộp riêng | Đã thao tác bằng bàn phím ở phần dưới |
| Đơn đang thao tác: mã đơn, bảng giá, trạng thái | Đã xem, ổn | Đã xem, ổn | Đã xem, ổn |
| Hộp xác nhận thanh toán | Đã mở/xem rồi Quay lại, ổn | Đã mở/xem rồi Quay lại, ổn | Đã mở/xem rồi Quay lại, ổn |
| Danh sách đơn và chi tiết đơn | Đã bổ sung xem sau thanh toán cuối, mã dài xuống dòng và bảng giá/trạng thái ổn | Đã xem, ổn | Đã xem, ổn |
| Form Đăng nhập và Đăng ký | Đã xem, ổn | Đã xem, ổn | Đã xem, ổn |
| Validation khi để trống form auth | Đã bấm gửi trống, thông báo rõ/không che nút | Chưa ghi riêng | Chưa ghi riêng |

Tại 360x800, A xác nhận nút tăng/giảm/xóa và các nút trong hộp tạo đơn đều ổn. Tại 768/1366, lượt bố cục chủ yếu dùng đơn đang chờ, nên không suy ra mọi nút chỉnh giỏ đã được bấm trong mọi trạng thái ở từng kích thước.

## Thao tác bàn phím tại 1366x768

| Nhóm | Trình tự theo hướng dẫn và xác nhận A | Kết quả trong phạm vi |
|---|---|---|
| Form auth, cửa sổ ẩn danh | Tab qua ô nhập/nút/liên kết, Shift+Tab đi ngược; Enter liên kết Đăng ký và Tab trong form đăng ký | A xác nhận thao tác đúng hướng dẫn, không lỗi; focus nhìn thấy và không phải dùng chuột để vượt chỗ bị kẹt |
| Hộp đăng xuất, cửa sổ thường | Tab tới Đăng xuất, Enter mở; Tab/Shift+Tab vài vòng; dùng bàn phím chọn hủy/ở lại | A xác nhận focus giữ trong hộp, tới được nút, đóng hộp trả focus về nút Đăng xuất; không thực hiện đăng xuất ở ca này |
| Tạo đơn mới sau đơn cũ hết hạn | Sau khi đơn cũ hết hạn, hướng dẫn đọc lại trạng thái, dùng Tab/Enter mở hộp tạo đơn, Tab/Shift+Tab kiểm hộp rồi Enter Xác nhận tạo đơn một lần | A xác nhận có đơn mới Chờ thanh toán. Không lưu mã đơn, deadline, raw key/body hoặc trace từng phím |
| Phương thức và hộp thanh toán | Tab tới phương thức, phím mũi tên đổi Ví/Thẻ rồi chọn Ví mô phỏng; Enter mở hộp, Tab/Shift+Tab, chọn Quay lại và kiểm trả focus; mở lại, Tab tới Xác nhận rồi Enter một lần | A xác nhận hoàn tất, đơn Đã thanh toán và giỏ trống. Không có capture focus/SQL để chứng minh các side effects đúng một lần từ lượt UI này |

Lượt thanh toán của đơn đầu chưa thử được bằng bàn phím vì đã hết hạn; không ghi ca đó là PASS. A sau đó tạo đơn mới theo hướng dẫn và xác nhận kết quả thanh toán mới. Không lấy đơn mới thay bằng chứng exact-key retry/recovery của đơn hết hạn.

Phím Space chưa có xác nhận riêng trong lượt này. Chưa ghi toàn bộ luồng duyệt menu/chọn tùy chọn/thêm món/sửa số lượng chỉ dùng bàn phím; không tuyên bố toàn bộ AC-NFR-12-1 hoặc keyboard-only end-to-end đã hoàn tất.

## Phạm vi và việc còn mở

- Có bằng chứng thủ công về bố cục của các màn hình/viewport đã liệt kê, liên quan AC-NFR-06-1. Hộp tạo đơn tại tablet còn chưa ghi riêng.
- Có quan sát validation trống auth ở mobile, các nút và tổng tiền ở những màn hình đã xem. Chưa bao phủ toàn bộ loading/empty/validation/network error, double-click hoặc request khi UI đang chờ theo AC-NFR-06-2. Lượt PWA trước đó có quan sát offline riêng, không đổi thành mọi trạng thái ở cả ba viewport.
- Có các thao tác bàn phím/focus đã liệt kê, liên quan NFR-12 (Should); chưa kiểm Space, screen reader, contrast, thứ tự focus toàn ứng dụng hoặc xác nhận WCAG.
- Chưa kiểm Firefox/Safari/Edge hoặc điện thoại/tablet thật. HTTPS production/Railway vẫn chờ lượt deployment riêng.
- Không chạy lại unit/lint/typecheck/build hoặc automation trong lượt thủ công này. CI của commit tài liệu trước đó không thay kết quả CI sau lần bổ sung.
- Thanh toán demo có thể tiêu thụ kho/cộng điểm đúng nghiệp vụ. Không kiểm kê SQL hoặc cleanup cuối; không ghi tồn kho giữ nguyên.
- A1 và A2 có hồ sơ riêng. Không dùng lượt này để bổ sung M10 của demo A1 hoặc tự nghiệm thu toàn bộ 59 AC/Task 3-5 A2.

Các mục thiếu được giữ công khai để reviewer quyết định phần cần bổ sung; không biến xác nhận “không thấy lỗi” thành cam kết mọi tổ hợp UI/phiên/thiết bị đều đúng.
