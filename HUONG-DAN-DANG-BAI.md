# Hướng dẫn đăng bài lên Vườn Khai Tâm

Tài liệu này dành cho tác giả (Mộc Yên), viết cho người không biết lập trình. Mọi việc đều làm trên trang **vuonkhaitam.com/dang-bai/**, bằng điện thoại hoặc máy tính.

---

## 1. Lần đầu: tạo "chìa khóa" GitHub (token)

Token là một mật khẩu riêng, cho phép trang Đăng bài cất bài vào kho của Vườn Khai Tâm trên GitHub. Mỗi máy (điện thoại, máy tính) chỉ cần làm một lần.

1. Đăng nhập GitHub bằng tài khoản của Vườn Khai Tâm.
2. Mở trang tạo token: https://github.com/settings/personal-access-tokens/new
3. **Token name:** gõ `dang-bai`.
4. **Expiration (hạn dùng):** chọn 1 năm hoặc ngắn hơn. Trang Đăng bài sẽ nhắc khi token còn dưới 30 ngày.
5. **Repository access:** chọn *Only select repositories*, rồi chọn kho `vuonkhaitam`.
6. **Permissions › Repository permissions:**
   - *Contents*: chọn **Read and write** (để đăng bài).
   - *Actions*: chọn **Read-only** (để xem web đã dựng xong chưa).
   - *Metadata* tự có sẵn Read-only.
7. Bấm **Generate token**, rồi bấm nút sao chép. Token là một chuỗi dài bắt đầu bằng `github_pat_`.

> Token chỉ hiện **một lần**. Nếu lỡ đóng trang mà chưa dán, cứ tạo token mới.
> Không gửi token cho ai, không dán vào Zalo, email hay bất kỳ file nào.

## 2. Lần đầu mở trang Đăng bài

1. Mở **vuonkhaitam.com/dang-bai/**.
2. Dán token vào ô ở Bước 1, bấm **Thử kết nối**. Thấy dòng chữ xanh "Kết nối được kho…" là đúng.
3. Đặt **mã PIN** từ 6 chữ số trở lên, nhập lại lần nữa. Mã PIN dùng để khóa token trên máy này.
4. Nhập **danh sách từ nhạy cảm**, mỗi từ một dòng: tên con, tên ở nhà, tên trường, lớp, tên thầy cô, tên ấp, xã… Trước khi đăng, trang sẽ dò và chặn bài có các từ này. Danh sách chỉ lưu trên máy này, không bao giờ gửi lên GitHub.
5. Bấm **Lưu và bắt đầu**.

Từ lần sau, mở trang chỉ cần nhập PIN. Nhập sai 5 lần liên tiếp, máy sẽ tự xóa token để an toàn; khi đó làm lại mục 2 với token cũ hoặc token mới.

Trang tự khóa sau 30 phút không thao tác. Dùng máy chung với người khác thì bấm **Khóa ngay** trước khi rời máy.

## 3. Viết và đăng một bài

1. Ở bảng điều khiển, bấm một trong 4 nút: **Góc cha mẹ**, **Truyện**, **Học cùng con**, **Nhật ký vườn ươm**.
2. Điền các ô thông tin. Ô nào có chữ "(không bắt buộc)" thì bỏ trống cũng được.
   - **Tiêu đề:** nên viết theo câu cha mẹ hay gõ tìm trên Google. Ví dụ "Con hay cáu giận: giúp con tự hạ nhiệt" thay cho "Bàn về cảm xúc".
   - **Đường dẫn:** tự tạo từ tiêu đề, thường không cần sửa.
   - **Mô tả ngắn:** 120–160 ký tự, hiện trên Google và khi chia sẻ Zalo, Facebook. Ô đếm ký tự bên dưới sẽ đổi màu nếu dài hoặc ngắn quá.
   - **Độ tuổi, Chủ đề:** bấm chọn, chọn được nhiều nút.
3. Viết hoặc dán nội dung vào khung **Nội dung bài**. Dán từ Word được: đoạn văn, chữ đậm, chữ nghiêng được giữ nguyên.
   - Nút **H2** tạo tiêu đề mục, **H3** tạo tiêu đề nhỏ.
4. Bấm **Xem trước** để xem bài gần giống trên web thật.
5. Bấm **Kiểm tra và đăng**. Trang sẽ liệt kê:
   - **Cần sửa trước khi đăng** (màu đỏ): phải sửa thì mới đăng được.
   - **Thông tin riêng tư cần xem lại**: chỗ nghi là tên con, số điện thoại, tên trường, lớp… được tô đỏ. Quay lại sửa, hoặc đánh dấu "chỗ này không phải thông tin của con".
   - **Nên xem lại** (màu vàng): góp ý, vẫn đăng được.
6. Bấm **Đăng bài**. Chờ khoảng 1–2 phút tới khi thấy "Xong! Bài đã lên web", rồi bấm **Xem bài trên web**.

**Bản nháp tự lưu** 10 giây một lần, ngay trên máy đang dùng. Tắt máy, mất mạng cũng không mất bài. Nháp không bao giờ được gửi lên GitHub.

## 4. Chèn ảnh và video

**Ảnh:** đặt con trỏ vào chỗ muốn chèn, bấm **+ Chèn ảnh**, chọn ảnh, gõ **mô tả ảnh** (bắt buộc, ví dụ "Năm chiếc hũ gốm xếp trên kệ gỗ").
- Ảnh tự được thu nhỏ và nén (thường còn dưới 400 KB), đồng thời **xóa thông tin ẩn trong ảnh, kể cả vị trí chụp**.
- Ảnh HEIC của iPhone chưa đọc được: vào Cài đặt › Camera › Định dạng, chọn "Tương thích nhất", hoặc chụp màn hình ảnh rồi chèn.
- **Không dùng ảnh thấy mặt con.** Chỉ dùng ảnh chụp từ sau lưng, ở xa, chỉ thấy đôi tay, hoặc chỉ có đồ vật.

**Ảnh bìa:** bấm **Chọn ảnh bìa** ở phần thông tin. Ảnh bìa hiện ở đầu bài và khi chia sẻ link lên Zalo, Facebook. Chưa có ảnh bìa thì web dùng ảnh tạm theo loại bài.

**Video YouTube:** bấm **+ Chèn video YouTube**, dán link. Trên web, link sẽ thành khung video có nút ▶. Video chỉ tải khi người đọc bấm phát.

## 5. Đăng truyện nhiều kỳ

1. Bấm **Truyện**. Ở ô **Thuộc bộ truyện**:
   - Truyện ngắn đăng một lần: chọn *Truyện 1 trang*.
   - Kỳ đầu của truyện dài: chọn *+ Tạo bộ truyện mới…*, gõ tên bộ truyện và 2–3 câu giới thiệu.
   - Các kỳ sau: chọn tên bộ truyện trong danh sách. Số kỳ tự tăng.
2. Gõ **Tên kỳ**. Tiêu đề bài tự điền dạng "Tên bộ – Kỳ 2: Tên kỳ".
3. Nên điền **Tóm tắt kỳ này** (1–2 câu). Kỳ sau sẽ hiện đoạn này ở mục "Kỳ trước" để người đọc nhớ lại.
4. Điền **câu hỏi trò chuyện** theo 3 tầng: Nhớ lại, Cảm nhận, Liên hệ.
5. Ở kỳ cuối, đánh dấu ô **Đây là kỳ cuối** để bộ truyện chuyển sang "Hoàn thành".

Người đọc sẽ có trang mục lục, thanh "Kỳ 2 / 6" ở đầu mỗi kỳ và nút **Đọc tiếp** ở cuối kỳ.

## 6. Riêng Nhật ký vườn ươm

Trước khi đăng phải đánh dấu đủ 6 điều:
1. Không có tên thật hay tên ở nhà của con.
2. Không có trường, lớp, thầy cô, nơi ở.
3. Không có ảnh thấy mặt con.
4. Đã đổi những chi tiết không quan trọng.
5. Đã để "nguội" ít nhất 2 tuần (bản nháp mới tạo chưa đủ 14 ngày thì trang sẽ nhắc).
6. Con đã nghe bài này và đồng ý cho đăng.

Ô **Giai đoạn** chỉ ghi nhóm tuổi chung như "đầu cấp hai", không ghi tuổi hay lớp chính xác.

Ô **Nhãn** không bắt buộc. Bài cảm nhận hay ghi chép điều đã đọc thì để *Không gắn nhãn*. Câu hỏi chưa có lời giải thì chọn *Còn bỏ ngỏ*. Bài kể việc đã thử thì chọn *Đang thử*, *Hiệu quả* hoặc *Chưa hiệu quả*.

## 7. Sửa, ẩn, xóa bài đã đăng

Ở bảng điều khiển, phần **Bài đã đăng**, bấm **Tải danh sách**, gõ tên bài vào ô tìm nếu cần.
- **Sửa:** mở bài ra sửa như lúc viết, rồi Kiểm tra và đăng. Ngày cập nhật tự được ghi. Đường dẫn của bài đã đăng không đổi được, để link đã chia sẻ không bị hỏng.
- **Ẩn bài** (nên dùng): bài biến mất khỏi web sau 1–2 phút, nhưng file vẫn còn và hiện lại được bất cứ lúc nào.
- **Xóa hẳn:** phải xác nhận 2 lần. File vẫn còn trong lịch sử GitHub (xem mục 10).

## 8. Chuyển bản nháp giữa máy tính và điện thoại

Bản nháp nằm riêng trên từng máy. Muốn viết tiếp ở máy khác:
1. Ở máy đang có nháp: **Cài đặt › Xuất bản nháp**. Máy tải về một file `vkt-ban-nhap-….json` (có kèm ảnh).
2. Gửi file đó sang máy kia bằng cách riêng tư, ví dụ email riêng của Vườn Khai Tâm, hoặc mục "Cloud của tôi" trong Zalo.
3. Ở máy kia: **Cài đặt › Nhập bản nháp**, chọn file vừa nhận.

## 9. Token sắp hết hạn

Khi trang báo "Token còn N ngày":
1. Tạo token mới theo mục 1.
2. Vào **Cài đặt › Thay token mới**, dán token mới, đặt PIN (giữ PIN cũ cũng được), bấm Lưu.
3. Làm lại bước này trên mỗi máy dùng để đăng bài.

## 10. Khi gặp sự cố

**Web không cập nhật sau khi đăng**
- Chờ thêm 2–3 phút rồi tải lại trang. Trên máy tính bấm **Ctrl + F5**, trên điện thoại đóng tab rồi mở lại.
- Nếu trang Đăng bài báo "Bước dựng web bị lỗi", bấm **Xem lỗi trên GitHub**. Lỗi thường gặp là bước kiểm tra riêng tư phát hiện vấn đề. Gửi ảnh chụp màn hình lỗi cho Claude Code để được giúp.

**Báo "Token không đúng hoặc đã hết hạn"**: làm theo mục 9.

**Quên PIN**: ở màn nhập PIN, bấm "Quên PIN? Thiết lập lại bằng token", rồi làm lại mục 2. Bản nháp trên máy vẫn còn nguyên.

**Lỡ đăng thông tin nhạy cảm của con**
1. Vào trang Đăng bài, **Ẩn bài** ngay, hoặc sửa bỏ chỗ nhạy cảm. Bài biến mất khỏi web sau 1–2 phút.
2. Kho của Vườn Khai Tâm là kho công khai, nên **bản cũ vẫn còn trong lịch sử GitHub**. Nhờ Claude Code xóa hẳn khỏi lịch sử.
3. Nếu là ảnh, nhờ Claude Code xóa cả file ảnh khỏi lịch sử.

## 11. Lớp bảo vệ thứ hai: danh sách từ nhạy cảm trên GitHub

Ngoài danh sách trên máy, có thể nhập danh sách từ nhạy cảm vào GitHub. Khi đó, mỗi lần dựng web, GitHub tự dò lại toàn bộ bài và **dừng dựng web** nếu thấy từ cấm. Không ai xem được danh sách này, kể cả khi kho công khai.

1. Mở kho `vuonkhaitam` trên GitHub › **Settings** › **Secrets and variables** › **Actions**.
2. Bấm **New repository secret**.
3. **Name:** `TU_NHAY_CAM`. **Secret:** các từ cách nhau bằng dấu phẩy, ví dụ `tên con, tên ở nhà, tên trường`.
4. Bấm **Add secret**.

## 12. Việc nên làm sau khi ra mắt

- **Google Search Console** (công cụ miễn phí của Google cho biết người ta gõ gì để tìm ra web): đăng ký bằng email riêng của Vườn Khai Tâm tại https://search.google.com/search-console, chọn loại "Domain", nhập `vuonkhaitam.com`, làm theo hướng dẫn thêm một bản ghi TXT ở nơi mua tên miền. Sau đó gửi sơ đồ web: `https://vuonkhaitam.com/sitemap.xml`.
- **Kiểm tra tốc độ:** mở https://pagespeed.web.dev, dán link trang chủ hoặc một bài, xem điểm trên điện thoại (mục tiêu từ 90 trở lên).
- **Kiểm tra khi chia sẻ:** dán link một bài vào Zalo và Facebook, xem có hiện đúng ảnh, tiêu đề, mô tả không. Nếu Facebook hiện ảnh cũ, mở https://developers.facebook.com/tools/debug/, dán link, bấm **Scrape Again**.
