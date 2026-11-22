# Cấu hình lời chúc bằng Google Sheets

## 1. Tạo Spreadsheet

1. Mở Google Sheets và tạo một bảng trống, đặt tên: `Loi chuc cuoi - Ai Duyen & Thanh Nhan`.
2. Đặt tên tab dữ liệu là `Wishes`. Apps Script cũng tự tạo tab nếu chưa tồn tại.
3. Lưu ID Spreadsheet từ URL: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`.
3. Không chia sẻ quyền chỉnh sửa công khai. Chỉ chủ sở hữu hoặc tài khoản quản trị mới cần truy cập Spreadsheet.

## 2. Tạo Apps Script

1. Mở `Extensions -> Apps Script` trong Spreadsheet.
2. Xóa mã mặc định và tạo file `Code.gs`, sao chép toàn bộ nội dung trong `google-apps-script/Code.gs` của dự án.
3. Trong Apps Script, mở `Project Settings -> Script Properties`.
4. Thêm Script Properties:
   - `SPREADSHEET_ID`: ID Spreadsheet ở bước 1.
   - `SPREADSHEET_NAME`: `Loi chuc cuoi - Ai Duyen & Thanh Nhan`.
   - `ADMIN_PASSWORD_SHA256`: SHA-256 của mật khẩu quản trị. Không lưu mật khẩu thô trong Script Property.

Để tạo SHA-256 trên macOS/Linux, chạy:

```bash
printf '%s' 'MAT_KHAU_TUY_CHON' | shasum -a 256
```

Chỉ đặt chuỗi hash 64 ký tự vào `ADMIN_PASSWORD_SHA256`. Không đặt mật khẩu thô hoặc hash trong frontend, `.env`, mã React hoặc Git.

## 3. Triển khai Web App

1. Chạy hàm `setupSheet` một lần để tạo tiêu đề `ID | Họ tên | Nội dung lời chúc | Thời gian gửi`.
2. Chọn `Deploy -> New deployment -> Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone` để form public có thể gửi dữ liệu.
5. Sau khi triển khai, sao chép Web App URL dạng `https://script.google.com/macros/s/.../exec`.

## 4. Kết nối frontend

Tạo `.env.local` trong thư mục project:

```env
VITE_WISHES_API_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Chạy lại `npm run dev` hoặc build lại sau khi đổi biến môi trường.

Để frontend truy cập sheet công khai, Apps Script chuyển dữ liệu qua API. Google Sheet không được chia sẻ public và không được đưa URL sheet vào frontend.

## 5. Đăng nhập trang quản trị

Mở `http://localhost:5173/admin/wishes` hoặc `/admin/wishes` trên hosting.

Nhập đúng mật khẩu gốc. Apps Script chỉ nhận tham số này để tính SHA-256 khi đăng nhập và so sánh với `ADMIN_PASSWORD_SHA256`; mật khẩu không được lưu trong frontend hoặc localStorage. Frontend nhận token phiên tạm thời do Apps Script cấp, có thời hạn 12 giờ.

Khi thay mật khẩu quản trị, đăng xuất hoặc đăng nhập lại để lấy token mới.

## 6. Chức năng dữ liệu

- Form public ghi một dòng mới qua `submitWish`.
- Họ tên giới hạn 80 ký tự; lời chúc giới hạn 1000 ký tự.
- Thời gian được lưu theo `Asia/Ho_Chi_Minh`.
- API quản trị lấy danh sách, tìm kiếm, phân trang, xóa và đăng xuất chỉ khi token phiên hợp lệ.
- Mỗi lời chúc có UUID riêng.
- Apps Script có `doGet` để kiểm tra/paging public, `doPost` cho gửi, quản trị và đăng xuất.

## 7. Xuất Word

Trang `/admin/wishes` tạo file `.docx` thật bằng thư viện `docx` trong frontend. Nút xuất lấy toàn bộ danh sách hiện tại và tạo tên `Loi-chuc-cuoi-Ai-Duyen-Thanh-Nhan.docx`.

## 8. Hosting SPA

Vite và Netlify/Vercel cần chuyển mọi route về `index.html` để `/admin/wishes` hoạt động:

- Vercel: cấu hình framework là Vite.
- Netlify: tạo `_redirects` với `/* /index.html 200`.
- Chỉ thêm `_redirects` khi deploy trên Netlify.

## 9. Bảo mật và chống spam

- Frontend gọi Apps Script bằng `POST` với JSON text; không dùng `no-cors`.
- Apps Script xác nhận dữ liệu đầu vào và trả JSON qua `ContentService`.
- Tên và nội dung giới hạn 1000 ký tự.
- Mỗi phiên trình duyệt được cấp `clientId`, chặn hai lần gửi cùng dữ liệu trong 5 phút và chặn gửi liên tục trong 30 giây.
- API admin yêu cầu token phiên hợp lệ bằng CacheService.
- Không chia sẻ Spreadsheet công khai hoặc cấp quyền chỉnh sửa cho khách.

## 10. Checklist trước khi đưa thật

- [ ] Đã tạo Spreadsheet tên `Loi chuc cuoi - Ai Duyen & Thanh Nhan`.
- [ ] Tab dữ liệu tên `Wishes` và có 4 cột A-D.
- [ ] `SPREADSHEET_ID` đã đặt trong Script Properties.
- [ ] `ADMIN_PASSWORD_SHA256` đã đặt bằng SHA-256, không đặt mật khẩu thô.
- [ ] Web App đã triển khai với `Execute as: Me` và `Who has access: Anyone`.
- [ ] `.env.local` có `VITE_WISHES_API_URL` trỏ đúng Web App URL.
- [ ] Form gửi lời chúc kiểm tra tên/nội dung, đang gửi và lỗi/thành công.
- [ ] Sheet nhận đúng thời gian Việt Nam và UUID.
- [ ] Admin chỉ truy cập được sau đăng nhập; tìm kiếm, phân trang, xóa hoạt động.
- [ ] Export Word lấy toàn bộ lời chúc và tên file đúng.
- [ ] Đã build production và kiểm tra route `/admin/wishes` trên hosting.

## 11. Bảo mật vận hành

- Không đặt `SPREADSHEET_ID` hoặc `ADMIN_PASSWORD_SHA256` trong `.env` có tiền tố `VITE_*`.
- Không mở quyền chỉnh sửa Spreadsheet công khai.
- Không commit `.env.local`.
- Nếu nghi ngờ mật khẩu bị lộ, đổi `ADMIN_PASSWORD_SHA256`, triển khai lại Apps Script hoặc đăng xuất tất cả phiên; token cũ tự hết hạn sau 12 giờ.
