// Kiểm tra riêng tư: chạy TRƯỚC khi dựng web (trên máy và trong GitHub Actions).
// Làm bước dựng web THẤT BẠI nếu:
//   (a) có ảnh trong anh/ còn thông tin ẩn (EXIF, XMP, IPTC: có thể chứa GPS, loại máy, ngày chụp)
//   (b) kho có file .docx, .doc, .heic, .psd hoặc thư mục nhật ký riêng
//   (c) nội dung chứa từ nhạy cảm trong biến môi trường TU_NHAY_CAM
//       (GitHub Secret, các từ cách nhau bằng dấu phẩy, so khớp không phân biệt hoa thường và có dấu/không dấu)
// Lưu ý: kho công khai thì nhật ký chạy cũng công khai, nên script KHÔNG BAO GIỜ in ra từ nhạy cảm,
// chỉ in tên file và số dòng.
import { readdir, readFile } from "node:fs/promises";
import { join, extname, relative, sep } from "node:path";
import sharp from "sharp";

const GOC = process.cwd();
const BO_QUA = new Set(["node_modules", "_site", ".git", ".cache"]);
const DUOI_CAM = new Set([".docx", ".doc", ".heic", ".heif", ".psd"]);
const TEN_CAM = ["nhat-ky-rieng", "khaitam_brandidentity"];
const DUOI_ANH = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const DUOI_CHU = new Set([".md", ".json", ".njk", ".html", ".js", ".mjs", ".yml", ".yaml", ".txt", ".css"]);

const loi = [];

async function* duyet(thuMuc) {
  for (const muc of await readdir(thuMuc, { withFileTypes: true })) {
    if (BO_QUA.has(muc.name)) continue;
    const duongDan = join(thuMuc, muc.name);
    if (muc.isDirectory()) yield* duyet(duongDan);
    else yield duongDan;
  }
}

// Bỏ dấu tiếng Việt, chữ thường, đ → d
const boDau = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

const tuNhayCam = (process.env.TU_NHAY_CAM || "")
  .split(",")
  .map((t) => boDau(t.trim()))
  .filter((t) => t.length >= 2);
// So khớp nguyên từ: "an" không khớp với "ban" hay "an toan" bị cắt giữa chữ
const mauTu = tuNhayCam.map(
  (t) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z0-9])`),
);

const tatCaFile = [];
for await (const f of duyet(GOC)) tatCaFile.push(f);

for (const tep of tatCaFile) {
  const ten = relative(GOC, tep).split(sep).join("/");
  const duoi = extname(tep).toLowerCase();

  // (b) File và thư mục bị cấm
  if (DUOI_CAM.has(duoi)) loi.push(`File bị cấm (${duoi}): ${ten}`);
  if (TEN_CAM.some((c) => ten.toLowerCase().includes(c))) loi.push(`File riêng tư không được có trong kho: ${ten}`);

  // (a) Ảnh còn thông tin ẩn
  if (ten.startsWith("anh/") && DUOI_ANH.has(duoi)) {
    try {
      const m = await sharp(tep).metadata();
      const con = [m.exif && "EXIF", m.xmp && "XMP", m.iptc && "IPTC"].filter(Boolean);
      if (con.length) loi.push(`Ảnh còn thông tin ẩn (${con.join(", ")}): ${ten}`);
    } catch (e) {
      loi.push(`Không đọc được ảnh: ${ten}`);
    }
  }

  // (c) Từ nhạy cảm trong nội dung
  if (mauTu.length && DUOI_CHU.has(duoi) && !ten.startsWith("scripts/")) {
    const dong = (await readFile(tep, "utf8")).split("\n");
    dong.forEach((d, i) => {
      const chuan = boDau(d);
      if (mauTu.some((m) => m.test(chuan))) loi.push(`Có từ nhạy cảm: ${ten}, dòng ${i + 1}`);
    });
  }
}

console.log(`Kiểm tra riêng tư: đã xem ${tatCaFile.length} file` + (tuNhayCam.length ? `, dò ${tuNhayCam.length} từ nhạy cảm.` : ". (Chưa có danh sách từ nhạy cảm TU_NHAY_CAM, bỏ qua bước dò từ.)"));
if (loi.length) {
  console.error("\n✗ DỪNG DỰNG WEB vì có vấn đề riêng tư:\n");
  for (const l of loi) console.error("  - " + l);
  console.error("\nSửa các chỗ trên rồi đăng lại. Nếu lỡ đẩy thông tin nhạy cảm lên GitHub, hãy nhờ người hỗ trợ kỹ thuật xóa khỏi lịch sử kho.");
  process.exit(1);
}
console.log("✓ Không phát hiện vấn đề riêng tư.");
