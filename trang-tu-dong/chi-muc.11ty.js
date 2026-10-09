// Chỉ mục tìm kiếm /tim-kiem/chi-muc.json: mỗi bài (và mỗi bộ truyện) một dòng.
// t: tiêu đề · d: mô tả · u: đường dẫn · l: loại · c: tên chủ đề · a: nhóm tuổi · x: khoảng 1.500 ký tự đầu của bài (chữ thường)
// tim-kiem.js chỉ tải file này khi người đọc chạm vào ô tìm.
import { readFileSync } from "node:fs";

const vanBanThuan = (duongDanTep) =>
  readFileSync(duongDanTep, "utf8")
    .replace(/^---[\s\S]*?\n---/, "") // bỏ phần khai báo đầu bài
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // bỏ ảnh
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // link: giữ chữ
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_>`|\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 1500);

export default class {
  data() {
    return { permalink: "/tim-kiem/chi-muc.json", eleventyExcludeFromCollections: true };
  }

  render({ collections, dsChuDe, dsBoTruyen }) {
    const tenChuDe = (dsMa) => (dsMa || []).map((ma) => dsChuDe.find((c) => c.ma === ma)?.ten).filter(Boolean);
    const dong = (collections.tatCaBai || []).map((b) => ({
      t: b.data.title,
      d: b.data.mo_ta || "",
      u: b.url,
      l: b.data.loai,
      c: tenChuDe(b.data.chu_de),
      a: b.data.do_tuoi || [],
      x: vanBanThuan(b.inputPath),
    }));
    for (const [ma, bt] of Object.entries(dsBoTruyen || {})) {
      if (!(collections.boTruyen?.[ma] || []).length) continue; // bộ chưa có kỳ nào thì chưa đưa vào
      dong.push({ t: bt.ten, d: bt.mo_ta || "", u: `/truyen/${ma}/`, l: "bo-truyen", c: tenChuDe(bt.chu_de), a: bt.do_tuoi || [], x: "" });
    }
    return JSON.stringify(dong);
  }
}
