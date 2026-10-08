// Dữ liệu chung cho mọi bài: loại bài, khuôn trang, đường dẫn, thời gian đọc.
// Mỗi thư mục loại bài gọi hàm này trong file <loai>.11tydata.js của mình.
import { readFileSync } from "node:fs";

// Thời gian đọc: khoảng 200 chữ/phút với tiếng Việt, làm tròn lên.
function tinhPhutDoc(duongDanTep) {
  const van = readFileSync(duongDanTep, "utf8")
    .replace(/^---[\s\S]*?\n---/, "") // bỏ phần khai báo đầu bài
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`\[\]()!|-]/g, " ");
  const soChu = van.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(soChu / 200));
}

export function duLieuBai(loai, khuon, taoDuongDan) {
  return {
    loai,
    layout: khuon,
    eleventyComputed: {
      duong_dan: (d) => d.duong_dan || d.page.fileSlug,
      // Bài ẩn (an: true) không được xuất ra web
      permalink: (d) => (d.an ? false : taoDuongDan({ ...d, duong_dan: d.duong_dan || d.page.fileSlug })),
      eleventyExcludeFromCollections: (d) => Boolean(d.an),
      soPhutDoc: (d) => tinhPhutDoc(d.page.inputPath),
    },
  };
}
