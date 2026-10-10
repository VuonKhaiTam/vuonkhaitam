// Trang Đăng bài · Vườn Khai Tâm
// JavaScript thuần, chạy hoàn toàn trên trình duyệt của tác giả. Không gửi dữ liệu đi đâu ngoài GitHub.
// Thư viện: Toast UI Editor 3.2.2 (khung soạn thảo), js-yaml 4.1.0 (đọc/ghi phần khai báo đầu bài).
"use strict";

// ================= Cấu hình =================
const KHO = "VuonKhaiTam/vuonkhaitam";
const NHANH = "main";
const SITE = "https://vuonkhaitam.com";
// Tên hiển thị trên mỗi lần đăng (commit): chỉ bút danh, email ẩn danh của GitHub
const NGUOI_DANG = { name: "Mộc Yên", email: "339850213+VuonKhaiTam@users.noreply.github.com" };
const PHUT_TU_KHOA = 30;
const SO_LAN_SAI_TOI_DA = 5;
const KHOA_TOKEN = "vkt.token.enc";
const KHOA_SAI_PIN = "vkt.pin-sai";
const KHOA_TU_NHAY_CAM = "vkt.tu-nhay-cam";

const LOAI = {
  "goc-cha-me": { ten: "Góc cha mẹ", duongDan: "/goc-cha-me/" },
  truyen: { ten: "Truyện", duongDan: "/truyen/" },
  "hoc-cung-con": { ten: "Học cùng con", duongDan: "/hoc-cung-con/" },
  "nhat-ky": { ten: "Nhật ký vườn ươm", duongDan: "/nhat-ky/" },
};

// ================= Tiện ích chung =================
const $ = (chon, goc = document) => goc.querySelector(chon);
const $$ = (chon, goc = document) => [...goc.querySelectorAll(chon)];
const ngu = (ms) => new Promise((ok) => setTimeout(ok, ms));
const taoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function el(the, thuocTinh = {}, ...con) {
  const nut = document.createElement(the);
  for (const [k, v] of Object.entries(thuocTinh)) {
    if (v === false || v == null) continue;
    if (k === "class") nut.className = v;
    else if (k === "text") nut.textContent = v;
    else if (k.startsWith("on")) nut.addEventListener(k.slice(2), v);
    else nut.setAttribute(k, v === true ? "" : v);
  }
  for (const c of con.flat()) if (c != null && c !== false) nut.append(c);
  return nut;
}

const thoatHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function homNay() {
  const d = new Date();
  const hai = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}
const gioPhut = (ts) => new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const ngayGio = (ts) => new Date(ts).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

// Bỏ dấu tiếng Việt: dùng tạo đường dẫn và dò từ nhạy cảm
const boDau = (s) =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

// Đường dẫn: không dấu, chữ thường, gạch nối, tối đa 60 ký tự
const taoDuongDan = (s) =>
  boDau(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
const duongDanHopLe = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s || "") && s.length <= 60;

// Lấy mã video YouTube (giống eleventy.config.js)
function layIdYoutube(url) {
  const m = String(url || "")
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/,
    );
  return m ? m[1] : null;
}

// Base64 cho chữ UTF-8 và dữ liệu nhị phân (giữ đúng dấu tiếng Việt)
function b64TuBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const bytesTuB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const b64TuChu = (chu) => b64TuBytes(new TextEncoder().encode(chu));
const chuTuB64 = (b64) => new TextDecoder("utf-8").decode(bytesTuB64(String(b64).replace(/\s/g, "")));
const b64TuBlob = async (blob) => b64TuBytes(new Uint8Array(await blob.arrayBuffer()));

function baoChung(chu, loi = false) {
  const o = $(".bao-chung");
  o.textContent = chu;
  o.classList.toggle("loi", loi);
  o.hidden = !chu;
  clearTimeout(baoChung.hen);
  if (chu) baoChung.hen = setTimeout(() => (o.hidden = true), loi ? 12000 : 6000);
}

// Lưu trữ cục bộ an toàn (trình duyệt chặn thì không làm hỏng trang)
const docLS = (k, macDinh = null) => {
  try {
    const v = localStorage.getItem(k);
    return v == null ? macDinh : JSON.parse(v);
  } catch {
    return macDinh;
  }
};
const ghiLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    baoChung("Trình duyệt không cho lưu dữ liệu. Hãy tắt chế độ ẩn danh.", true);
  }
};
const xoaLS = (k) => {
  try {
    localStorage.removeItem(k);
  } catch {
    /* bỏ qua */
  }
};

// ================= Mã hóa token bằng PIN =================
// PBKDF2-SHA256 (310.000 vòng, salt 16 byte) → khóa AES-GCM 256 (IV 12 byte). Token gốc không bao giờ được lưu.
async function khoaTuPin(pin, salt) {
  const goc = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    goc,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
async function maHoaToken(tk, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const khoa = await khoaTuPin(pin, salt);
  const ma = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, khoa, new TextEncoder().encode(tk)));
  ghiLS(KHOA_TOKEN, { v: 1, salt: b64TuBytes(salt), iv: b64TuBytes(iv), ma: b64TuBytes(ma) });
}
async function giaiMaToken(pin) {
  const goi = docLS(KHOA_TOKEN);
  if (!goi) throw new Error("chua-co");
  const khoa = await khoaTuPin(pin, bytesTuB64(goi.salt));
  const ro = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytesTuB64(goi.iv) }, khoa, bytesTuB64(goi.ma));
  return new TextDecoder().decode(ro);
}

// ================= Trạng thái =================
let token = null; // chỉ nằm trong bộ nhớ trang, mất khi khóa hoặc đóng trang
let ngayHetHanToken = null;
let dsChuDe = [];
let dsDoTuoi = [];
let dsBoTruyen = {};
let cayKho = new Set(); // mọi đường dẫn file trong kho, để kiểm tra trùng
let bai = null; // bài đang soạn
let editor = null;
let daSuaChuaLuu = false;
let lanThaoTacCuoi = Date.now();
const urlAnhTam = new Map(); // id ảnh → blob: URL đang hiện trong khung soạn

// ================= GitHub =================
class LoiGh extends Error {
  constructor(trangThai, chu) {
    super(chu);
    this.trangThai = trangThai;
  }
}

async function gh(duong, { method = "GET", body, raw = false } = {}) {
  let r;
  try {
    r = await fetch(`https://api.github.com${duong}`, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new LoiGh(0, "Không kết nối được GitHub. Kiểm tra mạng rồi thử lại.");
  }
  const het = r.headers.get("github-authentication-token-expiration");
  if (het) ngayHetHanToken = new Date(het.replace(" UTC", "Z").replace(" ", "T"));
  if (!r.ok) {
    let chiTiet = "";
    try {
      chiTiet = (await r.json()).message || "";
    } catch {
      /* bỏ qua */
    }
    throw new LoiGh(r.status, chiTiet || r.statusText);
  }
  if (r.status === 204) return null;
  return raw ? r.text() : r.json();
}

function loiDeHieu(e) {
  const t = e?.trangThai;
  if (t === 401) return "Token không đúng hoặc đã hết hạn. Vào Cài đặt › Thay token mới.";
  if (t === 403)
    return "GitHub từ chối: token chưa đủ quyền (cần Contents: Read and write) hoặc GitHub đang tạm giới hạn. Đợi vài phút rồi thử lại.";
  if (t === 404) return "Không tìm thấy kho hoặc file. Kiểm tra token đã chọn đúng kho vuonkhaitam chưa.";
  if (t === 409 || t === 422) return "Kho vừa có thay đổi khác cùng lúc. Bấm Đăng lại để thử lần nữa.";
  return e?.message || "Có lỗi chưa rõ nguyên nhân. Thử lại sau ít phút.";
}

const duongApi = (p) => p.split("/").map(encodeURIComponent).join("/");
const docTep = (duong) => gh(`/repos/${KHO}/contents/${duongApi(duong)}?ref=${NHANH}`, { raw: true });

async function taiCayKho() {
  const kq = await gh(`/repos/${KHO}/git/trees/${NHANH}?recursive=1`);
  const tep = kq.tree.filter((t) => t.type === "blob");
  cayKho = new Set(tep.map((t) => t.path));
  return tep;
}

async function taiDuLieuKho() {
  const [cd, dt, bt] = await Promise.all([
    docTep("_data/chu-de.json"),
    docTep("_data/do-tuoi.json"),
    docTep("_data/bo-truyen.json"),
  ]);
  dsChuDe = JSON.parse(cd);
  dsDoTuoi = JSON.parse(dt);
  dsBoTruyen = JSON.parse(bt);
  await taiCayKho();
}

// Đăng nhiều file trong MỘT commit bằng Git Data API, nên web chỉ dựng lại một lần.
// tep = [{ path, base64 } | { path, xoa: true }]
async function guiCommit(tep, loiNhan, baoTienDo = () => {}) {
  const shaBlob = new Map(); // giữ lại khi phải thử lại, khỏi gửi ảnh hai lần
  for (let lan = 1; lan <= 3; lan++) {
    try {
      const ref = await gh(`/repos/${KHO}/git/ref/heads/${NHANH}`);
      const commitCu = await gh(`/repos/${KHO}/git/commits/${ref.object.sha}`);
      const cay = [];
      let i = 0;
      for (const t of tep) {
        i++;
        if (t.xoa) {
          cay.push({ path: t.path, mode: "100644", type: "blob", sha: null });
          continue;
        }
        if (!shaBlob.has(t.path)) {
          baoTienDo(`Đang gửi file ${i}/${tep.length}…`);
          const blob = await gh(`/repos/${KHO}/git/blobs`, { method: "POST", body: { content: t.base64, encoding: "base64" } });
          shaBlob.set(t.path, blob.sha);
        }
        cay.push({ path: t.path, mode: "100644", type: "blob", sha: shaBlob.get(t.path) });
      }
      const cayMoi = await gh(`/repos/${KHO}/git/trees`, { method: "POST", body: { base_tree: commitCu.tree.sha, tree: cay } });
      const luc = new Date().toISOString();
      const commitMoi = await gh(`/repos/${KHO}/git/commits`, {
        method: "POST",
        body: {
          message: loiNhan,
          tree: cayMoi.sha,
          parents: [ref.object.sha],
          author: { ...NGUOI_DANG, date: luc },
          committer: { ...NGUOI_DANG, date: luc },
        },
      });
      await gh(`/repos/${KHO}/git/refs/heads/${NHANH}`, { method: "PATCH", body: { sha: commitMoi.sha, force: false } });
      for (const t of tep) t.xoa ? cayKho.delete(t.path) : cayKho.add(t.path);
      return commitMoi.sha;
    } catch (e) {
      if ((e.trangThai === 409 || e.trangThai === 422) && lan < 3) {
        baoTienDo("Kho vừa thay đổi, đang thử lại…");
        await ngu(1500);
        continue;
      }
      throw e;
    }
  }
}

// Theo dõi GitHub Actions dựng web: hỏi 10 giây một lần, tối đa 5 phút
async function choDungWeb(sha) {
  const batDau = Date.now();
  while (Date.now() - batDau < 5 * 60 * 1000) {
    await ngu(10000);
    try {
      const kq = await gh(`/repos/${KHO}/actions/runs?head_sha=${sha}&per_page=5`);
      const lan = kq.workflow_runs?.[0];
      if (lan && lan.status === "completed") return lan;
    } catch (e) {
      if (e.trangThai === 403 || e.trangThai === 404) return { khongXemDuoc: true };
    }
  }
  return null;
}

// ================= Bản nháp (IndexedDB, chỉ trên máy này) =================
function moDb() {
  return new Promise((ok, loi) => {
    const yc = indexedDB.open("vkt-dang-bai", 1);
    yc.onupgradeneeded = () => yc.result.createObjectStore("nhap", { keyPath: "id" });
    yc.onsuccess = () => ok(yc.result);
    yc.onerror = () => loi(yc.error);
  });
}
async function dbLam(cheDo, viec) {
  const db = await moDb();
  return new Promise((ok, loi) => {
    const tx = db.transaction("nhap", cheDo);
    const yc = viec(tx.objectStore("nhap"));
    tx.oncomplete = () => ok(yc?.result);
    tx.onerror = () => loi(tx.error);
  });
}
const ghiNhapDb = (nhap) => dbLam("readwrite", (kho) => kho.put(nhap));
const docNhapDb = (id) => dbLam("readonly", (kho) => kho.get(id));
const tatCaNhapDb = () => dbLam("readonly", (kho) => kho.getAll());
const xoaNhapDb = (id) => dbLam("readwrite", (kho) => kho.delete(id));

// ================= Phần khai báo đầu bài (front matter) =================
function tachFrontMatter(van) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?([\s\S]*)$/.exec(van);
  if (!m) return { fm: {}, than: van };
  const fm = jsyaml.load(m[1]) || {};
  // js-yaml đọc ngày thành Date, đổi lại thành chuỗi 2026-10-09 cho dễ sửa
  for (const k of Object.keys(fm)) if (fm[k] instanceof Date) fm[k] = fm[k].toISOString().slice(0, 10);
  return { fm, than: m[2].replace(/^\s*\n/, "") };
}

