# A2 - PWA local thủ công ngày 14/11/2026

Người thao tác: A, trên máy Windows bằng Chrome/PWA. Trợ lý hướng dẫn và tổng hợp từ lời xác nhận, ảnh giao diện và output PowerShell A cung cấp trong trao đổi. Đây là bản ghi thủ công, không phải log automation hoặc lượt chạy CI. Không có HAR, video liên tục, raw Network/SQL hoặc giờ bắt đầu/kết thúc chính xác. Ngày theo Việt Nam (UTC+7).

## Phiên bản và ranh giới bằng chứng

| Metadata | Giá trị A cung cấp |
|---|---|
| Repo/thư mục | BrewLite-Assignment2; `D:\cnpm\brewlite-a2` |
| Git HEAD khi lấy metadata | `4c177bfb42ae5cfd709a8587e58f67d3922a6fad` |
| Compose project | `brewlite-a2-checkout`, dùng `.env.compose` |
| Truy cập | `http://localhost:3100`; frontend publish `127.0.0.1:3100->3000/tcp` |
| Chrome | `157.0.8103.51`, phiên bản chính thức Stable, 64 bit |
| Frontend image reference | `brewlite-a2-web:local` |
| Frontend image ID | `sha256:99172636a2b5b088c60a9c484a793f7e68abd584afd42dd97d7dd3a9d8b22db3` |
| Frontend container Created (UTC) | `2026-11-13T12:59:21.416098872Z` |
| Backend image reference | `brewlite-a2-api:local` |
| Backend image ID | `sha256:83960bc7324edf613d158107f347cf230e710923433070de0f797c06d6f9645c` |
| Backend container Created (UTC) | `2026-11-13T13:46:43.18794931Z` |
| DB | Container dùng `postgres:17-bookworm`; không lấy image ID mới trong lượt này |
| Trạng thái trước thử | db/backend/frontend đều healthy sau `start --wait` |
| Viewport | Chưa ghi kích thước; không dùng lượt này để kết luận toàn bộ NFR-06 |

Hai mốc Created là thời điểm tạo container do `docker inspect` trả về, không phải thời điểm build image. Git HEAD là source trên đĩa khi lấy metadata; container/image đã có từ 13/11. Lượt này chỉ start lại, không rebuild image, không seed/reset DB. Không gán kết quả cho image GHCR build từ main `4c177bf`, PR #9/#10/#12/#13 hoặc mọi thay đổi nhận sau thời điểm tạo image. Image ID local không được đổi nhãn thành registry RepoDigest.

Lượt Compose 13/11 có hồ sơ nguồn/fingerprint riêng tại [CHECKOUT_WINDOWS_QA](../../CHECKOUT_WINDOWS_QA.md). Giữ ranh giới từng lượt; bản ghi này không thay hoặc sửa các report gốc.

## Quan sát thực tế

Các mã P01-P13 chỉ là nhãn tra cứu thao tác, không là tổng unit test hoặc AC mới. Kết quả dưới đây đạt trong tình huống A đã thử; không suy ra mọi nhánh offline/recovery đều đạt.

