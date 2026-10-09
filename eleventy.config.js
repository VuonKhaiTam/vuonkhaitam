// Cấu hình "máy in" Eleventy cho Vườn Khai Tâm.
// Đọc bài .md trong noi-dung/, ráp vào khuôn trong _includes/, xuất web tĩnh ra _site/.
import { readFileSync } from "node:fs";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";

const LOAI_BAI = ["goc-cha-me", "truyen", "hoc-cung-con", "nhat-ky"];
const docJson = (tep) => JSON.parse(readFileSync(new URL(tep, import.meta.url), "utf8"));

export default function (eleventyConfig) {
  // ---------- Dữ liệu dùng chung ----------
  // Tên file trong _data có dấu gạch nối (chu-de.json…), khuôn Nunjucks không gọi trực tiếp được,
  // nên tạo thêm tên gọi kiểu camelCase.
  const site = docJson("./_data/site.json");
  const dsChuDe = docJson("./_data/chu-de.json");
  const dsDoTuoi = docJson("./_data/do-tuoi.json");
  const dsLoaiBai = docJson("./_data/loai-bai.json");
  eleventyConfig.addGlobalData("dsChuDe", dsChuDe);
  eleventyConfig.addGlobalData("dsDoTuoi", dsDoTuoi);
  eleventyConfig.addGlobalData("dsLoaiBai", dsLoaiBai);
  eleventyConfig.addGlobalData("dsBoTruyen", () => docJson("./_data/bo-truyen.json"));
  eleventyConfig.addGlobalData("tuSach", () => docJson("./_data/tu-sach.json"));
  // Số phiên bản để trình duyệt tải lại CSS/JS mới sau mỗi lần dựng web
  eleventyConfig.addGlobalData("phienBan", Date.now().toString(36));
  // "serve" khi chạy thử trên máy, "build" khi dựng thật
  eleventyConfig.addGlobalData("cheDo", process.env.ELEVENTY_RUN_MODE || "build");

  // ---------- File không phải trang web ----------
  for (const mau of ["README.md", "HUONG-DAN-DANG-BAI.md", "scripts/**", "dang-bai/**", "anh/**", "node_modules/**"]) {
    eleventyConfig.ignores.add(mau);
  }
  // Trang thử font chỉ có khi chạy thử trên máy, không đưa lên web
  if (process.env.ELEVENTY_RUN_MODE !== "serve") eleventyConfig.ignores.add("trang-tu-dong/thu-font.njk");

  // ---------- Chép nguyên (không qua khuôn) ----------
  eleventyConfig.addPassthroughCopy("assets/css");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/logo");
  eleventyConfig.addPassthroughCopy("anh");
  eleventyConfig.addPassthroughCopy("dang-bai");
  eleventyConfig.addPassthroughCopy({ "assets/logo/favicon.ico": "favicon.ico" });

  eleventyConfig.addPlugin(pluginRss);

  // ---------- Ảnh trong bài: tự tạo nhiều cỡ (480, 800, 1200) dạng WebP ----------
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp"],
    widths: [480, 800, 1200],
    urlPath: "/img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 760px) 680px, 100vw",
    },
  });

  // ---------- Nhóm bài (collections) ----------
  // Bài công khai: thuộc 4 loại, không bị ẩn (an: true), xếp mới nhất trước.
  const baiCongKhai = (api) =>
    api
      .getAll()
      .filter((b) => LOAI_BAI.includes(b.data.loai) && !b.data.an && b.url)
      .sort((a, b) => b.date - a.date);

  const nhomTheo = (dsBai, layKhoa) => {
    const nhom = {};
    for (const bai of dsBai) {
      for (const khoa of [].concat(layKhoa(bai) || [])) (nhom[khoa] ||= []).push(bai);
    }
    return nhom;
  };

  eleventyConfig.addCollection("tatCaBai", baiCongKhai);
  eleventyConfig.addCollection("theoLoai", (api) => nhomTheo(baiCongKhai(api), (b) => b.data.loai));
  eleventyConfig.addCollection("theoChuDe", (api) => nhomTheo(baiCongKhai(api), (b) => b.data.chu_de));
  eleventyConfig.addCollection("theoTuoi", (api) => nhomTheo(baiCongKhai(api), (b) => b.data.do_tuoi));
  eleventyConfig.addCollection("coVideo", (api) => baiCongKhai(api).filter((b) => b.data.video));
  eleventyConfig.addCollection("boTruyen", (api) => {
    const nhom = nhomTheo(baiCongKhai(api), (b) => (b.data.loai === "truyen" ? b.data.bo_truyen : null));
    for (const ma in nhom) nhom[ma].sort((a, b) => (a.data.ky || 0) - (b.data.ky || 0));
    return nhom;
  });

  // ---------- Bộ lọc (filters) dùng trong khuôn ----------
  const thang = (d) => new Date(d);
  // 08/10/2026
  eleventyConfig.addFilter("ngay", (d) => {
    const n = thang(d);
    const hai = (x) => String(x).padStart(2, "0");
    return `${hai(n.getUTCDate())}/${hai(n.getUTCMonth() + 1)}/${n.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("ngayIso", (d) => thang(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("tuyetDoi", (duongDan) => new URL(duongDan || "/", site.url).href);
  eleventyConfig.addFilter("dau", (ds, n) => (ds || []).slice(0, n));
  eleventyConfig.addFilter("boQua", (ds, bai) => (ds || []).filter((b) => b.url !== bai?.url));
  eleventyConfig.addFilter("chuDe", (ma) => dsChuDe.find((c) => c.ma === ma));
  eleventyConfig.addFilter("tenCacChuDe", (dsMa) =>
    [].concat(dsMa || []).map((ma) => dsChuDe.find((c) => c.ma === ma)?.ten).filter(Boolean).join(", "),
  );
  eleventyConfig.addFilter("doTuoi",(ma) => dsDoTuoi.find((t) => t.ma === ma));
  eleventyConfig.addFilter("loaiBai", (ma) => dsLoaiBai.find((l) => l.ma === ma));
  eleventyConfig.addFilter("timTheoUrl", (ds, url) => (ds || []).find((b) => b.url === url));
  // Ghép nhãn tuổi liền nhau: ["9-11","12-15"] → "9–15 tuổi"
  eleventyConfig.addFilter("khoangTuoi", (dsMa) => {
    const ma = [].concat(dsMa || []).filter((m) => /^\d+-\d+$/.test(m));
    if (!ma.length) return "";
    const so = ma.flatMap((m) => m.split("-").map(Number));
    return `${Math.min(...so)}–${Math.max(...so)} tuổi`;
  });

  // Bài liên quan: ưu tiên danh sách lien_quan, thiếu thì bù bằng bài cùng chủ đề, tổng n bài.
  eleventyConfig.addFilter("baiLienQuan", (tatCa, bai, n = 3) => {
    const ketQua = [];
    const them = (b) => {
      if (b && b.url !== bai.url && !ketQua.includes(b) && ketQua.length < n) ketQua.push(b);
    };
    for (const url of bai.data?.lien_quan || []) them(tatCa.find((b) => b.url === url));
    const chuDe = bai.data?.chu_de || [];
    for (const b of tatCa) if ((b.data.chu_de || []).some((c) => chuDe.includes(c))) them(b);
    return ketQua;
  });

  // Kỳ trước / kỳ sau trong cùng bộ truyện, kèm vị trí kỳ hiện tại (thứ mấy / tổng số kỳ)
  eleventyConfig.addFilter("kyKeBen", (dsKy, url) => {
    const ds = dsKy || [];
    const i = ds.findIndex((b) => b.url === url);
    return {
      truoc: i > 0 ? ds[i - 1] : null,
      sau: i >= 0 && i < ds.length - 1 ? ds[i + 1] : null,
      thuTu: i + 1,
      tong: ds.length,
    };
  });
  // Truyện 1 trang (không thuộc bộ truyện nào): dùng cho trang /truyen/, các kỳ đã gom vào thẻ bộ truyện
  eleventyConfig.addFilter("truyenMotTrang", (ds) => (ds || []).filter((b) => !b.data.bo_truyen));
  // Thời gian đọc trung bình mỗi kỳ của một bộ truyện
  eleventyConfig.addFilter("phutMoiKy", (dsKy) => {
    const ds = dsKy || [];
    return ds.length ? Math.round(ds.reduce((tong, b) => tong + (b.data.soPhutDoc || 1), 0) / ds.length) : 0;
  });

  // ---------- Ảnh chia sẻ (Open Graph): cắt ảnh bìa thành 1200×630, JPEG chất lượng 82 ----------
  // Lưu ở /og/<loai>-<duong_dan>.jpg. Bài không có ảnh bìa dùng ảnh chia sẻ mặc định.
  const OG_MAC_DINH = "/assets/logo/og-mac-dinh.jpg";
  eleventyConfig.addAsyncFilter("anhChiaSe", async (anhBia, ten) => {
    if (!anhBia || !String(anhBia).startsWith("/anh/")) return OG_MAC_DINH;
    try {
      const meta = await Image(`.${anhBia}`, {
        widths: [1200],
        formats: ["jpeg"],
        outputDir: "_site/og/",
        urlPath: "/og/",
        filenameFormat: () => `${ten}.jpg`,
        sharpJpegOptions: { quality: 82, mozjpeg: true },
        transform: (s) => s.resize({ width: 1200, height: 630, fit: "cover" }),
      });
      return meta.jpeg[0].url;
    } catch (loi) {
      console.warn(`[anh-chia-se] Không tạo được ảnh chia sẻ cho ${ten}: ${loi.message}`);
      return OG_MAC_DINH;
    }
  });

  // Dữ liệu có cấu trúc (JSON-LD) cho Google. Đổi "<" để không thể đóng thẻ <script> sớm.
  eleventyConfig.addFilter("jsonLd", (doiTuong) => JSON.stringify(doiTuong).replace(/</g, "\\u003c"));

  // ---------- Video YouTube ----------
  eleventyConfig.addAsyncShortcode("video", (url) => khoiVideo(url));

  // Đoạn văn chỉ có một link YouTube (dán trên một dòng riêng) → khối video
  eleventyConfig.addTransform("video-youtube", async function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;
    const mau = /<p>\s*(?:<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>|(https?:\/\/[^\s<]+))\s*<\/p>/g;
    const thay = [];
    for (const m of html.matchAll(mau)) {
      const url = (m[1] || m[2]).replaceAll("&amp;", "&");
      if (layIdYoutube(url)) thay.push([m[0], await khoiVideo(url)]);
    }
    for (const [cu, moi] of thay) html = html.replace(cu, moi);
    return html;
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["md", "njk", "11ty.js"],
    // Bài viết .md không chạy mã khuôn bên trong: dấu {{ hay {% trong bài không làm hỏng web.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}

// Lấy mã video (11 ký tự) từ các dạng link youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
export function layIdYoutube(url) {
  const m = String(url || "")
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    );
  return m ? m[1] : null;
}

// Khối video: ban đầu chỉ là ảnh thu nhỏ + nút ▶. Ảnh thu nhỏ được tải về LÚC DỰNG WEB và lưu
// thành ảnh của chính web, nên người đọc mở trang không bị gọi sang Google.
// Bấm ▶ thì chinh.js mới chèn khung youtube-nocookie. Không có JavaScript thì link mở YouTube.
async function khoiVideo(url) {
  const id = layIdYoutube(url);
  if (!id) return "";
  let anh = "";
  try {
    const meta = await Image(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, {
      widths: [480],
      formats: ["webp"],
      outputDir: "_site/img/video/",
      urlPath: "/img/video/",
      filenameFormat: () => `${id}.webp`,
      cacheOptions: { duration: "30d", directory: ".cache" },
    });
    const a = meta.webp[0];
    anh = `<img eleventy:ignore src="${a.url}" width="${a.width}" height="${a.height}" alt="" loading="lazy" decoding="async">`;
  } catch (loi) {
    console.warn(`[video] Không tải được ảnh thu nhỏ của ${id}: ${loi.message}`);
  }
  return `<div class="video" data-yt="${id}"><a class="video-nut" href="https://www.youtube.com/watch?v=${id}" rel="noopener">${anh}<span class="video-play" aria-hidden="true"><svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.5 7.7A8.5 8.5 0 0 0 60.5 1.7C55.2.3 34 .3 34 .3S12.8.3 7.5 1.7A8.5 8.5 0 0 0 1.5 7.7C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#1A3D2B" fill-opacity=".85"/><path d="M45 24 27 14v20z" fill="#fff"/></svg></span><span class="an-chu">Phát video</span></a></div>`;
}