const ghepBai = (fm, than) =>
  `---\n${jsyaml.dump(fm, { lineWidth: -1, noRefs: true, quotingType: '"' })}---\n\n${String(than || "").trim()}\n`;

// Sắp khóa theo đúng thứ tự trong đặc tả; giữ lại các khóa lạ có sẵn trong bài cũ (ví dụ "mau")
function frontMatterTheoThuTu(loai, fm) {
  const chung = ["title", "duong_dan", "date", "cap_nhat", "mo_ta", "anh_bia", "anh_bia_mo_ta", "do_tuoi", "chu_de", "noi_bat", "video", "lien_quan", "an"];
  const rieng = {
    "goc-cha-me": ["tom_tat", "nguon"],
    truyen: ["bo_truyen", "ky", "ten_ky", "tom_tat_ky", "loi_ngo", "cau_hoi", "hoat_dong_tiep_noi"],
    "hoc-cung-con": ["muc_tieu", "thoi_gian_phut", "vat_lieu", "noi_lam", "truyen_lien_quan", "cau_hoi_cuoi"],
    "nhat-ky": ["giai_doan", "ket_qua"],
  }[loai];
  const kq = {};
  for (const k of [...chung, ...rieng]) if (fm[k] !== undefined && !(k === "cap_nhat" && !fm[k])) kq[k] = fm[k];
  for (const k of Object.keys(fm)) if (!(k in kq) && fm[k] !== undefined) kq[k] = fm[k];
  return kq;
}

function duongDanTep(b) {
  if (b.loai === "truyen" && b.fm.bo_truyen) return `noi-dung/truyen/${b.fm.bo_truyen}/ky-${b.fm.ky}.md`;
  return `noi-dung/${b.loai}/${b.fm.duong_dan}.md`;
}
function urlBai(b) {
  if (b.loai === "truyen" && b.fm.bo_truyen) return `/truyen/${b.fm.bo_truyen}/ky-${b.fm.ky}/`;
  return `${LOAI[b.loai].duongDan}${b.fm.duong_dan}/`;
}
function loaiTuDuongDan(p) {
  const m = /^noi-dung\/([^/]+)\//.exec(p);
  return m && LOAI[m[1]] ? m[1] : null;
}

// Kỳ tiếp theo của một bộ truyện, dựa trên các file đang có trong kho
function kyTiepTheo(maBo) {
  let lon = 0;
  for (const p of cayKho) {
    const m = new RegExp(`^noi-dung/truyen/${maBo}/ky-(\\d+)\\.md$`).exec(p);
    if (m) lon = Math.max(lon, Number(m[1]));
  }
  return lon + 1;
}

// ================= Ảnh: nén ngay trên máy, xóa thông tin ẩn (EXIF, GPS) =================
async function nenAnh(tep) {
  if (/hei[cf]/i.test(tep.type) || /\.hei[cf]$/i.test(tep.name)) {
    throw new Error(
      "Ảnh HEIC của iPhone chưa đọc được. Vào Cài đặt › Camera › Định dạng, chọn \"Tương thích nhất\", hoặc chụp màn hình ảnh rồi chèn.",
    );
  }
  if (!/^image\/(jpeg|png|webp)$/.test(tep.type)) throw new Error("Chỉ nhận ảnh JPG, PNG hoặc WebP.");
  // Đọc ảnh theo đúng chiều chụp, rồi vẽ lại lên canvas: bước vẽ lại này xóa toàn bộ EXIF, kể cả tọa độ GPS
  const hinh = await createImageBitmap(tep, { imageOrientation: "from-image" });
  const tiLe = Math.min(1, 1600 / Math.max(hinh.width, hinh.height));
  const rong = Math.round(hinh.width * tiLe);
  const cao = Math.round(hinh.height * tiLe);
  const canvas = document.createElement("canvas");
  canvas.width = rong;
  canvas.height = cao;
  canvas.getContext("2d").drawImage(hinh, 0, 0, rong, cao);
  hinh.close?.();
  const xuat = (kieu, cl) => new Promise((ok) => canvas.toBlob(ok, kieu, cl));
  let duoi = "webp";
  let blob = await xuat("image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") {
    duoi = "jpg";
    blob = await xuat("image/jpeg", 0.85);
  }
  if (blob.size > 400 * 1024) {
    const nhoHon = await xuat(duoi === "webp" ? "image/webp" : "image/jpeg", 0.72);
    if (nhoHon) blob = nhoHon;
  }
  return { blob, duoi, rong, cao };
}