| Mã | Thao tác và quan sát A xác nhận | Kết quả/giới hạn |
|---|---|---|
| P01 | Application/Manifest có tên và icon đúng; `/sw.js` activated/running | Đạt theo quan sát; không lấy riêng response header trong browser |
| P02 | Cài ứng dụng và mở BrewLite thành cửa sổ riêng | Đạt local trên Chrome nêu trên |
| P03 | Network Offline rồi tải lại | Hiện trang offline chung BrewLite thay cho trang lỗi mạng Chrome |
| P04 | Cache Storage có một cache; ảnh danh sách có `/icons/icon-192.png`, `/icons/icon-512.png`, `/offline.html` | Không thấy HTML ứng dụng hoặc API trong danh sách đã quan sát; tên cache chưa được chụp/ghi đầy đủ |
| P05 | Có giỏ, thử xác nhận tạo đơn khi Offline | Banner offline và “Không kết nối được máy chủ”; giỏ vẫn hiển thị, không báo tạo đơn thành công. Không có HAR để kết luận số request bị chặn |
| P06 | Xóa Network log, bật mạng lại, không bấm tạo đơn/tải lại và quan sát theo hướng dẫn chờ khoảng 10 giây | A không thấy POST tạo đơn tự xuất hiện trong khoảng quan sát; không phải chứng minh không bao giờ có request ở mọi điều kiện |
| P07 | Online, bấm “Tạo và xem đơn”, rồi “Xác nhận tạo đơn” trong hộp | Hiện “Đơn đang thao tác”; chưa thanh toán. Không ghi mã đơn hoặc SQL trong lượt này |
| P08 | Online mở hộp “Xác nhận thanh toán”, chọn Offline trước khi bấm “Xác nhận” cuối | A báo đơn vẫn trạng thái cũ, phía trên hiện lỗi không kết nối được máy chủ; không báo PAID |
| P09 | Xóa Network log, bật mạng lại và không thao tác thanh toán/tải lại | A không thấy POST `/api/payments` tự xuất hiện trong khoảng quan sát theo hướng dẫn |
| P10 | Online, chủ động đọc lại trạng thái rồi thanh toán Ví mô phỏng qua hộp xác nhận; F5 và mở lại đơn trong lịch sử | A xác nhận “Đã thanh toán”, giỏ trống; sau F5 vẫn đúng và không thấy POST thanh toán tự phát. Không có capture key/body hoặc SQL/ledger để kết luận exact-key/side effects một lần từ lượt này |
| P11 | Kiểm tra Cache Storage lại sau tạo đơn và thanh toán | A xác nhận vẫn chỉ ba đường dẫn public ở P04 |
| P12 | A thêm món rồi đăng xuất, đăng nhập B khác, xem giỏ/lịch sử | A xác nhận B có giỏ trống và không thấy các đơn của A; không là kiểm thử cookie race/late response hoặc truy cập trực tiếp ID A bằng B |
| P13 | Ở B, mở giỏ, Offline rồi tải lại | A xác nhận trang offline chung, không hiện dữ liệu A; sau thử được hướng dẫn trả Network về No throttling |

Ảnh cache và lỗi tạo đơn nằm trong trao đổi với A, chưa đính kèm repository. Output `docker compose ps`/`docker inspect` cũng do A gửi; bảng metadata là bản chép lại, không là raw log thu tự động.

## Luồng xác nhận đã đối chiếu code

“Tạo và xem đơn” chỉ mở hộp; phải bấm “Xác nhận tạo đơn” mới chạy submit. Thành công hiển thị “Đơn đang thao tác” ngay trong trang giỏ. “Xác nhận thanh toán” đọc lại phiên/đơn rồi mở hộp; nút “Xác nhận” trong hộp mới chạy payment submit. Không bỏ qua hộp xác nhận khi tái lập P07-P10.

Code tham chiếu trên main lúc rà là `4c177bf`: `checkout-v2-panel.tsx`, `cart-checkout-client-v2.ts`, `cart-payment-client-v2.ts` và `public/sw.js`. Client xác minh phiên trước khi gửi mutation, worker bypass API/non-GET. P05/P08 phù hợp nhánh mất mạng trước khi POST; lượt này không thu trace để chứng minh chi tiết thứ tự request trên image đang chạy. Không gọi đây là nhánh đã commit rồi mất response.

## Cảnh báo và việc chưa kiểm

Manifest cảnh báo thiếu screenshots cho richer install UI desktop/mobile. A vẫn cài/mở app thành công ở P02. Chưa bổ sung screenshot hoặc thay manifest để xử lý cảnh báo trong lượt này.

- HTTPS production/Railway và cài app trên URL deployment: chưa kiểm.
- Viewport mobile/tablet/desktop theo SRS, bàn phím/focus/accessibility: chưa ghi trong lượt này.
- Đã gửi create/payment rồi mất response, recovery đúng key/body dưới worker; đổi phiên đồng thời: chưa kiểm trong lượt PWA này. Đối chiếu evidence A2 hiện có trước khi quyết định bổ sung; không gán kết quả A1 sang A2.
- Không chạy lại lint/unit/build/PostgreSQL/Compose automation. Không kết luận toàn bộ 59 AC, AC-NFR-07-1/2 hoặc Task 3-5 đã được nghiệm thu.
- Demo tạo/thanh toán có thể thay kho/điểm đúng nghiệp vụ; không có kiểm kê SQL/cleanup cuối. Không ghi dữ liệu tồn kho giữ nguyên sau lượt thủ công này.

Không xóa cache/storage/cookie hoặc tắt writer v2 để làm sạch bằng chứng. Khi kiểm tiếp, bật mạng bình thường và dùng đúng môi trường A2; A1 giữ hồ sơ riêng.
