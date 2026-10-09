// Vườn Khai Tâm · tim-kiem.js
// Tìm ngay khi gõ, gõ có dấu hay không dấu đều được: "con hay cau gian" vẫn ra "Con hay cáu giận".
// Chỉ tải chỉ mục (/tim-kiem/chi-muc.json) khi người đọc chạm vào ô tìm, để trang mở nhanh.
(() => {
  "use strict";
  const form = document.querySelector(".o-tim[data-o-tim]");
  const o = document.getElementById("o-tim-chinh");
  const vung = document.querySelector(".ket-qua-tim");
  if (!form || !o || !vung) return;

  const TEN_LOAI = {
    "goc-cha-me": "Góc cha mẹ",
    truyen: "Truyện",
    "bo-truyen": "Truyện nhiều kỳ",
    "hoc-cung-con": "Học cùng con",
    "nhat-ky": "Nhật ký vườn ươm",
  };
  const DIEM = { t: 5, c: 3, d: 2, x: 1 }; // khớp tiêu đề 5, chủ đề 3, mô tả 2, nội dung 1
  const TOI_DA = 20;

  // Chữ thường, bỏ dấu, đ → d
  const chuanHoa = (s) =>
    String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

  let chiMuc = null;
  let dangTai = null;
  const taiChiMuc = () =>
    (dangTai ||= fetch("/tim-kiem/chi-muc.json")
      .then((r) => r.json())
      .then((ds) => {
        chiMuc = ds.map((b) => ({ ...b, _t: chuanHoa(b.t), _c: chuanHoa(b.c.join(" ")), _d: chuanHoa(b.d), _x: chuanHoa(b.x) }));
      })
      .catch(() => {
        dangTai = null;
        vung.textContent = "Chưa tải được dữ liệu tìm kiếm. Anh chị kiểm tra mạng rồi thử lại.";
      }));

  const thoat = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Tô đậm các chỗ khớp trong chữ gốc (có dấu), dựa trên vị trí trong bản đã bỏ dấu
  function toDam(goc, tu) {
    let chuan = "";
    const viTri = [];
    for (let i = 0; i < goc.length; i++) {
      for (const c of chuanHoa(goc[i])) {
        chuan += c;
        viTri.push(i);
      }
    }
    const danh = new Array(goc.length).fill(false);
    for (const t of tu) {
      let i = chuan.indexOf(t);
      while (i >= 0) {
        for (let k = viTri[i]; k <= viTri[i + t.length - 1]; k++) danh[k] = true;
        i = chuan.indexOf(t, i + t.length);
      }
    }
    let kq = "";
    let mo = false;
    for (let i = 0; i < goc.length; i++) {
      if (danh[i] && !mo) (kq += "<mark>"), (mo = true);
      if (!danh[i] && mo) (kq += "</mark>"), (mo = false);
      kq += thoat(goc[i]);
    }
    return mo ? kq + "</mark>" : kq;
  }

  function tim(cauTim) {
    const tu = chuanHoa(cauTim).split(/\s+/).filter(Boolean);
    if (!tu.length) return [];
    const ketQua = [];
    for (const b of chiMuc) {
      let diem = 0;
      let duTu = true;
      for (const t of tu) {
        let diemTu = 0;
        for (const [k, d] of Object.entries(DIEM)) if (b[`_${k}`].includes(t)) diemTu += d;
        if (!diemTu) {
          duTu = false;
          break;
        }
        diem += diemTu;
      }
      if (duTu) ketQua.push({ b, diem });
    }
    return ketQua.sort((a, b) => b.diem - a.diem).slice(0, TOI_DA).map((k) => k.b);
  }

  function ve() {
    const cauTim = o.value.trim();
    const thamSo = new URLSearchParams(location.search);
    cauTim ? thamSo.set("q", cauTim) : thamSo.delete("q");
    history.replaceState(null, "", location.pathname + (thamSo.toString() ? `?${thamSo}` : ""));
    if (!cauTim) {
      vung.innerHTML = "";
      return;
    }
    if (!chiMuc) {
      vung.textContent = "Đang tìm…";
      taiChiMuc().then(() => chiMuc && ve());
      return;
    }
    const tu = chuanHoa(cauTim).split(/\s+/).filter(Boolean);
    const ds = tim(cauTim);
    if (!ds.length) {
      vung.innerHTML = `<p class="tim-trong">Chưa tìm thấy bài nào cho “${thoat(cauTim)}”. Anh chị thử từ khác ngắn hơn, hoặc xem theo độ tuổi, chủ đề bên dưới.</p>`;
      return;
    }
    vung.innerHTML =
      `<p class="tim-so">Tìm thấy ${ds.length}${ds.length === TOI_DA ? "+" : ""} bài</p><ol class="ds-ket-qua">` +
      ds
        .map(
          (b) =>
            `<li><p class="kq-loai">${thoat(TEN_LOAI[b.l] || "")}</p><a class="kq-ten" href="${thoat(b.u)}">${toDam(b.t, tu)}</a>` +
            (b.d ? `<p class="kq-mo-ta">${toDam(b.d, tu)}</p>` : "") +
            `</li>`,
        )
        .join("") +
      `</ol>`;
  }

  let hen;
  o.addEventListener("focus", taiChiMuc, { once: true });
  o.addEventListener("input", () => {
    clearTimeout(hen);
    hen = setTimeout(ve, 150);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ve();
  });

  // Mở trang với ?q=… (từ ô tìm ở trang 404 hoặc link chia sẻ): tìm ngay
  const q = new URLSearchParams(location.search).get("q");
  if (q) {
    o.value = q;
    ve();
  }
})();