function urlAnh(id) {
  if (!urlAnhTam.has(id)) urlAnhTam.set(id, URL.createObjectURL(bai.anh[id].blob));
  return urlAnhTam.get(id);
}
function donUrlAnh() {
  for (const u of urlAnhTam.values()) URL.revokeObjectURL(u);
  urlAnhTam.clear();
}
// Trong bản nháp, ảnh mới được ghi là "vkt-anh:<id>"; trong khung soạn thì thay bằng blob: để hiện được
const vaoKhungSoan = (md) => String(md || "").replace(/vkt-anh:([a-z0-9]+)/g, (goc, id) => (bai.anh[id] ? urlAnh(id) : goc));
function raKhungSoan(md) {
  let kq = String(md || "");
  for (const [id, u] of urlAnhTam) kq = kq.split(u).join(`vkt-anh:${id}`);
  // Không có H1 trong bài (tiêu đề bài đã là H1): đổi "# " thành "## "
  return kq.replace(/^# /gm, "## ");
}

// ================= Chuyển nội dung khung soạn (HTML) sang Markdown =================
// Toast UI nối các đoạn văn bằng MỘT dấu xuống dòng, lên web sẽ bị dính thành một đoạn.
// Vì vậy tự chuyển HTML của khung soạn sang Markdown chuẩn: mỗi đoạn cách nhau một dòng trống.
function htmlSangMd(html) {
  const khung = document.createElement("template");
  khung.innerHTML = html;
  const thoatMd = (s) => s.replace(/\\/g, "\\\\").replace(/([`*_[\]<])/g, "\\$1");

  const boc = (chu, dau) => {
    if (!chu.trim()) return chu;
    const truoc = chu.match(/^\s*/)[0];
    const sau = chu.match(/\s*$/)[0];
    return `${truoc}${dau}${chu.trim()}${dau}${sau}`;
  };

  function anhMd(c) {
    if (c.classList.contains("ProseMirror-separator")) return "";
    return `![${(c.getAttribute("alt") || "").replace(/[[\]]/g, "")}](${c.getAttribute("src") || ""})`;
  }

  function trongDong(nut) {
    let kq = "";
    for (const c of nut.childNodes) {
      if (c.nodeType === 3) {
        kq += thoatMd(c.nodeValue.replace(/\s+/g, " "));
        continue;
      }
      if (c.nodeType !== 1) continue;
      const the = c.tagName;
      if (the === "BR") {
        if (!c.classList.contains("ProseMirror-trailingBreak")) kq += "\\\n";
      } else if (the === "STRONG" || the === "B") kq += boc(trongDong(c), "**");
      else if (the === "EM" || the === "I") kq += boc(trongDong(c), "*");
      else if (the === "S" || the === "DEL") kq += boc(trongDong(c), "~~");
      else if (the === "CODE") kq += "`" + c.textContent + "`";
      else if (the === "A") kq += `[${trongDong(c).trim() || c.getAttribute("href")}](${c.getAttribute("href") || ""})`;
      else if (the === "IMG") kq += anhMd(c);
      else kq += trongDong(c);
    }
    return kq;
  }

  function danhSach(nut, thuLui = "") {
    const coSo = nut.tagName === "OL";
    let i = Number(nut.getAttribute("start")) || 1;
    const dong = [];
    for (const li of nut.children) {
      if (li.tagName !== "LI") continue;
      const dau = coSo ? `${i++}. ` : "- ";
      const phan = [];
      const con = [];
      for (const c of li.childNodes) {
        if (c.nodeType === 1 && (c.tagName === "UL" || c.tagName === "OL")) con.push(danhSach(c, thuLui + " ".repeat(dau.length)));
        else if (c.nodeType === 1 && c.tagName === "P") phan.push(trongDong(c).trim());
        else {
          const tam = document.createElement("span");
          tam.append(c.cloneNode(true));
          phan.push(trongDong(tam).trim());
        }
      }
      dong.push(thuLui + dau + phan.filter(Boolean).join(" "));
      for (const c of con) dong.push(c);
    }
    return dong.join("\n");
  }

  // Bảng giữ dạng HTML gọn (bỏ thuộc tính thừa dán từ Word)
  function bangGon(bang) {
    const ban = bang.cloneNode(true);
    for (const n of [ban, ...ban.querySelectorAll("*")]) {
      for (const a of [...n.attributes]) if (a.name !== "colspan" && a.name !== "rowspan") n.removeAttribute(a.name);
    }
    return ban.outerHTML.replace(/>\s+</g, "><");
  }

  function khoi(nut) {
    const kq = [];
    for (const c of nut.childNodes) {
      if (c.nodeType === 3) {
        if (c.nodeValue.trim()) kq.push(thoatMd(c.nodeValue.trim()));
        continue;
      }
      if (c.nodeType !== 1) continue;
      const the = c.tagName;
      if (the === "P") {
        const chu = trongDong(c).replace(/\\\n$/, "").trim();
        if (chu) kq.push(chu);
      } else if (the === "H1" || the === "H2") kq.push("## " + trongDong(c).trim());
      else if (/^H[3-6]$/.test(the)) kq.push("### " + trongDong(c).trim());
      else if (the === "UL" || the === "OL") kq.push(danhSach(c));
      else if (the === "BLOCKQUOTE") kq.push(khoi(c).split("\n").map((d) => (d ? "> " + d : ">")).join("\n"));
      else if (the === "HR") kq.push("---");
      else if (the === "PRE") kq.push("```\n" + c.textContent.replace(/\n$/, "") + "\n```");
      else if (the === "TABLE") kq.push(bangGon(c));
      else if (the === "IMG") kq.push(anhMd(c));
      else {
        const ben = khoi(c);
        if (ben) kq.push(ben);
      }
    }
    return kq.filter(Boolean).join("\n\n");
  }

  return khoi(khung.content).replace(/\n{3,}/g, "\n\n").trim();
}

// ================= Màn hình =================
function hien(ten) {
  for (const m of $$(".man")) m.hidden = m.dataset.man !== ten;
  const moKhoa = Boolean(token);
  $("[data-khoa-ngay]").hidden = !moKhoa;
  $('[data-di="cai-dat"]').hidden = !moKhoa || ten === "cai-dat";
  window.scrollTo(0, 0);
}

// Hộp thoại dùng chung. Trả về true khi bấm "Đồng ý".
function hoiThoai({ tieuDe, than, chuDongY = "Đồng ý", nutDo = false, anHuy = false }) {
  const hop = $("[data-hop-thoai]");
  $("[data-hop-thoai-tieu-de]", hop).textContent = tieuDe;
  $("[data-hop-thoai-than]", hop).replaceChildren(typeof than === "string" ? el("p", { text: than }) : than);
  const nut = $("[data-hop-thoai-dong-y]", hop);
  nut.textContent = chuDongY;
  nut.classList.toggle("nut-do", nutDo);
  $('button[value="huy"]', hop).hidden = anHuy;
  hop.returnValue = "";
  hop.showModal();
  return new Promise((ok) => hop.addEventListener("close", () => ok(hop.returnValue === "dong-y"), { once: true }));
}

// ================= Khóa / mở khóa =================
function khoaTrang(loiNhan) {
  if (bai && daSuaChuaLuu) luuNhap();
  token = null;
  $("#o-pin").value = "";
  veChamPin();
  hien(docLS(KHOA_TOKEN) ? "mo-khoa" : "thiet-lap");
  if (loiNhan) baoChung(loiNhan);
}

function veChamPin() {
  $(".cham-pin").replaceChildren(...[...$("#o-pin").value].map(() => el("span")));
}

async function moKhoa() {
  const pin = $("#o-pin").value;
  const bao = $("[data-ket-qua-pin]");
  bao.className = "ket-qua-nho";
  if (pin.length < 6) {
    bao.textContent = "PIN có ít nhất 6 chữ số.";
    return;
  }
  bao.textContent = "Đang mở khóa…";
  try {
    token = await giaiMaToken(pin);
  } catch {
    const sai = (docLS(KHOA_SAI_PIN, 0) || 0) + 1;
    $("#o-pin").value = "";
    veChamPin();
    if (sai >= SO_LAN_SAI_TOI_DA) {
      xoaLS(KHOA_TOKEN);
      xoaLS(KHOA_SAI_PIN);
      bao.textContent = "";
      hien("thiet-lap");
      baoChung("Nhập sai PIN 5 lần, token đã được xóa khỏi máy này để an toàn. Hãy thiết lập lại.", true);
      return;
    }
    ghiLS(KHOA_SAI_PIN, sai);
    bao.className = "ket-qua-nho loi";
    bao.textContent = `PIN chưa đúng. Còn ${SO_LAN_SAI_TOI_DA - sai} lần thử.`;
    return;
  }
  xoaLS(KHOA_SAI_PIN);
  bao.textContent = "Đang tải dữ liệu từ GitHub…";
  lanThaoTacCuoi = Date.now();
  try {
    await taiDuLieuKho();
  } catch (e) {
    bao.className = "ket-qua-nho loi";
    bao.textContent = loiDeHieu(e);
    token = null;
    return;
  }
  bao.textContent = "";
  $("#o-pin").value = "";
  veChamPin();
  await veBang();
  hien("bang");
}

// Tự khóa sau 30 phút không thao tác
for (const su of ["pointerdown", "keydown", "input", "scroll"]) addEventListener(su, () => (lanThaoTacCuoi = Date.now()), { passive: true });
setInterval(() => {
  if (token && Date.now() - lanThaoTacCuoi > PHUT_TU_KHOA * 60 * 1000) khoaTrang(`Đã tự khóa sau ${PHUT_TU_KHOA} phút không thao tác.`);
}, 20000);

// ================= Thiết lập =================
let tokenDaThu = "";
async function thuKetNoi() {
  const tk = $("#o-token").value.trim();
  const bao = $("[data-ket-qua-token]");
  bao.className = "ket-qua-nho";
  if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tk)) {
    bao.className = "ket-qua-nho loi";
    bao.textContent = "Token chưa đúng dạng. Token mới của GitHub bắt đầu bằng github_pat_.";
    return false;
  }
  bao.textContent = "Đang thử kết nối…";
  const cu = token;
  token = tk;
  try {
    await gh(`/repos/${KHO}`);
    let ghiChu = "";
    try {
      await gh(`/repos/${KHO}/actions/runs?per_page=1`);
    } catch {
      ghiChu = " Lưu ý: token chưa có quyền Actions: Read nên sẽ không xem được tiến độ dựng web (vẫn đăng bài được).";
    }
    bao.className = "ket-qua-nho ok";
    bao.textContent = `Kết nối được kho ${KHO}.${ghiChu}`;
    tokenDaThu = tk;
    return true;
  } catch (e) {
    bao.className = "ket-qua-nho loi";
    bao.textContent = loiDeHieu(e);
    return false;
  } finally {
    token = cu;
  }
}

const tachTuNhayCam = (chu) => [...new Set(String(chu || "").split(/[\n,;]+/).map((t) => t.trim()).filter((t) => t.length >= 2))];

async function luuThietLap() {
  const bao = $("[data-ket-qua-thiet-lap]");
  bao.className = "ket-qua-nho loi";
  const tk = $("#o-token").value.trim();
  if (tk !== tokenDaThu && !(await thuKetNoi())) {
    bao.textContent = "Chưa kết nối được bằng token này. Xem lại Bước 1.";
    return;
  }
  const p1 = $("#o-pin-1").value;
  const p2 = $("#o-pin-2").value;
  if (!/^\d{6,}$/.test(p1)) {
    bao.textContent = "PIN phải gồm ít nhất 6 chữ số.";
    return;
  }
  if (p1 !== p2) {
    bao.textContent = "Hai lần nhập PIN chưa giống nhau.";
    return;
  }
  bao.className = "ket-qua-nho";
  bao.textContent = "Đang khóa token bằng PIN…";
  await maHoaToken(tk, p1);
  ghiLS(KHOA_TU_NHAY_CAM, tachTuNhayCam($("#o-tu-nhay-cam").value));
  xoaLS(KHOA_SAI_PIN);
  for (const o of ["#o-token", "#o-pin-1", "#o-pin-2"]) $(o).value = "";
  token = tk;
  lanThaoTacCuoi = Date.now();
  bao.textContent = "Đang tải dữ liệu từ GitHub…";
  try {
    await taiDuLieuKho();
  } catch (e) {
    bao.className = "ket-qua-nho loi";
    bao.textContent = loiDeHieu(e);
    return;
  }
  bao.textContent = "";
  await veBang();
  hien("bang");
  baoChung("Thiết lập xong. Lần sau chỉ cần nhập PIN.");
}

// ================= Bảng điều khiển =================
async function veBang() {
  const baoToken = $("[data-bao-token]");
  if (ngayHetHanToken) {
    const ngay = Math.ceil((ngayHetHanToken - Date.now()) / 86400000);
    baoToken.hidden = ngay > 30;
    baoToken.textContent = `Token còn ${ngay} ngày. Nên tạo token mới rồi vào Cài đặt › Thay token mới trước khi hết hạn.`;
  }
  const ds = $("[data-ds-nhap]");
  const tatCa = (await tatCaNhapDb()).sort((a, b) => b.sua - a.sua);
  ds.replaceChildren(
    ...(tatCa.length
      ? tatCa.map((n) =>
          el(
            "li",
            {},
            el("p", { class: "ds-ten", text: n.fm.title || "(chưa có tiêu đề)" }),
            el("p", { class: "ds-phu", text: `${LOAI[n.loai].ten} · ${n.laSua ? "đang sửa bài đã đăng · " : ""}sửa lần cuối ${ngayGio(n.sua)}` }),
            el(
              "div",
              { class: "hang" },
              el("button", { type: "button", class: "nut", text: "Mở", onclick: async () => moSoan(await docNhapDb(n.id)) }),
              el("button", {
                type: "button",
                class: "nut nut-do",
                text: "Xóa nháp",
                onclick: async () => {
                  const dongY = await hoiThoai({ tieuDe: "Xóa bản nháp?", than: `"${n.fm.title || "(chưa có tiêu đề)"}" sẽ bị xóa khỏi máy này.`, chuDongY: "Xóa", nutDo: true });
                  if (!dongY) return;
                  await xoaNhapDb(n.id);
                  veBang();
                },
              }),
            ),
          ),
        )
      : [el("li", { class: "ds-trong", text: "Chưa có bản nháp nào." })]),
  );
}

// Bài đã đăng: đọc cây thư mục bằng một lệnh, rồi đọc phần khai báo từng bài (nhớ theo sha để khỏi đọc lại)
const boNhoBai = new Map();
let dsBaiDaDang = [];
async function taiDsBai() {
  const ds = $("[data-ds-bai]");
  ds.replaceChildren(el("li", { class: "ds-trong", text: "Đang tải…" }));
  try {
    const tep = (await taiCayKho()).filter((t) => /^noi-dung\/(goc-cha-me|truyen|hoc-cung-con|nhat-ky)\/.+\.md$/.test(t.path));
    let i = 0;
    const lam = async () => {
      while (i < tep.length) {
        const t = tep[i++];
        if (!boNhoBai.has(t.sha)) {
          const blob = await gh(`/repos/${KHO}/git/blobs/${t.sha}`);
          boNhoBai.set(t.sha, tachFrontMatter(chuTuB64(blob.content)));
        }
      }
    };
    await Promise.all(Array.from({ length: 6 }, lam));
    dsBaiDaDang = tep
      .map((t) => ({ path: t.path, loai: loaiTuDuongDan(t.path), ...boNhoBai.get(t.sha) }))
      .sort((a, b) => String(b.fm.date).localeCompare(String(a.fm.date)));
    veDsBai();
  } catch (e) {
    ds.replaceChildren(el("li", { class: "ds-trong", text: loiDeHieu(e) }));
  }
}

function veDsBai() {
  const tim = boDau($("[data-tim-bai]").value).toLowerCase().trim();
  const loc = dsBaiDaDang.filter((b) => !tim || boDau(`${b.fm.title} ${b.path}`).toLowerCase().includes(tim));
  $("[data-ds-bai]").replaceChildren(
    ...(loc.length
      ? loc.map((b) =>
          el(
            "li",
            {},
            el("p", { class: "ds-ten" }, b.fm.title || b.path, b.fm.an ? el("span", { class: "nhan-an", text: "Đang ẩn" }) : null),
            el("p", { class: "ds-phu", text: `${LOAI[b.loai].ten} · ${b.fm.date || ""}` }),
            el(
              "div",
              { class: "hang" },
              el("button", { type: "button", class: "nut", text: "Sửa", onclick: () => suaBai(b) }),
              el("button", { type: "button", class: "nut nut-vien", text: b.fm.an ? "Hiện lại" : "Ẩn bài", onclick: () => anHienBai(b, !b.fm.an) }),
              el("button", { type: "button", class: "nut nut-do", text: "Xóa hẳn", onclick: () => xoaHanBai(b) }),
            ),
          ),
        )
      : [el("li", { class: "ds-trong", text: dsBaiDaDang.length ? "Không có bài nào khớp." : "Bấm Tải danh sách để xem các bài đã đăng." })]),
  );
}

async function anHienBai(b, an) {
  const chu = an ? "Ẩn" : "Hiện";
  const giaiThich = an
    ? "Bài sẽ biến mất khỏi web, sơ đồ web và ô tìm kiếm sau khoảng 1–2 phút. File bài vẫn còn, hiện lại được bất cứ lúc nào."
    : "Bài sẽ hiện lại trên web sau khoảng 1–2 phút.";
  if (!(await hoiThoai({ tieuDe: `${chu} bài này?`, than: giaiThich }))) return;
  try {
    baoChung("Đang gửi lên GitHub…");
    const fm = { ...b.fm, an };
    await guiCommit([{ path: b.path, base64: b64TuChu(ghepBai(fm, b.than)) }], `${chu}: ${b.fm.title}`);
    b.fm = fm;
    veDsBai();
    baoChung(`Đã ${chu.toLowerCase()} bài. Web cập nhật sau khoảng 1–2 phút.`);
  } catch (e) {
    baoChung(loiDeHieu(e), true);
  }
}

async function xoaHanBai(b) {
  const lan1 = await hoiThoai({ tieuDe: "Xóa hẳn bài này?", than: 'Nên dùng "Ẩn bài" thay cho xóa: ẩn thì hiện lại được, xóa thì không.', chuDongY: "Vẫn xóa", nutDo: true });
  if (!lan1) return;
  const lan2 = await hoiThoai({
    tieuDe: "Xác nhận lần cuối",
    than: "File vẫn còn trong lịch sử GitHub. Nếu bài lỡ chứa thông tin nhạy cảm, hãy nhờ Claude Code xóa khỏi lịch sử.",
    chuDongY: "Xóa hẳn",
    nutDo: true,
  });
  if (!lan2) return;
  try {
    baoChung("Đang xóa…");
    await guiCommit([{ path: b.path, xoa: true }], `Xóa: ${b.fm.title}`);
    dsBaiDaDang = dsBaiDaDang.filter((x) => x.path !== b.path);
    veDsBai();
    baoChung("Đã xóa bài. Web cập nhật sau khoảng 1–2 phút.");
  } catch (e) {
    baoChung(loiDeHieu(e), true);
  }
}

async function suaBai(b) {
  const nhapCu = (await tatCaNhapDb()).find((n) => n.laSua && n.duongDanTep === b.path);
  if (nhapCu && (await hoiThoai({ tieuDe: "Có bản nháp đang sửa dở", than: `Bài này có bản nháp sửa lúc ${ngayGio(nhapCu.sua)}. Mở bản nháp đó?`, chuDongY: "Mở bản nháp" }))) {
    return moSoan(nhapCu);
  }
  try {
    const { fm, than } = tachFrontMatter(await docTep(b.path)); // đọc bản mới nhất trên GitHub
    moSoan({ id: taoId(), loai: b.loai, fm, noiDung: than, anh: {}, tao: Date.now(), sua: Date.now(), laSua: true, duongDanTep: b.path });
  } catch (e) {
    baoChung(loiDeHieu(e), true);
  }
}

// ================= Trình soạn =================
const layGT = (k) => k.split(".").reduce((o, p) => o?.[p], bai.fm);
function datGT(k, v) {
  const phan = k.split(".");
  let o = bai.fm;
  for (const p of phan.slice(0, -1)) o = o[p] ||= {};
  o[phan.at(-1)] = v;
  danhDauSua();
}

function fmMoi(loai) {
  const chung = { title: "", duong_dan: "", date: homNay(), mo_ta: "", anh_bia: "", anh_bia_mo_ta: "", do_tuoi: [], chu_de: [], noi_bat: false, video: "", lien_quan: [], an: false };
  const rieng = {
    "goc-cha-me": { tom_tat: ["", "", ""], nguon: [] },
    truyen: { ky: 1, ten_ky: "", tom_tat_ky: "", loi_ngo: "", cau_hoi: { nho_lai: [""], cam_nhan: [""], lien_he: [""] }, hoat_dong_tiep_noi: "" },
    "hoc-cung-con": { muc_tieu: "", thoi_gian_phut: 20, vat_lieu: [""], noi_lam: "ở nhà", truyen_lien_quan: "", cau_hoi_cuoi: [""] },
    "nhat-ky": { giai_doan: "", ket_qua: "" },
  }[loai];
  return { ...chung, ...structuredClone(rieng) };
}

function vietBaiMoi(loai) {
  moSoan({ id: taoId(), loai, fm: fmMoi(loai), noiDung: "", anh: {}, tao: Date.now(), sua: Date.now(), laSua: false });
}

function danhDauSua() {
  daSuaChuaLuu = true;
  clearTimeout(danhDauSua.hen);
  danhDauSua.hen = setTimeout(luuNhap, 1500);
}
setInterval(() => bai && daSuaChuaLuu && luuNhap(), 10000);

async function luuNhap() {
  if (!bai || !editor) return;
  bai.noiDung = raKhungSoan(htmlSangMd(editor.getHTML()));
  bai.sua = Date.now();
  daSuaChuaLuu = false;
  try {
    await ghiNhapDb(bai);
    $("[data-trang-thai-nhap]").textContent = `Đã lưu nháp trên máy lúc ${gioPhut(bai.sua)}`;
  } catch {
    $("[data-trang-thai-nhap]").textContent = "Chưa lưu được nháp (bộ nhớ trình duyệt bị chặn).";
  }
}

function taoTrinhSoan() {
  if (editor) return;
  const { Editor } = toastui;
  Editor.setLanguage("vi", {
    Markdown: "Markdown", WYSIWYG: "Soạn trực quan", Write: "Viết", Preview: "Xem trước", Headings: "Tiêu đề", Paragraph: "Đoạn văn",
    Bold: "Đậm", Italic: "Nghiêng", Strike: "Gạch ngang", Code: "Mã", Line: "Đường kẻ", Blockquote: "Trích dẫn",
    "Unordered list": "Danh sách chấm", "Ordered list": "Danh sách số", Task: "Việc cần làm", Indent: "Thụt vào", Outdent: "Thụt ra",
    "Insert link": "Chèn liên kết", "Insert CodeBlock": "Chèn khối mã", "Insert table": "Chèn bảng", "Insert image": "Chèn ảnh",
    Heading: "Tiêu đề", "Image URL": "Địa chỉ ảnh", "Select image file": "Chọn ảnh", "Choose a file": "Chọn file", "No file": "Chưa chọn file",
    Description: "Mô tả", OK: "Đồng ý", More: "Thêm", Cancel: "Hủy", File: "File", URL: "Địa chỉ", "Link text": "Chữ hiển thị",
    "Add row": "Thêm hàng", "Add col": "Thêm cột", "Remove row": "Xóa hàng", "Remove col": "Xóa cột",
    "Align column to left": "Căn trái", "Align column to center": "Căn giữa", "Align column to right": "Căn phải",
    "Remove table": "Xóa bảng", "Would you like to paste as table?": "Dán thành bảng?", "Text color": "Màu chữ",
    "Auto scroll enabled": "Bật cuộn theo", "Auto scroll disabled": "Tắt cuộn theo", "Choose language": "Chọn ngôn ngữ",
  });
  const nutCongCu = (ten, chu, nhan, khiBam) => {
    const n = el("button", { type: "button", class: "toastui-editor-toolbar-icons nut-cong-cu", "aria-label": nhan, text: chu });
    n.addEventListener("click", khiBam);
    return { name: ten, tooltip: nhan, el: n };
  };
  editor = new Editor({
    el: $("[data-trinh-soan]"),
    height: window.innerWidth < 640 ? "460px" : "560px",
    initialEditType: "wysiwyg",
    previewStyle: "tab",
    hideModeSwitch: true,
    usageStatistics: false, // TẮT gửi thống kê về Google của thư viện
    language: "vi",
    placeholder: "Viết hoặc dán nội dung bài ở đây…",
    toolbarItems: [
      [
        nutCongCu("h2", "H2", "Tiêu đề mục", () => editor.exec("heading", { level: 2 })),
        nutCongCu("h3", "H3", "Tiêu đề nhỏ", () => editor.exec("heading", { level: 3 })),
        "bold",
        "italic",
      ],
      ["quote", "ul", "ol"],
      ["link", "table", "hr"],
      [nutCongCu("anh", "Ảnh", "Chèn ảnh", () => chonAnh("noi-dung")), nutCongCu("video", "Video", "Chèn video YouTube", chenVideo)],
    ],
    events: { change: () => bai && danhDauSua() },
  });
}

async function moSoan(nhap) {
  if (!nhap) return;
  donUrlAnh();
  bai = nhap;
  bai.anh ||= {};
  taoTrinhSoan();
  $("[data-tieu-de-soan]").textContent = `${bai.laSua ? "Sửa" : "Viết"} bài · ${LOAI[bai.loai].ten}`;
  $("[data-trang-thai-nhap]").textContent = bai.laSua ? "Đang sửa bài đã đăng" : "";
  veForm();
  editor.setMarkdown(vaoKhungSoan(bai.noiDung), false);
  daSuaChuaLuu = false;
  hien("soan");
}

// ---------- Các kiểu ô điền ----------
function oChu(k, nhan, { goiY, dem, tuyChon, kieu = "text", soDong = 0, chiDoc = false, khiNhap } = {}) {
  const id = `o-${k.replace(/\W/g, "-")}`;
  const o = soDong
    ? el("textarea", { id, rows: soDong, "data-k": k })
    : el("input", { id, type: kieu, "data-k": k, readonly: chiDoc, inputmode: kieu === "number" ? "numeric" : null });
  o.value = layGT(k) ?? "";
  const demO = dem ? el("p", { class: "dem-ky-tu" }) : null;
  const capNhatDem = () => {
    if (!demO) return;
    const n = o.value.length;
    demO.textContent = `${n} ký tự (nên ${dem[0] ? `${dem[0]}–` : "tối đa "}${dem[1]})`;
    demO.classList.toggle("canh-bao", n > dem[1] || (dem[0] && n > 0 && n < dem[0]));
  };
  capNhatDem();
  o.addEventListener("input", () => {
    datGT(k, kieu === "number" ? (o.value === "" ? "" : Number(o.value)) : o.value);
    capNhatDem();
    khiNhap?.(o.value);
  });
  return el(
    "div",
    {},
    el("label", { class: "nhan-o", for: id }, nhan, tuyChon ? el("span", { class: "tuy-chon", text: " (không bắt buộc)" }) : null),
    goiY ? el("p", { class: "goi-y", text: goiY }) : null,
    o,
    demO,
  );
}

function nhomChon(k, nhan, dsMuc) {
  const daChon = new Set(layGT(k) || []);
  return el(
    "div",
    {},
    el("p", { class: "nhan-o", text: nhan }),
    el(
      "div",
      { class: "nhom-chon", role: "group", "aria-label": nhan },
      dsMuc.map((m) => {
        const n = el("button", { type: "button", "aria-pressed": String(daChon.has(m.ma)), text: m.ten });
        n.addEventListener("click", () => {
          daChon.has(m.ma) ? daChon.delete(m.ma) : daChon.add(m.ma);
          n.setAttribute("aria-pressed", String(daChon.has(m.ma)));
          datGT(k, dsMuc.map((x) => x.ma).filter((x) => daChon.has(x))); // giữ đúng thứ tự gốc
        });
        return n;
      }),
    ),
  );
}

// Danh sách nhiều dòng có nút "+ thêm dòng". haiCot: mỗi dòng gồm tên + link (nguồn tham khảo)
function dsDong(k, nhan, { goiY, coDinh = 0, haiCot = false, tuyChon } = {}) {
  const vung = el("div", { class: "danh-sach-dong" });
  const ve = () => {
    const ds = layGT(k) || [];
    vung.replaceChildren(
      ...ds.map((gt, i) => {
        const capNhat = (giaTriMoi) => {
          const moi = [...(layGT(k) || [])];
          moi[i] = giaTriMoi;
          datGT(k, moi);
        };
        const nutXoa = coDinh
          ? null
          : el("button", {
              type: "button",
              "aria-label": "Xóa dòng này",
              text: "×",
              onclick: () => {
                datGT(k, (layGT(k) || []).filter((_, j) => j !== i));
                ve();
              },
            });
        if (haiCot) {
          const ten = el("input", { type: "text", placeholder: "Tên sách, bài viết", "aria-label": "Tên nguồn" });
          const link = el("input", { type: "url", placeholder: "https://…", "aria-label": "Đường link" });
          ten.value = gt?.ten || "";
          link.value = gt?.link || "";
          const doi = () => capNhat({ ten: ten.value, link: link.value });
          ten.addEventListener("input", doi);
          link.addEventListener("input", doi);
          return el("div", { class: "dong" }, el("div", { class: "dong-hai" }, ten, link), nutXoa);
        }
        const o = el("input", { type: "text", "aria-label": `${nhan} ${i + 1}` });
        o.value = gt || "";
        o.addEventListener("input", () => capNhat(o.value));
        return el("div", { class: "dong" }, o, nutXoa);
      }),
    );
  };
  ve();
  const nutThem = coDinh
    ? null
    : el("button", {
        type: "button",
        class: "nut-them",
        text: "+ thêm dòng",
        onclick: () => {
          datGT(k, [...(layGT(k) || []), haiCot ? { ten: "", link: "" } : ""]);
          ve();
          $$("input", vung).at(haiCot ? -2 : -1)?.focus();
        },
      });
  return el(
    "div",
    {},
    el("p", { class: "nhan-o" }, nhan, tuyChon ? el("span", { class: "tuy-chon", text: " (không bắt buộc)" }) : null),
    goiY ? el("p", { class: "goi-y", text: goiY }) : null,
    vung,
    nutThem,
  );
}

function oDanhDau(k, nhan) {
  const o = el("input", { type: "checkbox" });
  o.checked = Boolean(layGT(k));
  o.addEventListener("change", () => datGT(k, o.checked));
  return el("label", { class: "o-chon" }, o, el("span", { text: nhan }));
}

function oChonMot(k, nhan, luaChon, goiY) {
  const id = `o-${k}`;
  const o = el("select", { id }, luaChon.map(([gt, ten]) => el("option", { value: gt, text: ten })));
  o.value = layGT(k) ?? luaChon[0][0];
  o.addEventListener("change", () => datGT(k, o.value));
  return el("div", {}, el("label", { class: "nhan-o", for: id, text: nhan }), goiY ? el("p", { class: "goi-y", text: goiY }) : null, o);
}

function oAnhBia() {
  const anh = el("img", { class: "anh-bia-xem", alt: "" });
  const capNhatAnh = () => {
    const gt = bai.fm.anh_bia;
    anh.hidden = !gt;
    if (gt) anh.src = gt.startsWith("vkt-anh:") ? urlAnh(gt.slice(8)) : gt;
    nutBo.hidden = !gt;
  };
  const nutBo = el("button", {
    type: "button",
    class: "nut nut-vien",
    text: "Bỏ ảnh bìa",
    onclick: () => {
      datGT("anh_bia", "");
      capNhatAnh();
    },
  });
  oAnhBia.capNhat = capNhatAnh;
  const khoi = el(
    "div",
    {},
    el("p", { class: "nhan-o", text: "Ảnh bìa" }),
    el("p", { class: "goi-y", text: "Hiện ở đầu bài và khi chia sẻ Zalo, Facebook. Không dùng ảnh thấy mặt trẻ. Chưa có ảnh thì web dùng ảnh tạm theo loại bài." }),
    anh,
    el("div", { class: "hang" }, el("button", { type: "button", class: "nut nut-vien", text: "Chọn ảnh bìa", onclick: () => chonAnh("bia") }), nutBo),
    oChu("anh_bia_mo_ta", "Mô tả ảnh bìa", { goiY: "Tả ngắn ảnh có gì, ví dụ: Đôi bàn tay trẻ đặt hạt đậu vào chậu đất." }),
  );
  capNhatAnh();
  return khoi;
}

// Chọn bộ truyện: truyện 1 trang, một bộ có sẵn, hoặc tạo bộ mới
function oBoTruyen() {
  const luaChon = [["", "Truyện 1 trang (không thuộc bộ nào)"], ...Object.entries(dsBoTruyen).map(([ma, bt]) => [ma, bt.ten]), ["__moi", "+ Tạo bộ truyện mới…"]];
  const o = el("select", { id: "o-bo-truyen" }, luaChon.map(([gt, ten]) => el("option", { value: gt, text: ten })));
  o.value = bai.boTruyenMoi ? "__moi" : bai.fm.bo_truyen || "";
  if (bai.laSua) o.disabled = true;
  o.addEventListener("change", () => {
    if (o.value === "__moi") {
      bai.boTruyenMoi = { ma: "", ten: "", mo_ta: "" };
      bai.fm.bo_truyen = "";
      bai.fm.ky = 1;
    } else {
      bai.boTruyenMoi = null;
      bai.fm.bo_truyen = o.value;
      if (o.value) bai.fm.ky = kyTiepTheo(o.value);
    }
    tuDienTieuDe();
    danhDauSua();
    veForm();
  });
  return el(
    "div",
    {},
    el("label", { class: "nhan-o", for: "o-bo-truyen", text: "Thuộc bộ truyện" }),
    el("p", { class: "goi-y", text: "Truyện dài thì đăng từng kỳ trong cùng một bộ. Người đọc sẽ có mục lục, thanh tiến độ và nút Đọc tiếp." }),
    o,
  );
}

function oBoTruyenMoi() {
  const bm = bai.boTruyenMoi;
  const ten = el("input", { id: "o-bt-ten", type: "text" });
  const ma = el("input", { id: "o-bt-ma", type: "text" });
  const moTa = el("textarea", { id: "o-bt-mo-ta", rows: 3 });
  ten.value = bm.ten;
  ma.value = bm.ma;
  moTa.value = bm.mo_ta;
  ten.addEventListener("input", () => {
    bm.ten = ten.value;
    if (!bm.maTay) ma.value = bm.ma = taoDuongDan(ten.value);
    tuDienTieuDe();
    danhDauSua();
  });
  ma.addEventListener("input", () => {
    bm.maTay = true;
    bm.ma = ma.value;
    tuDienTieuDe();
    danhDauSua();
  });
  ma.addEventListener("blur", () => (ma.value = bm.ma = taoDuongDan(ma.value)));
  moTa.addEventListener("input", () => {
    bm.mo_ta = moTa.value;
    danhDauSua();
  });
  return el(
    "fieldset",
    { class: "nhom-truong the" },
    el("legend", { text: "Bộ truyện mới" }),
    el("label", { class: "nhan-o", for: "o-bt-ten", text: "Tên bộ truyện" }),
    ten,
    el("label", { class: "nhan-o", for: "o-bt-ma", text: "Mã bộ truyện (dùng trong đường dẫn)" }),
    el("p", { class: "goi-y", text: "Tự tạo từ tên. Ví dụ: an-va-mach-nuoc-ngam → vuonkhaitam.com/truyen/an-va-mach-nuoc-ngam/" }),
    ma,
    el("label", { class: "nhan-o", for: "o-bt-mo-ta", text: "Giới thiệu bộ truyện (2–3 câu)" }),
    moTa,
  );
}

// Truyện nhiều kỳ: tự điền tiêu đề "Tên bộ – Kỳ n: Tên kỳ" và đường dẫn, cho tới khi tác giả tự sửa
function tuDienTieuDe() {
  if (bai.loai !== "truyen") return;
  const ma = bai.boTruyenMoi ? bai.boTruyenMoi.ma : bai.fm.bo_truyen;
  if (!ma) return;
  const tenBo = bai.boTruyenMoi ? bai.boTruyenMoi.ten : dsBoTruyen[ma]?.ten || "";
  if (!bai.laSua) bai.fm.duong_dan = `${ma}-ky-${bai.fm.ky}`;
  if (!bai.tieuDeTay && !bai.laSua) {
    bai.fm.title = `${tenBo} – Kỳ ${bai.fm.ky}${bai.fm.ten_ky ? `: ${bai.fm.ten_ky}` : ""}`;
    const o = $('[data-k="title"]');
    if (o) o.value = bai.fm.title;
  }
}

function veForm() {
  const f = $("[data-form-bai]");
  const fm = bai.fm;
  const coBo = bai.loai === "truyen" && (bai.fm.bo_truyen || bai.boTruyenMoi);
  const phan = [];

  if (bai.loai === "truyen") {
    phan.push(oBoTruyen());
    if (bai.boTruyenMoi) phan.push(oBoTruyenMoi());
    if (coBo) {
      phan.push(oChu("ky", "Kỳ số", { kieu: "number", chiDoc: bai.laSua, khiNhap: tuDienTieuDe }));
      phan.push(oChu("ten_ky", "Tên kỳ này", { goiY: "Ví dụ: Giấc mơ về lu gạo không vơi", khiNhap: tuDienTieuDe }));
    }
  }

  phan.push(
    oChu("title", "Tiêu đề bài", {
      goiY: coBo ? "Tự điền theo tên bộ và tên kỳ. Sửa được nếu muốn." : "Nên viết theo câu cha mẹ hay gõ tìm, ví dụ: Con hay cáu giận: giúp con tự hạ nhiệt.",
      dem: [0, 60],
      khiNhap: () => {
        if (coBo) bai.tieuDeTay = true;
        if (!bai.laSua && !bai.slugTay && !coBo) {
          fm.duong_dan = taoDuongDan(fm.title);
          const o = $('[data-k="duong_dan"]');
          if (o) o.value = fm.duong_dan;
        }
      },
    }),
  );
  if (!coBo) {
    const oDuong = oChu("duong_dan", "Đường dẫn", {
      goiY: bai.laSua ? "Không đổi đường dẫn của bài đã đăng, vì link đã chia sẻ sẽ hỏng." : "Tự tạo từ tiêu đề: chữ thường không dấu, số và dấu gạch nối.",
      chiDoc: bai.laSua,
      khiNhap: () => (bai.slugTay = true),
    });
    $("input", oDuong).addEventListener("blur", (e) => {
      if (bai.laSua) return;
      e.target.value = taoDuongDan(e.target.value);
      datGT("duong_dan", e.target.value);
    });
    phan.push(oDuong);
  }
  phan.push(oChu("mo_ta", "Mô tả ngắn", { goiY: "Hiện trên Google và khi chia sẻ Zalo, Facebook.", dem: [120, 160], soDong: 3 }));
  phan.push(oAnhBia());
  phan.push(nhomChon("do_tuoi", "Độ tuổi", dsDoTuoi.map((t) => ({ ma: t.ma, ten: t.ten }))));
  phan.push(nhomChon("chu_de", "Chủ đề", dsChuDe.map((c) => ({ ma: c.ma, ten: c.ten }))));

  if (bai.loai === "goc-cha-me") {
    phan.push(dsDong("tom_tat", "Tóm tắt nhanh (đúng 3 ý)", { coDinh: 3, goiY: "Ba ý chính, mỗi ý một câu ngắn. Hiện trong hộp Tóm tắt nhanh ở đầu bài." }));
    phan.push(dsDong("nguon", "Nguồn tham khảo", { haiCot: true, tuyChon: true, goiY: "Sách, bài nghiên cứu: tên và link (nếu có)." }));
  }
  if (bai.loai === "truyen") {
    if (coBo) phan.push(oChu("tom_tat_ky", "Tóm tắt kỳ này (1–2 câu)", { soDong: 2, tuyChon: true, goiY: "Kỳ sau sẽ hiện đoạn này ở mục \"Kỳ trước\" để người đọc nhớ lại." }));
    phan.push(oChu("loi_ngo", "Lời ngỏ cho cha mẹ", { soDong: 3, tuyChon: true, goiY: "2–3 câu: truyện nói về điều gì, cha mẹ nên lưu ý gì khi đọc cùng con." }));
    phan.push(dsDong("cau_hoi.nho_lai", "Câu hỏi: Nhớ lại", { goiY: "Hỏi về chi tiết trong truyện." }));
    phan.push(dsDong("cau_hoi.cam_nhan", "Câu hỏi: Cảm nhận", { goiY: "Hỏi con cảm thấy thế nào." }));
    phan.push(dsDong("cau_hoi.lien_he", "Câu hỏi: Liên hệ", { goiY: "Nối truyện với đời sống của con." }));
    phan.push(oChu("hoat_dong_tiep_noi", "Hoạt động tiếp nối", { tuyChon: true, goiY: "Đường dẫn bài Học cùng con liên quan, ví dụ /hoc-cung-con/nam-chiec-hu/" }));
    if (coBo && !bai.boTruyenMoi) {
      const o = el("input", { type: "checkbox" });
      o.checked = Boolean(bai.boTruyenHoanThanh);
      o.addEventListener("change", () => {
        bai.boTruyenHoanThanh = o.checked;
        danhDauSua();
      });
      phan.push(el("label", { class: "o-chon" }, o, el("span", { text: "Đây là kỳ cuối: đánh dấu bộ truyện đã hoàn thành" })));
    }
  }
  if (bai.loai === "hoc-cung-con") {
    phan.push(oChu("muc_tieu", "Mục tiêu", { goiY: "Con làm được gì sau buổi này. Ví dụ: Con tự chia 10 đồng vào 5 hũ và giải thích lý do." }));
    phan.push(oChu("thoi_gian_phut", "Thời gian (phút)", { kieu: "number" }));
    phan.push(dsDong("vat_lieu", "Vật liệu cần chuẩn bị"));
    phan.push(oChu("noi_lam", "Nơi làm", { goiY: "Ví dụ: ở nhà, ngoài sân, trong bếp" }));
    phan.push(oChu("truyen_lien_quan", "Truyện liên quan", { tuyChon: true, goiY: "Đường dẫn bài truyện, ví dụ /truyen/an-va-mach-nuoc-ngam/ky-2/" }));
    phan.push(dsDong("cau_hoi_cuoi", "Câu hỏi cuối buổi"));
  }
  if (bai.loai === "nhat-ky") {
    phan.push(oChu("giai_doan", "Giai đoạn", { goiY: 'Chỉ ghi nhóm tuổi chung, ví dụ "đầu cấp hai". Không ghi tuổi hay lớp chính xác.' }));
    phan.push(oChonMot("ket_qua", "Nhãn (không bắt buộc)", [["", "Không gắn nhãn"], ["bo-ngo", "Còn bỏ ngỏ"], ["dang-thu", "Đang thử"], ["hieu-qua", "Hiệu quả"], ["chua-hieu-qua", "Chưa hiệu quả"]], "Bài cảm nhận, ghi chép điều đã đọc thì không cần nhãn. Câu hỏi chưa có lời giải thì chọn Còn bỏ ngỏ."));
  }

  phan.push(oChu("video", "Video YouTube ở đầu bài", { kieu: "url", tuyChon: true, goiY: "Dán link YouTube nếu muốn video hiện ngay đầu bài." }));
  phan.push(dsDong("lien_quan", "Bài liên quan", { tuyChon: true, goiY: "Đường dẫn bài khác trên Vườn Khai Tâm, ví dụ /goc-cha-me/hoc-hieu-thay-vi-hoc-thuoc/. Thiếu thì web tự gợi ý bài cùng chủ đề." }));
  phan.push(oDanhDau("noi_bat", "Đưa lên mục nổi bật ở trang chủ"));
  f.replaceChildren(el("div", { class: "the" }, phan));
}

// ---------- Ảnh ----------
function chonAnh(choDat) {
  const chon = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif" });
  chon.addEventListener("change", async () => {
    const tep = chon.files[0];
    if (!tep) return;
    let kq;
    try {
      baoChung("Đang nén ảnh…");
      kq = await nenAnh(tep);
      baoChung("");
    } catch (e) {
      baoChung(e.message, true);
      return;
    }
    const id = taoId();
    bai.anh[id] = { blob: kq.blob, duoi: kq.duoi, alt: "" };
    const xem = el("img", { src: urlAnh(id), alt: "" });
    const moTa = el("input", { type: "text", id: "o-mo-ta-anh", required: true, placeholder: "Ví dụ: Năm chiếc hũ gốm xếp trên kệ gỗ" });
    if (choDat === "bia") moTa.value = bai.fm.anh_bia_mo_ta || "";
    const dongY = await hoiThoai({
      tieuDe: choDat === "bia" ? "Ảnh bìa" : "Chèn ảnh",
      than: el(
        "div",
        {},
        xem,
        el("p", { class: "goi-y", text: `Đã nén còn ${Math.round(kq.blob.size / 1024)} KB, kích thước ${kq.rong}×${kq.cao}, đã xóa thông tin vị trí.` }),
        el("label", { class: "nhan-o", for: "o-mo-ta-anh", text: "Mô tả ảnh (bắt buộc)" }),
        el("p", { class: "goi-y", text: "Giúp người khiếm thị và Google hiểu ảnh. Tả ngắn trong ảnh có gì." }),
        moTa,
      ),
      chuDongY: choDat === "bia" ? "Dùng làm ảnh bìa" : "Chèn vào bài",
    });
    if (!dongY || !moTa.value.trim()) {
      delete bai.anh[id];
      return;
    }
    bai.anh[id].alt = moTa.value.trim();
    if (choDat === "bia") {
      datGT("anh_bia", `vkt-anh:${id}`);
      datGT("anh_bia_mo_ta", bai.anh[id].alt);
      const oMoTa = $('[data-k="anh_bia_mo_ta"]');
      if (oMoTa) oMoTa.value = bai.anh[id].alt;
      oAnhBia.capNhat?.();
    } else {
      chenKhoiRieng((s) => s.nodes.image.create({ imageUrl: urlAnh(id), altText: bai.anh[id].alt }), () =>
        editor.exec("addImage", { imageUrl: urlAnh(id), altText: bai.anh[id].alt }),
      );
    }
    danhDauSua();
  });
  chon.click();
}

// Chèn một đoạn văn riêng (ảnh, link video) tại chỗ con trỏ, không dính vào đoạn đang viết
function chenKhoiRieng(taoNoiDung, duPhong) {
  try {
    const ww = editor.wwEditor;
    const doan = ww.schema.nodes.paragraph.create(null, taoNoiDung(ww.schema));
    ww.view.dispatch(ww.view.state.tr.replaceSelectionWith(doan).scrollIntoView());
  } catch {
    duPhong();
  }
}

// ---------- Video: chèn link YouTube thành một đoạn riêng ----------
async function chenVideo() {
  const o = el("input", { type: "url", id: "o-link-video", required: true, placeholder: "https://www.youtube.com/watch?v=…" });
  const dongY = await hoiThoai({
    tieuDe: "Chèn video YouTube",
    than: el(
      "div",
      {},
      el("label", { class: "nhan-o", for: "o-link-video", text: "Link video" }),
      el("p", { class: "goi-y", text: "Nhận link dạng youtube.com/watch?v=…, youtu.be/… hoặc youtube.com/shorts/…" }),
      o,
    ),
    chuDongY: "Chèn",
  });
  if (!dongY) return;
  const id = layIdYoutube(o.value);
  if (!id) {
    baoChung("Link này không phải link video YouTube.", true);
    return;
  }
  const link = `https://www.youtube.com/watch?v=${id}`;
  // Chèn thành một đoạn văn riêng, vì web chỉ đổi thành khung video khi link nằm một mình một dòng
  chenKhoiRieng((s) => s.text(link), () => editor.setMarkdown(`${editor.getMarkdown()}\n\n${link}\n`, false));
  danhDauSua();
  baoChung("Đã chèn video. Trên web, link này sẽ thành khung video có nút ▶.");
}

// ---------- Xem trước: mở trang mới dùng chính giao diện của web ----------
function xemTruoc() {
  const fm = bai.fm;
  const anhBia = fm.anh_bia?.startsWith("vkt-anh:") ? urlAnh(fm.anh_bia.slice(8)) : fm.anh_bia;
  ghiLS("vkt.xem-truoc", { loai: bai.loai, fm, anhBia, html: editor.getHTML(), tenBo: bai.boTruyenMoi?.ten || dsBoTruyen[fm.bo_truyen]?.ten || "", dsChuDe, dsDoTuoi });
  window.open("xem-truoc.html", "vkt-xem-truoc");
}

// ================= Kiểm tra trước khi đăng =================
const soChu = (s) => String(s || "").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/[#*_>`[\]()|-]/g, " ").split(/\s+/).filter(Boolean).length;

// Chuẩn hóa từng ký tự (chữ thường, bỏ dấu, đ→d) và nhớ vị trí gốc, để tô đúng chỗ trong văn bản gốc
function chuanHoaCoViTri(s) {
  let chu = "";
  const viTri = [];
  for (let i = 0; i < s.length; i++) {
    let x = s[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    if (x === "đ") x = "d";
    for (const c of x) {
      chu += c;
      viTri.push(i);
    }
  }
  return { chu, viTri };
}
const chuanHoa = (s) => chuanHoaCoViTri(String(s || "")).chu;

function cacTruongCanDo(fm, md) {
  const ds = [
    ["Tiêu đề", fm.title],
    ["Mô tả ngắn", fm.mo_ta],
    ["Mô tả ảnh bìa", fm.anh_bia_mo_ta],
    ["Nội dung bài", md.replace(/\]\([^)]*\)/g, "]")],
    ["Tên kỳ", fm.ten_ky],
    ["Tóm tắt kỳ", fm.tom_tat_ky],
    ["Lời ngỏ", fm.loi_ngo],
    ["Mục tiêu", fm.muc_tieu],
    ["Nơi làm", fm.noi_lam],
    ["Giai đoạn", fm.giai_doan],
    ["Tóm tắt nhanh", (fm.tom_tat || []).join(" · ")],
    ["Nguồn tham khảo", (fm.nguon || []).map((n) => n?.ten).join(" · ")],
    ["Vật liệu", (fm.vat_lieu || []).join(" · ")],
    ["Câu hỏi cuối buổi", (fm.cau_hoi_cuoi || []).join(" · ")],
    ["Câu hỏi trò chuyện", Object.values(fm.cau_hoi || {}).flat().join(" · ")],
    ["Tên bộ truyện mới", bai.boTruyenMoi?.ten],
    ["Giới thiệu bộ truyện mới", bai.boTruyenMoi?.mo_ta],
  ];
  return ds.filter(([, v]) => v && String(v).trim());
}

function doNhayCam(fm, md) {
  const tuKhoa = (docLS(KHOA_TU_NHAY_CAM, []) || []).map((t) => ({ goc: t, chuan: chuanHoa(t).trim() })).filter((t) => t.chuan.length >= 2);
  const ketQua = [];
  const them = (truong, van, dau, cuoi, lyDo) => {
    const doan = `${dau > 30 ? "…" : ""}${thoatHtml(van.slice(Math.max(0, dau - 30), dau))}<mark>${thoatHtml(van.slice(dau, cuoi))}</mark>${thoatHtml(van.slice(cuoi, cuoi + 30))}${cuoi + 30 < van.length ? "…" : ""}`;
    const khoa = `${truong}|${chuanHoa(van.slice(dau, cuoi))}`;
    const cu = ketQua.find((k) => k.khoa === khoa);
    if (cu) cu.soLan++;
    else ketQua.push({ khoa, truong, doan, lyDo, soLan: 1 });
  };
  const laChu = (c) => /[a-z0-9]/.test(c || "");
  for (const [truong, giaTri] of cacTruongCanDo(fm, md)) {
    const van = String(giaTri);
    const { chu, viTri } = chuanHoaCoViTri(van);
    const goc = (i) => viTri[i] ?? van.length;
    // 1. Từ trong danh sách nhạy cảm (khớp nguyên từ, không phân biệt hoa thường, có dấu hay không dấu)
    for (const t of tuKhoa) {
      let i = chu.indexOf(t.chuan);
      while (i >= 0) {
        const j = i + t.chuan.length;
        if (!laChu(chu[i - 1]) && !laChu(chu[j])) them(truong, van, goc(i), goc(j - 1) + 1, `Trùng với từ nhạy cảm "${t.goc}"`);
        i = chu.indexOf(t.chuan, i + 1);
      }
    }
    // 2. Các mẫu dễ lộ thông tin
    for (const m of van.matchAll(/(?<!\d)(?:\+84|0)(?:[\s.-]?\d){9,10}(?!\d)/g)) them(truong, van, m.index, m.index + m[0].length, "Giống số điện thoại");
    for (const m of van.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
      if (m[0].toLowerCase() !== "vuonkhaitam@gmail.com") them(truong, van, m.index, m.index + m[0].length, "Địa chỉ email");
    }
    for (const m of chu.matchAll(/\blop\s*\d{1,2}\s*(?:\/\s*\d{1,2}|[a-z]\d{0,2})\b/g)) them(truong, van, goc(m.index), goc(m.index + m[0].length - 1) + 1, "Giống tên lớp cụ thể");
    for (const m of van.matchAll(/[Tt]rường\s+(?:(?:THCS|THPT|Tiểu học|Mầm non)\s+)?\p{Lu}[\p{L}]*/gu)) them(truong, van, m.index, m.index + m[0].length, "Giống tên trường");
  }
  return ketQua;
}

const CHECKLIST_NHAT_KY = [
  "Không có tên thật hay tên ở nhà của con",
  "Không có trường, lớp, thầy cô, nơi ở",
  "Không có ảnh thấy mặt con",
  "Đã đổi những chi tiết không quan trọng",
  'Đã để "nguội" ít nhất 2 tuần',
  "Con đã nghe bài này và đồng ý cho đăng",
];

function kiemTra() {
  const fm = bai.fm;
  const md = (bai.noiDung = raKhungSoan(htmlSangMd(editor.getHTML())));
  const chan = [];
  const canh = [];
  const coBo = bai.loai === "truyen" && (fm.bo_truyen || bai.boTruyenMoi);

  if (!fm.title?.trim()) chan.push("Chưa có tiêu đề.");
  else if (fm.title.length > 60) canh.push(`Tiêu đề dài ${fm.title.length} ký tự. Google thường chỉ hiện khoảng 60 ký tự đầu.`);
  if (bai.boTruyenMoi) {
    if (!bai.boTruyenMoi.ten.trim()) chan.push("Bộ truyện mới chưa có tên.");
    if (!duongDanHopLe(bai.boTruyenMoi.ma)) chan.push("Mã bộ truyện mới chưa hợp lệ (chữ thường không dấu, số, gạch nối).");
    else if (dsBoTruyen[bai.boTruyenMoi.ma]) chan.push("Mã bộ truyện này đã có. Hãy chọn bộ truyện đó trong danh sách, hoặc đổi mã khác.");
    if (!bai.boTruyenMoi.mo_ta.trim()) canh.push("Bộ truyện mới chưa có lời giới thiệu (hiện ở trang mục lục).");
  }
  if (coBo) {
    if (!(Number.isInteger(Number(fm.ky)) && Number(fm.ky) >= 1)) chan.push("Kỳ số phải là số nguyên từ 1 trở lên.");
    if (!fm.ten_ky?.trim()) chan.push("Chưa có tên kỳ.");
  }
  if (!duongDanHopLe(fm.duong_dan)) chan.push("Đường dẫn chưa hợp lệ: chỉ dùng chữ thường không dấu, số và dấu gạch nối, tối đa 60 ký tự.");
  if (bai.boTruyenMoi) fm.bo_truyen = bai.boTruyenMoi.ma;
  const p = duongDanTep(bai);
  if (!bai.laSua && cayKho.has(p)) chan.push(coBo ? `Bộ truyện này đã có Kỳ ${fm.ky}. Hãy đổi số kỳ.` : "Đã có bài khác dùng đường dẫn này. Hãy đổi đường dẫn.");
  if (!fm.mo_ta?.trim()) chan.push("Chưa có mô tả ngắn.");
  else if (fm.mo_ta.length < 120 || fm.mo_ta.length > 160) canh.push(`Mô tả ngắn dài ${fm.mo_ta.length} ký tự, nên trong khoảng 120–160.`);
  if (!fm.anh_bia) canh.push("Chưa có ảnh bìa: web sẽ dùng ảnh tạm theo loại bài. Nên thêm ảnh bìa để khi chia sẻ Zalo, Facebook trông đẹp hơn.");
  else if (!fm.anh_bia_mo_ta?.trim()) chan.push("Ảnh bìa chưa có mô tả.");
  if (!fm.do_tuoi?.length) chan.push("Chưa chọn độ tuổi.");
  if (!fm.chu_de?.length) chan.push("Chưa chọn chủ đề.");
  if (!md.trim()) chan.push("Bài chưa có nội dung.");
  const anhThieuMoTa = [...md.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)].filter((m) => !m[1].trim()).length;
  const anhHong = [...md.matchAll(/![[^]]*](([^)s]*))/g)].filter((m) => !m[1] || m[1].startsWith("blob:")).length;
  if (anhHong) chan.push(`Có ${anhHong} ảnh bị hỏng (mất file ảnh). Xóa ảnh đó khỏi bài rồi chèn lại bằng nút Ảnh.`);
  if (anhThieuMoTa) chan.push(`Có ${anhThieuMoTa} ảnh trong bài chưa có mô tả. Bấm vào ảnh, xóa đi rồi chèn lại bằng nút Ảnh.`);
  if (fm.video && !layIdYoutube(fm.video)) chan.push("Link video ở đầu bài không phải link YouTube.");

  if (bai.loai === "goc-cha-me") {
    if ((fm.tom_tat || []).filter((s) => s?.trim()).length !== 3) chan.push("Tóm tắt nhanh cần đủ 3 ý.");
    if (soChu(md) < 500) canh.push(`Bài mới có khoảng ${soChu(md)} chữ. Bài Góc cha mẹ nên từ 500 chữ trở lên.`);
  }
  if (!coBo) {
    const lienKet = (md.match(/\]\((?:\/|https:\/\/vuonkhaitam\.com)/g) || []).length + (fm.lien_quan || []).filter((x) => x?.trim()).length + (fm.hoat_dong_tiep_noi ? 1 : 0) + (fm.truyen_lien_quan ? 1 : 0);
    if (lienKet < 2) canh.push("Bài có ít hơn 2 liên kết tới bài khác trên Vườn Khai Tâm. Thêm vài đường dẫn ở mục Bài liên quan để người đọc đi tiếp.");
  }
  const doanDai = md.split(/\n{2,}/).filter((d) => !/^(#|>|-|\d+\.|!\[|<|```)/.test(d.trim()) && soChu(d) > 90);
  if (doanDai.length) canh.push(`Có ${doanDai.length} đoạn dài hơn 90 chữ, nên tách cho dễ đọc trên điện thoại. Đoạn đầu tiên bắt đầu bằng: "${doanDai[0].split(/\s+/).slice(0, 8).join(" ")}…"`);
  if (bai.loai === "nhat-ky") {
    const ngay = Math.floor((Date.now() - bai.tao) / 86400000);
    if (ngay < 14) canh.push(`Bản nháp này mới tạo ${ngay} ngày. Nên để "nguội" ít nhất 14 ngày rồi đọc lại trước khi đăng.`);
  }
  return { chan, canh, nhayCam: doNhayCam(fm, md) };
}

function veKiemTra() {
  luuNhap();
  const { chan, canh, nhayCam } = kiemTra();
  const vung = $("[data-ket-qua-kiem-tra]");
  const nutDang = $("[data-dang]");
  const hopDanhDau = [];
  const capNhatNut = () => (nutDang.disabled = chan.length > 0 || hopDanhDau.some((o) => !o.checked));
  const nhom = (tieuDe, ...con) => el("div", { class: "nhom-kiem" }, el("h2", { text: tieuDe }), ...con);
  const phan = [];
  if (chan.length) phan.push(nhom("Cần sửa trước khi đăng", chan.map((c) => el("p", { class: "dong-kiem chan", text: c }))));
  if (nhayCam.length) {
    phan.push(
      nhom(
        "Thông tin riêng tư cần xem lại",
        el("p", { class: "goi-y", text: "Quay lại sửa bài, hoặc đánh dấu nếu chỗ đó không phải thông tin của con." }),
        nhayCam.map((k) => {
          const o = el("input", { type: "checkbox" });
          o.addEventListener("change", capNhatNut);
          hopDanhDau.push(o);
          const doan = el("p", {});
          doan.innerHTML = `<b>${thoatHtml(k.truong)}</b> · ${thoatHtml(k.lyDo)}${k.soLan > 1 ? ` (${k.soLan} chỗ)` : ""}<br>${k.doan}`;
          return el("div", { class: "cho-nhay-cam" }, doan, el("label", { class: "o-chon" }, o, el("span", { text: "Tôi đã xem, chỗ này không phải thông tin của con" })));
        }),
      ),
    );
  }
  if (bai.loai === "nhat-ky") {
    phan.push(
      nhom(
        "Nhật ký: 6 điều phải chắc chắn",
        CHECKLIST_NHAT_KY.map((c) => {
          const o = el("input", { type: "checkbox" });
          o.addEventListener("change", capNhatNut);
          hopDanhDau.push(o);
          return el("label", { class: "o-chon" }, o, el("span", { text: c }));
        }),
      ),
    );
  }
  if (canh.length) phan.push(nhom("Nên xem lại (vẫn đăng được)", canh.map((c) => el("p", { class: "dong-kiem canh", text: c }))));
  if (!chan.length && !nhayCam.length && !canh.length) phan.push(el("p", { class: "dong-kiem dat", text: "Bài đã đủ thông tin, không thấy chỗ nào cần sửa." }));
  phan.push(el("p", { class: "goi-y", text: `Bài sẽ có địa chỉ: ${SITE}${urlBai(bai)}` }));
  vung.replaceChildren(...phan);
  nutDang.textContent = bai.laSua ? "Lưu thay đổi lên web" : "Đăng bài";
  capNhatNut();
  hien("kiem-tra");
}

// ================= Đăng bài =================
function lamSachFm(fm, coBo) {
  const sach = structuredClone(fm);
  for (const [k, v] of Object.entries(sach)) {
    if (typeof v === "string") sach[k] = v.trim();
    else if (Array.isArray(v)) sach[k] = v.map((x) => (typeof x === "string" ? x.trim() : x)).filter((x) => (typeof x === "string" ? x : x?.ten?.trim()));
  }
  if (sach.cau_hoi) for (const k of Object.keys(sach.cau_hoi)) sach.cau_hoi[k] = (sach.cau_hoi[k] || []).map((x) => x.trim()).filter(Boolean);
  if (sach.nguon) sach.nguon = sach.nguon.map((n) => ({ ten: n.ten.trim(), link: (n.link || "").trim() }));
  if (coBo) sach.ky = Number(sach.ky);
  else for (const k of ["bo_truyen", "ky", "ten_ky", "tom_tat_ky"]) delete sach[k];
  if (sach.thoi_gian_phut !== undefined && sach.thoi_gian_phut !== "") sach.thoi_gian_phut = Number(sach.thoi_gian_phut);
  if (sach.ket_qua === "") delete sach.ket_qua;
  return sach;
}

async function dangBai() {
  await luuNhap();
  const buoc = $("[data-tien-trinh]");
  const sauDang = $("[data-sau-dang]");
  buoc.replaceChildren();
  sauDang.replaceChildren();
  $("[data-tieu-de-dang]").textContent = bai.laSua ? "Đang lưu thay đổi…" : "Đang đăng bài…";
  hien("dang");
  const themBuoc = (chu) => {
    const li = el("li", { text: chu });
    buoc.append(li);
    return li;
  };

  const coBo = bai.loai === "truyen" && (bai.fm.bo_truyen || bai.boTruyenMoi);
  const fm = lamSachFm(bai.fm, coBo);
  if (bai.boTruyenMoi) fm.bo_truyen = bai.boTruyenMoi.ma;
  if (bai.laSua) fm.cap_nhat = homNay();

  const b1 = themBuoc("Chuẩn bị ảnh và nội dung…");
  const tep = [];
  let mdCuoi = "";
  try {
    const nay = new Date();
    const thuMuc = `anh/${nay.getFullYear()}/${String(nay.getMonth() + 1).padStart(2, "0")}`;
    const daDat = new Set();
    let stt = 1;
    const datTenAnh = (id) => {
      for (;;) {
        const p = `${thuMuc}/${fm.duong_dan}-${stt++}.${bai.anh[id].duoi}`;
        if (!cayKho.has(p) && !daDat.has(p)) {
          daDat.add(p);
          return p;
        }
      }
    };
    const duongAnh = new Map();
    const layDuongAnh = async (id) => {
      if (!bai.anh[id]) throw new Error("Thiếu một ảnh trong bản nháp. Hãy xóa ảnh đó khỏi bài rồi chèn lại.");
      if (!duongAnh.has(id)) {
        const p = datTenAnh(id);
        tep.push({ path: p, base64: await b64TuBlob(bai.anh[id].blob) });
        duongAnh.set(id, `/${p}`);
      }
      return duongAnh.get(id);
    };
    let md = bai.noiDung;
    for (const id of new Set([...md.matchAll(/vkt-anh:([a-z0-9]+)/g)].map((m) => m[1]))) md = md.split(`vkt-anh:${id}`).join(await layDuongAnh(id));
    if (fm.anh_bia?.startsWith("vkt-anh:")) fm.anh_bia = await layDuongAnh(fm.anh_bia.slice(8));

    mdCuoi = md;
    tep.push({ path: duongDanTep({ loai: bai.loai, fm }), base64: b64TuChu(ghepBai(frontMatterTheoThuTu(bai.loai, fm), md)) });

    if (bai.boTruyenMoi || bai.boTruyenHoanThanh) {
      const ds = JSON.parse(await docTep("_data/bo-truyen.json"));
      if (bai.boTruyenMoi) {
        ds[bai.boTruyenMoi.ma] = { ten: bai.boTruyenMoi.ten.trim(), mo_ta: bai.boTruyenMoi.mo_ta.trim(), do_tuoi: fm.do_tuoi, chu_de: fm.chu_de, anh_bia: "", trang_thai: "dang-dang" };
      }
      if (bai.boTruyenHoanThanh && ds[fm.bo_truyen]) ds[fm.bo_truyen].trang_thai = "hoan-thanh";
      tep.push({ path: "_data/bo-truyen.json", base64: b64TuChu(JSON.stringify(ds, null, 2) + "\n") });
      dsBoTruyen = ds;
    }
    b1.className = "xong";
    b1.textContent = `Đã chuẩn bị ${tep.length} file.`;
  } catch (e) {
    b1.className = "loi";
    b1.textContent = e.message;
    sauDang.replaceChildren(el("button", { type: "button", class: "nut", text: "Quay lại bài", onclick: () => hien("soan") }));
    return;
  }

  const b2 = themBuoc("Đang gửi lên GitHub…");
  let sha;
  try {
    sha = await guiCommit(tep, `${bai.laSua ? "Sửa" : "Đăng"}: ${fm.title}`, (chu) => (b2.textContent = chu));
    b2.className = "xong";
    b2.textContent = "Đã cất bài vào kho trên GitHub.";
  } catch (e) {
    b2.className = "loi";
    b2.textContent = loiDeHieu(e);
    sauDang.replaceChildren(
      el("p", { class: "goi-y", text: "Bản nháp vẫn còn nguyên trên máy này." }),
      el("button", { type: "button", class: "nut", text: "Thử đăng lại", onclick: dangBai }),
      el("button", { type: "button", class: "nut nut-vien", text: "Quay lại bài", onclick: () => hien("soan") }),
    );
    return;
  }

  // Đăng xong: bản nháp từ giờ là bản sửa của bài đã đăng
  bai.fm = fm;
  bai.noiDung = mdCuoi;
  bai.laSua = true;
  bai.duongDanTep = duongDanTep(bai);
  bai.boTruyenMoi = null;
  bai.boTruyenHoanThanh = false;
  bai.anh = {};
  await ghiNhapDb(bai).catch(() => {});

  const url = `${SITE}${urlBai(bai)}`;
  const b3 = themBuoc("Đang dựng lại web (thường mất 1–2 phút)…");
  const lan = await choDungWeb(sha);
  let ketLuan;
  if (lan?.khongXemDuoc) {
    b3.textContent = "Token không có quyền xem tiến độ dựng web. Bài sẽ lên web sau khoảng 1–2 phút.";
    ketLuan = "Đã gửi bài";
  } else if (!lan) {
    b3.textContent = "Web vẫn đang dựng lâu hơn thường lệ. Mở lại bài sau vài phút.";
    ketLuan = "Đã gửi bài, web đang dựng";
  } else if (lan.conclusion === "success") {
    b3.className = "xong";
    b3.textContent = "Web đã dựng xong.";
    ketLuan = "Xong! Bài đã lên web";
  } else {
    b3.className = "loi";
    b3.textContent = "Bước dựng web bị lỗi. Bài đã nằm trong kho nhưng chưa hiện trên web.";
    ketLuan = "Có lỗi khi dựng web";
    sauDang.append(
      el("p", { class: "goi-y", text: "Thường do kiểm tra riêng tư phát hiện vấn đề (ví dụ ảnh còn thông tin vị trí). Bấm link dưới để xem lý do, hoặc nhờ Claude Code xem giúp." }),
      el("a", { class: "nut nut-vien", href: lan.html_url, target: "_blank", rel: "noopener", text: "Xem lỗi trên GitHub" }),
    );
  }
  $("[data-tieu-de-dang]").textContent = ketLuan;
  sauDang.prepend(
    el("p", {}, el("a", { class: "nut", href: url, target: "_blank", rel: "noopener", text: "Xem bài trên web" })),
    el("p", { class: "goi-y", text: "Nếu mở ra vẫn thấy bản cũ, chờ thêm một chút rồi tải lại trang (máy tính: Ctrl + F5)." }),
  );
  sauDang.append(
    el(
      "div",
      { class: "the" },
      el("p", { text: "Xóa bản nháp của bài này trên máy? (Bài đã nằm an toàn trên GitHub, muốn sửa thì vào Bài đã đăng › Sửa.)" }),
      el(
        "div",
        { class: "hang" },
        el("button", {
          type: "button",
          class: "nut",
          text: "Xóa bản nháp",
          onclick: async () => {
            await xoaNhapDb(bai.id);
            bai = null;
            await veBang();
            hien("bang");
          },
        }),
        el("button", {
          type: "button",
          class: "nut nut-vien",
          text: "Giữ lại",
          onclick: async () => {
            bai = null;
            await veBang();
            hien("bang");
          },
        }),
      ),
    ),
  );
}

// ================= Cài đặt =================
async function doiPin() {
  const p1 = $("#o-pin-moi-1").value;
  const p2 = $("#o-pin-moi-2").value;
  if (!/^\d{6,}$/.test(p1)) return baoChung("PIN mới phải gồm ít nhất 6 chữ số.", true);
  if (p1 !== p2) return baoChung("Hai lần nhập PIN mới chưa giống nhau.", true);
  await maHoaToken(token, p1);
  $("#o-pin-moi-1").value = $("#o-pin-moi-2").value = "";
  baoChung("Đã đổi PIN.");
}

async function xuatNhap() {
  const tatCa = await tatCaNhapDb();
  if (!tatCa.length) return baoChung("Chưa có bản nháp nào để xuất.");
  const goi = [];
  for (const n of tatCa) {
    const anh = {};
    for (const [id, a] of Object.entries(n.anh || {})) anh[id] = { ...a, blob: undefined, base64: await b64TuBlob(a.blob), kieu: a.blob.type };
    goi.push({ ...n, anh });
  }
  const tep = new Blob([JSON.stringify({ ung_dung: "vuon-khai-tam-dang-bai", phien_ban: 1, nhap: goi })], { type: "application/json" });
  const a = el("a", { href: URL.createObjectURL(tep), download: `vkt-ban-nhap-${homNay()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  baoChung(`Đã xuất ${goi.length} bản nháp.`);
}

async function nhapNhap(tep) {
  try {
    const goi = JSON.parse(await tep.text());
    if (goi.ung_dung !== "vuon-khai-tam-dang-bai") throw new Error();
    let so = 0;
    for (const n of goi.nhap) {
      const cu = await docNhapDb(n.id);
      if (cu && cu.sua >= n.sua) continue;
      for (const a of Object.values(n.anh || {})) {
        a.blob = new Blob([bytesTuB64(a.base64)], { type: a.kieu });
        delete a.base64;
        delete a.kieu;
      }
      await ghiNhapDb(n);
      so++;
    }
    baoChung(`Đã nhập ${so} bản nháp.`);
  } catch {
    baoChung("File này không phải file bản nháp của trang Đăng bài.", true);
  }
}

// ================= Khởi động =================
function batDau() {
  if (!window.jsyaml || !window.toastui) {
    baoChung("Không tải được thư viện của trang. Tải lại trang (Ctrl + F5).", true);
    return;
  }
  $("#o-tu-nhay-cam").value = (docLS(KHOA_TU_NHAY_CAM, []) || []).join("\n");

  // Thiết lập
  $("[data-thu-ket-noi]").addEventListener("click", thuKetNoi);
  $("[data-luu-thiet-lap]").addEventListener("click", luuThietLap);

  // Mở khóa
  const oPin = $("#o-pin");
  oPin.addEventListener("input", () => {
    oPin.value = oPin.value.replace(/\D/g, "").slice(0, 12);
    veChamPin();
  });
  oPin.addEventListener("keydown", (e) => e.key === "Enter" && moKhoa());
  for (const n of $$(".ban-phim button")) {
    n.addEventListener("click", () => {
      const so = n.dataset.so;
      if (so === "mo") return moKhoa();
      oPin.value = so === "xoa" ? oPin.value.slice(0, -1) : (oPin.value + so).slice(0, 12);
      veChamPin();
    });
  }
  $("[data-quen-pin]").addEventListener("click", async () => {
    const dongY = await hoiThoai({ tieuDe: "Thiết lập lại?", than: "Token đã lưu trên máy này sẽ bị xóa. Bạn cần dán lại token (hoặc tạo token mới) và đặt PIN mới. Bản nháp vẫn giữ nguyên.", chuDongY: "Thiết lập lại", nutDo: true });
    if (!dongY) return;
    xoaLS(KHOA_TOKEN);
    xoaLS(KHOA_SAI_PIN);
    hien("thiet-lap");
  });

  // Thanh trên
  $("[data-khoa-ngay]").addEventListener("click", () => khoaTrang("Đã khóa."));
  $('[data-di="cai-dat"]').addEventListener("click", async () => {
    if (bai && daSuaChuaLuu) await luuNhap();
    $("#o-tu-nhay-cam-2").value = (docLS(KHOA_TU_NHAY_CAM, []) || []).join("\n");
    $("[data-han-token]").textContent = ngayHetHanToken
      ? `Token hết hạn vào ${ngayHetHanToken.toLocaleDateString("vi-VN")}.`
      : "Chưa đọc được ngày hết hạn của token.";
    hien("cai-dat");
  });
  for (const n of $$("[data-ve-bang]")) {
    n.addEventListener("click", async () => {
      if (bai && daSuaChuaLuu) await luuNhap();
      bai = null;
      await veBang();
      hien("bang");
    });
  }

  // Bảng điều khiển
  for (const n of $$("[data-viet]")) n.addEventListener("click", () => vietBaiMoi(n.dataset.viet));
  $("[data-tai-bai]").addEventListener("click", taiDsBai);
  $("[data-tim-bai]").addEventListener("input", veDsBai);

  // Trình soạn, kiểm tra, đăng
  $("[data-chen-anh]").addEventListener("click", () => chonAnh("noi-dung"));
  $("[data-chen-video]").addEventListener("click", chenVideo);
  $("[data-xem-truoc]").addEventListener("click", xemTruoc);
  $("[data-kiem-tra]").addEventListener("click", veKiemTra);
  $("[data-ve-soan]").addEventListener("click", () => hien("soan"));
  $("[data-dang]").addEventListener("click", dangBai);

  // Cài đặt
  $("[data-doi-pin]").addEventListener("click", doiPin);
  $("[data-luu-tu]").addEventListener("click", () => {
    ghiLS(KHOA_TU_NHAY_CAM, tachTuNhayCam($("#o-tu-nhay-cam-2").value));
    baoChung("Đã lưu danh sách từ nhạy cảm.");
  });
  $("[data-xuat-nhap]").addEventListener("click", xuatNhap);
  $("[data-nhap-nhap]").addEventListener("change", (e) => e.target.files[0] && nhapNhap(e.target.files[0]));
  $("[data-thay-token]").addEventListener("click", () => {
    $("#o-tu-nhay-cam").value = (docLS(KHOA_TU_NHAY_CAM, []) || []).join("\n");
    hien("thiet-lap");
    baoChung("Dán token mới và đặt PIN. Token cũ vẫn dùng cho tới khi bấm Lưu.");
  });

  addEventListener("beforeunload", () => bai && daSuaChuaLuu && luuNhap());
  hien(docLS(KHOA_TOKEN) ? "mo-khoa" : "thiet-lap");
}

batDau();
