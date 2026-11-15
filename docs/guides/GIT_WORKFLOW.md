# Làm việc với Git — Assignment 2

Repository A2: https://github.com/giabaot400-boop/BrewLite-Assignment2.
Source A1 ở [BrewLite](https://github.com/giabaot400-boop/BrewLite), có lịch sử
và PR riêng. Xem [nguồn kế thừa](../assignment2/SOURCE_PROVENANCE.md).

## Kiểm tra đúng repo trước khi làm

```powershell
Set-Location D:\cnpm\brewlite-a2
git remote -v
git status --short --branch
```

`origin` phải trỏ tới `BrewLite-Assignment2.git`. Giữ source A1 ở thư mục khác.
Tên package npm kế thừa giống nhau không có nghĩa hai bản tự đồng bộ.

## Nhánh và PR

Khi repo A2 đã có main trên GitHub, bắt đầu công việc mới từ main đã cập nhật:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/ten-cong-viec
```

Commit phần việc, chạy kiểm tra phù hợp rồi push nhánh và mở PR tại repo A2.
Mô tả vấn đề, thay đổi, cách kiểm tra và giới hạn. Một thành viên khác review
trước merge; không chuyển approval A1 thành approval A2.

Khi cần cập nhật main, giữ working tree sạch hoặc lưu phần đang làm trước:

```powershell
git -c gc.auto=0 fetch origin
git merge origin/main
```

Nếu conflict, đối chiếu nội dung với người sửa cùng file; không ghi đè cả file
chỉ để hết báo lỗi. Không force-push main hoặc tạo lại lịch sử để thay nghiệm thu.

## Nhận bản sửa từ A1

A1 tiếp tục Sprint 3 ở repo riêng. Khi A2 cần một thay đổi, người tích hợp xác
định commit và phụ thuộc, đưa sang nhánh A2, ghi URL/SHA nguồn trong PR rồi kiểm
tra ở môi trường A2. Không merge mù toàn bộ nhánh A1 hoặc giả định PR đang mở
đã có trong source A2. Reviewer đối chiếu contract, schema/migration và UI/BFF.

## Cấu hình và bằng chứng

`.env`, `.env.test`, JWT secret và database local không được chuyển qua Git.
Dùng mẫu của A2 và tạo database riêng. Không commit node_modules, .next, dist
hoặc Prisma Client đã sinh. Log/test ghi đúng repo, SHA, môi trường và kết quả;
reuse bằng chứng A1 phải nêu rõ giới hạn thay vì đổi nhãn thành PASS A2.

## Quy ước thông điệp commit

Đề xuất của B, nhóm xác nhận trước khi áp dụng bắt buộc. Quy ước này mô tả đúng
thói quen đang dùng trong lịch sử repo A2; không viết lại commit cũ.

Định dạng một dòng: `loại(phạm vi): mô tả ngắn, thể mệnh lệnh`

| Loại | Dùng cho | Ví dụ trong lịch sử |
|---|---|---|
| `feat` | Tính năng hoặc tích hợp mới | `feat(a2): add Docker Compose and private product API routing` |
| `fix` | Sửa lỗi | `fix(a2): allow node user to write Next.js cache` |
| `docs` | Chỉ tài liệu hoặc bằng chứng | `docs(a2): ghi bằng chứng CI xanh/đỏ và trạng thái branch protection` |
| `ci` | Workflow GitHub Actions | `ci: gate GHCR publish behind verify` |
| `chore` | Cấu hình, repo, việc không đổi hành vi | `chore(a2): establish independent source and local configuration` |
| `test` | Chỉ thêm hoặc sửa test | `test(a2): cover payment replay after restart` |

Quy tắc:

- Phạm vi ngắn (`a2`, `web`, `api`, `ci`), có thể bỏ nếu không cần. Mô tả dưới khoảng 72 ký tự.
- Dùng tiếng Việt hoặc tiếng Anh nhất quán trong cùng một PR; giữ nguyên tên file, mã AC, SHA.
- Một commit một mục đích. Không gộp sửa code và đổi tài liệu không liên quan.
- Thân commit (nếu cần) giải thích lý do, ghi PR/issue hoặc SHA nguồn khi tiếp nhận thay đổi từ A1.
- Không ghi trong thông điệp rằng test đã đạt nếu chưa chạy; kết quả nằm trong mô tả PR theo mẫu.
- Merge commit do GitHub tạo (`Merge pull request #N ...`) giữ nguyên, không chỉnh tay.
