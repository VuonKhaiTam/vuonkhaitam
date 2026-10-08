import { duLieuBai } from "../du-lieu-bai.js";

// Truyện 1 trang: /truyen/<duong_dan>/ · Truyện nhiều kỳ: /truyen/<bo_truyen>/ky-<ky>/
export default duLieuBai("truyen", "layouts/bai-truyen.njk", (d) =>
  d.bo_truyen ? `/truyen/${d.bo_truyen}/ky-${d.ky}/` : `/truyen/${d.duong_dan}/`,
);
