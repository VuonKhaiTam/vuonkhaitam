// Vườn Khai Tâm · chinh.js
// JavaScript thuần, không thư viện. Không có JavaScript thì web vẫn đọc được bình thường.
(() => {
  "use strict";
  const $ = (chon, goc = document) => goc.querySelector(chon);
  const $$ = (chon, goc = document) => [...goc.querySelectorAll(chon)];

  // ---------- Menu ☰ ----------
  const nutMenu = $(".nut-menu");
  const menu = $("#menu-day-du");
  if (nutMenu && menu) {
    nutMenu.hidden = false;
    const datMenu = (mo) => {
      menu.hidden = !mo;
      nutMenu.setAttribute("aria-expanded", String(mo));
      $(".an-chu", nutMenu).textContent = mo ? "Đóng menu" : "Mở menu";
    };
    nutMenu.addEventListener("click", () => datMenu(menu.hidden));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) {
        datMenu(false);
        nutMenu.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!menu.hidden && !menu.contains(e.target) && !nutMenu.contains(e.target)) datMenu(false);
    });
  }

  // ---------- Chia sẻ ----------
  for (const khoi of $$(".chia-se")) {
    const url = khoi.dataset.url;
    const tieuDe = khoi.dataset.tieuDe;
    const bao = $(".chia-se-bao", khoi);
    const nutChiaSe = $(".nut-chia-se", khoi);
    const nutSaoChep = $(".nut-sao-chep", khoi);
    if (navigator.share) {
      // Điện thoại: mở bảng chia sẻ có sẵn Zalo, Facebook, Tin nhắn…
      nutChiaSe.hidden = false;
      $(".nut-facebook", khoi).hidden = true;
      nutChiaSe.addEventListener("click", () => navigator.share({ title: tieuDe, url }).catch(() => {}));
    } else if (navigator.clipboard) {
      nutSaoChep.hidden = false;
      nutSaoChep.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(url);
          bao.textContent = "Đã sao chép liên kết.";
        } catch {
          bao.textContent = "Chưa sao chép được. Anh chị chép địa chỉ trên thanh trình duyệt nhé.";
        }
      });
    }
  }

  // ---------- In / Lưu PDF ----------
  // Trước khi in: mở các hộp đang thu gọn (ví dụ Lời ngỏ) để không bị mất chữ trên giấy
  addEventListener("beforeprint", () => {
    for (const d of $$("details")) d.open = true;
  });
  for (const nut of $$(".nut-in")) {
    nut.hidden = false;
    nut.addEventListener("click", () => window.print());
  }

  // ---------- Video: chỉ tải khung YouTube khi người đọc bấm ▶ ----------
  for (const khoi of $$(".video[data-yt]")) {
    const link = $(".video-nut", khoi);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const khung = document.createElement("iframe");
      khung.src = `https://www.youtube-nocookie.com/embed/${khoi.dataset.yt}?autoplay=1&rel=0`;
      khung.title = "Video YouTube";
      khung.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      khung.allowFullscreen = true;
      khung.referrerPolicy = "strict-origin-when-cross-origin";
      link.replaceWith(khung);
      khung.focus();
    });
  }

  // ---------- Lọc bài theo tuổi / chủ đề / loại bài ----------
  // Lựa chọn được giữ trên đường dẫn (?tuoi=9-11&chu-de=cam-xuc) để gửi link cho người khác.
  // Không có JavaScript thì hàng nút lọc bị ẩn và mọi bài vẫn hiện đủ.
  const boLoc = $("[data-bo-loc]");
  const luoiLoc = $("[data-luoi-loc]");
  if (boLoc && luoiLoc) {
    const thuocTinh = { tuoi: "tuoi", "chu-de": "chuDe", loai: "loai" };
    const cacThe = $$(".the-bai", luoiLoc);
    const baoKetQua = $(".ket-qua-loc", boLoc);
    const thamSo = new URLSearchParams(location.search);
    const cacNhom = $$(".hang-loc", boLoc);

    const chonTrongNhom = (nhom, giaTri) => {
      for (const n of $$(".nut-loc", nhom)) n.setAttribute("aria-pressed", String(n.dataset.giaTri === giaTri));
    };
    const giaTriNhom = (nhom) => $('.nut-loc[aria-pressed="true"]', nhom)?.dataset.giaTri || "";

    const apDung = () => {
      const dieuKien = cacNhom.map((nhom) => [thuocTinh[nhom.dataset.nhom], giaTriNhom(nhom)]).filter(([, gt]) => gt);
      let soHien = 0;
      for (const the of cacThe) {
        const hien = dieuKien.every(([k, gt]) => (the.dataset[k] || "").split(" ").includes(gt));
        the.hidden = !hien;
        if (hien) soHien++;
      }
      baoKetQua.textContent = dieuKien.length
        ? soHien
          ? `Có ${soHien} bài phù hợp.`
          : "Chưa có bài phù hợp. Anh chị thử bỏ bớt một bộ lọc nhé."
        : "";
      const moi = new URLSearchParams(location.search);
      for (const nhom of cacNhom) {
        const gt = giaTriNhom(nhom);
        gt ? moi.set(nhom.dataset.nhom, gt) : moi.delete(nhom.dataset.nhom);
      }
      const chuoi = moi.toString();
      history.replaceState(null, "", location.pathname + (chuoi ? `?${chuoi}` : "") + location.hash);
    };

    for (const nhom of cacNhom) {
      const tuLink = thamSo.get(nhom.dataset.nhom);
      if (tuLink && $(`.nut-loc[data-gia-tri="${CSS.escape(tuLink)}"]`, nhom)) chonTrongNhom(nhom, tuLink);
      nhom.addEventListener("click", (e) => {
        const nut = e.target.closest(".nut-loc");
        if (!nut) return;
        chonTrongNhom(nhom, nut.dataset.giaTri);
        apDung();
      });
    }
    boLoc.hidden = false;
    apDung();
  }

  // ---------- Truyện nhiều kỳ: nhớ kỳ đã đọc, kỳ đang đọc dở ----------
  // Chỉ lưu trên trình duyệt của người đọc (localStorage), không gửi đi đâu, không phải cookie.
  // Trình duyệt chặn lưu trữ (chế độ ẩn danh…) thì mọi thứ vẫn chạy, chỉ không nhớ được.
  const docKho = (khoa) => {
    try { return JSON.parse(localStorage.getItem(khoa)) || {}; } catch { return {}; }
  };
  const ghiKho = (khoa, giaTri) => {
    try { localStorage.setItem(khoa, JSON.stringify(giaTri)); } catch { /* bỏ qua */ }
  };
  const daDoc = docKho("vkt.da-doc"); // { "/truyen/x/ky-1/": 1700000000000 }
  const dangDoc = docKho("vkt.dang-doc"); // { "ma-bo-truyen": "/truyen/x/ky-2/" }

  const thanhTienDo = $(".tien-do-truyen");
  if (thanhTienDo) {
    dangDoc[thanhTienDo.dataset.boTruyen] = location.pathname;
    ghiKho("vkt.dang-doc", dangDoc);
    for (const o of $$("a[data-url]", thanhTienDo)) if (daDoc[o.dataset.url]) o.classList.add("da-doc");
    // Đọc tới cuối kỳ (thấy thẻ "Đọc tiếp") thì đánh dấu đã đọc
    const cuoiKy = $("[data-cuoi-ky]");
    if (cuoiKy && "IntersectionObserver" in window) {
      const theoDoi = new IntersectionObserver((ds) => {
        if (ds.some((d) => d.isIntersecting)) {
          daDoc[cuoiKy.dataset.cuoiKy] = Date.now();
          ghiKho("vkt.da-doc", daDoc);
          theoDoi.disconnect();
        }
      });
      theoDoi.observe(cuoiKy);
    }
  }

  const mucLuc = $("[data-muc-luc]");
  if (mucLuc) {
    const dsMuc = $$(".dong-ky-muc[data-url]", mucLuc);
    for (const muc of dsMuc) {
      if (!daDoc[muc.dataset.url]) continue;
      muc.classList.add("da-doc");
      $(".dong-ky-da-doc", muc).hidden = false;
    }
    // Nút "Đọc tiếp": kỳ đang đọc dở, hoặc kỳ ngay sau nếu kỳ đó đã đọc xong
    const nutDocTiep = $("[data-doc-tiep]", mucLuc);
    const urlDangDoc = dangDoc[mucLuc.dataset.mucLuc];
    let i = dsMuc.findIndex((m) => m.dataset.url === urlDangDoc);
    if (i >= 0 && daDoc[urlDangDoc]) i += 1;
    if (nutDocTiep && i > 0 && i < dsMuc.length) {
      nutDocTiep.href = dsMuc[i].dataset.url;
      nutDocTiep.textContent = `Đọc tiếp Kỳ ${$(".dong-ky-so", dsMuc[i]).textContent.trim()}`;
      nutDocTiep.hidden = false;
    }
  }

  // ---------- Ô tìm kiếm (trang 404): chuyển sang trang Tìm kiếm ----------
  for (const form of $$("form[data-o-tim]")) {
    if (location.pathname.startsWith("/tim-kiem/")) continue; // trang Tìm kiếm tự xử lý (Buổi 3)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("input", form).value.trim();
      location.href = "/tim-kiem/" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }
})();
