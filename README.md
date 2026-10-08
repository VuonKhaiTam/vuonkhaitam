# Vườn Khai Tâm

Mã nguồn web tĩnh **Vườn Khai Tâm** (https://vuonkhaitam.com) của tác giả Mộc Yên: truyện, bài học và ghi chép cho cha mẹ đồng hành cùng con 6–18 tuổi.

Web được dựng bằng [Eleventy 3](https://www.11ty.dev/) và đưa lên GitHub Pages bằng GitHub Actions. Trang công khai không có cookie, không có công cụ thống kê, không tải gì từ bên thứ ba.

## Chạy thử trên máy

Cần Node.js 24 trở lên.

```bash
npm install
npx @11ty/eleventy --serve
```

Mở http://localhost:8080. Trang `/thu-font/` (kiểm tra dấu tiếng Việt) chỉ có khi chạy thử.

Dựng bản thật vào `_site/`:

```bash
node scripts/kiem-tra-rieng-tu.mjs
npx @11ty/eleventy
```

## Cấu trúc thư mục

| Thư mục | Nội dung |
|---|---|
| `noi-dung/` | Bài viết `.md`, chia theo loại: `goc-cha-me/`, `truyen/`, `hoc-cung-con/`, `nhat-ky/`, `trang/` (trang tĩnh) |
| `anh/` | Ảnh đã nén, không còn thông tin ẩn (do trang Đăng bài đưa lên) |
| `_data/` | Dữ liệu dùng chung: thông tin web, 8 chủ đề, 4 nhóm tuổi, loại bài, bộ truyện, tủ sách |
| `_includes/layouts/` | Khuôn trang; `_includes/partials/` các mảnh dùng chung |
| `trang-tu-dong/` | Trang sinh theo dữ liệu: trang chủ, danh sách, chủ đề, độ tuổi, mục lục bộ truyện… |
| `assets/` | CSS, JavaScript, font tự lưu trữ, logo |
| `scripts/kiem-tra-rieng-tu.mjs` | Chặn dựng web nếu có ảnh còn EXIF/GPS, file cấm, hoặc từ nhạy cảm |

Mỗi thư mục loại bài có file `<loai>.11tydata.js` quy định khuôn trang và đường dẫn. Bài có `an: true` không được xuất ra web.

## Thêm chủ đề mới

Thêm một dòng `{ "ma", "ten", "mo_ta" }` vào `_data/chu-de.json` (`ma` không dấu, chữ thường, gạch nối). Trang `/chu-de/<ma>/` sẽ tự được tạo.

## Riêng tư

- Không bao giờ đưa lên kho: bản thảo `.docx`, bản nháp, token, danh sách từ nhạy cảm.
- Danh sách từ nhạy cảm chỉ nằm trong GitHub Secret `TU_NHAY_CAM` và trong trình duyệt của tác giả.

© Mộc Yên — Khai Tâm. Font Be Vietnam Pro và Cormorant Garamond dùng giấy phép SIL Open Font License (xem `assets/fonts/`).
