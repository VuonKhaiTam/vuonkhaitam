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
