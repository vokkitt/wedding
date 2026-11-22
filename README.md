# Mai Anh & Minh Khôi — thiệp cưới trực tuyến

Thiệp mời React + Vite, tối ưu cho điện thoại, có phong bì mở đầu, ảnh toàn màn hình, đồng hồ đếm ngược, timeline, gallery, bản đồ, RSVP, lời chúc và mã QR quà mừng. Thông tin mẫu hiện có chỉ để trình diễn; hãy thay bằng dữ liệu thật trước khi gửi thiệp.

## Chạy trên máy

Cần cài Node.js 20 LTS trở lên và npm. Tại thư mục dự án, chạy:

```bash
npm install
npm run dev
```

Vite sẽ in URL xem thử, thường là `http://localhost:5173`. Kiểm tra bản phát hành bằng `npm run build`; chạy thử bản build bằng `npm run preview`.

## Chỉnh sửa nội dung

- Tên, ngày giờ, địa điểm, địa chỉ hai gia đình, bản đồ, nhạc, câu chuyện, lịch trình, thông tin ngân hàng và lời chúc mẫu: `src/data/weddingData.ts`.
- 12 ảnh gallery, mô tả ảnh và kiểu khung dọc/ngang: `src/data/gallery.ts`.
- Địa chỉ bản đồ mẫu đang trỏ tới The Mira Central Park ở Bình Dương. Cập nhật `mapEmbedUrl`, `mapUrl` và các địa chỉ sự kiện trước khi chia sẻ.
- RSVP và lời chúc hiện là demo phía trình duyệt, **chưa lưu trên máy chủ**. Nối submit trong `RSVP` và `Wishes` ở `src/components/InvitationSections.tsx` với Firebase/Supabase khi triển khai thật.

## Ảnh, nhạc và QR

- Ảnh minh họa hiện tải từ Unsplash. Danh sách ảnh nằm trong hai file dữ liệu ở trên. Có thể đặt ảnh đã tối ưu vào `public/images/` rồi thay URL bằng đường dẫn `/images/ten-anh.jpg`.
- Đặt nhạc MP3 tại `public/music/wedding-waltz.mp3`, hoặc đổi `musicUrl` trong `weddingData.ts`. Nhạc chỉ phát sau khi khách nhấn nút âm thanh.
- Thay `public/qr/bride-qr.svg` và `public/qr/groom-qr.svg` bằng ảnh QR hợp lệ; nếu dùng tên/đuôi file mới, sửa `qr` tương ứng trong `weddingData.ts`. Hai ảnh QR hiện tại chỉ là hình mẫu, **không thể dùng để chuyển khoản**. Đồng thời thay tên, ngân hàng và số tài khoản mẫu.
- `public/images/README.md` và `public/music/README.md` có ghi chú tại các thư mục asset.

## Đưa lên hosting

Đẩy mã nguồn lên GitHub, sau đó import repository vào Vercel hoặc Netlify. Dùng `npm run build` làm lệnh build và `dist` làm thư mục publish. Hai nền tảng tự chạy build lại khi bạn cập nhật mã nguồn.

Trước khi gửi link, thay tiêu đề/mô tả Open Graph trong `index.html` và cập nhật ảnh chia sẻ `og:image` thành URL công khai của ảnh cưới đã tối ưu. Google Fonts, ảnh Unsplash và bản đồ nhúng cần kết nối internet.