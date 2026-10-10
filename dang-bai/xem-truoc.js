// Xem trước bài đang soạn bằng chính giao diện của web (chinh.css).
// Dữ liệu do trang Đăng bài ghi vào localStorage của máy này, không gửi đi đâu.
"use strict";
(() => {
  let d;
  try {
    d = JSON.parse(localStorage.getItem("vkt.xem-truoc"));
  } catch {
    d = null;
  }
  const vung = document.querySelector("[data-xem-truoc]");
  if (!d || !vung) return;

  const LOAI = {
    "goc-cha-me": ["Góc cha mẹ", "chame"],
    truyen: ["Truyện", "truyen"],
    "hoc-cung-con": ["Học cùng con", "hoc"],
    "nhat-ky": ["Nhật ký vườn ươm", "nhatky"],
  };
  const fm = d.fm || {};
  const el = (the, lop, chu) => {
    const n = document.createElement(the);
    if (lop) n.className = lop;
    if (chu != null) n.textContent = chu;
    return n;
  };
  const khoangTuoi = (ds) => {
    const so = (ds || []).flatMap((m) => m.split("-").map(Number)).filter((x) => !Number.isNaN(x));
    return so.length ? `${Math.min(...so)}–${Math.max(...so)} tuổi` : "";
  };
  const tenChuDe = (ds) => (ds || []).map((ma) => (d.dsChuDe || []).find((c) => c.ma === ma)?.ten).filter(Boolean).join(", ");
  const [tenLoai, lopNhan] = LOAI[d.loai] || ["", ""];

  const phan = [];
  const nhan = el("p", "cac-nhan");
  nhan.append(el("span", `nhan nhan-${lopNhan}`, tenLoai));
  if (fm.do_tuoi?.length) nhan.append(el("span", "nhan-tuoi", khoangTuoi(fm.do_tuoi)));
  phan.push(nhan);
  phan.push(el("h1", "bai-tieu-de", fm.title || "(chưa có tiêu đề)"));
  phan.push(el("p", "dong-thong-tin", `Mộc Yên biên soạn · Chim Sâu cùng làm · ${fm.date || ""}`));
  if (d.loai === "truyen" && d.tenBo) {
    const thanh = el("div", "tien-do-truyen");
    const dau = el("p", "tdt-dau");
    dau.append(el("span", "tdt-bo", d.tenBo), el("span", "tdt-vi-tri", `Kỳ ${fm.ky || 1}`));
    thanh.append(dau);
    phan.push(thanh);
  }
  if (d.loai === "goc-cha-me" && fm.tom_tat?.some((s) => s.trim())) {
    const hop = el("aside", "hop hop-tom-tat");
    hop.append(el("h2", "tieu-de-hop", "Tóm tắt nhanh"));
    const ul = el("ul");
    for (const y of fm.tom_tat) if (y.trim()) ul.append(el("li", null, y));
    hop.append(ul);
    phan.push(hop);
  }
  if (d.loai === "hoc-cung-con") {
    const hop = el("aside", "hop hop-thong-tin");
    const dl = el("dl");
    for (const [k, v] of [
      ["Mục tiêu", fm.muc_tieu],
      ["Tuổi", khoangTuoi(fm.do_tuoi)],
      ["Thời gian", fm.thoi_gian_phut ? `${fm.thoi_gian_phut} phút` : ""],
      ["Vật liệu", (fm.vat_lieu || []).filter(Boolean).join(", ")],
      ["Nơi làm", fm.noi_lam],
    ]) {
      if (!v) continue;
      const dong = el("div");
      dong.append(el("dt", null, k), el("dd", null, v));
      dl.append(dong);
    }
    hop.append(dl);
    phan.push(hop);
  }
  if (d.loai === "truyen" && fm.loi_ngo) {
    const hop = el("aside", "hop hop-loi-ngo");
    hop.append(el("h2", "tieu-de-hop", "Lời ngỏ cho cha mẹ"), el("p", null, fm.loi_ngo));
    phan.push(hop);
  }
  if (d.anhBia) {
    const hinh = el("figure", "anh-bia");
    const anh = el("img");
    anh.src = d.anhBia;
    anh.alt = fm.anh_bia_mo_ta || "";
    hinh.append(anh);
    phan.push(hinh);
  }
  // Nội dung do chính tác giả soạn, đã được Toast UI lọc mã nguy hiểm (DOMPurify)
  const noiDung = el("div", `noi-dung${d.loai === "truyen" ? " noi-dung-truyen" : ""}`);
  noiDung.innerHTML = d.html || "";
  for (const n of noiDung.querySelectorAll("[contenteditable], .ProseMirror-separator, .ProseMirror-trailingBreak")) {
    if (n.classList.contains("ProseMirror-separator") || n.classList.contains("ProseMirror-trailingBreak")) n.remove();
    else n.removeAttribute("contenteditable");
  }
  phan.push(noiDung);

  const cauHoi = d.loai === "truyen" ? fm.cau_hoi : null;
  if (cauHoi && Object.values(cauHoi).flat().some((c) => c?.trim())) {
    const hop = el("section", "hop hop-cau-hoi");
    hop.append(el("h2", "tieu-de-hop", "Trò chuyện cùng con"));
    for (const [ma, ten] of [["nho_lai", "Nhớ lại"], ["cam_nhan", "Cảm nhận"], ["lien_he", "Liên hệ"]]) {
      const ds = (cauHoi[ma] || []).filter((c) => c?.trim());
      if (!ds.length) continue;
      hop.append(el("h3", "tang-cau-hoi", ten));
      const ul = el("ul");
      for (const c of ds) ul.append(el("li", null, c));
      hop.append(ul);
    }
    phan.push(hop);
  }
  if (d.loai === "hoc-cung-con" && fm.cau_hoi_cuoi?.some((c) => c?.trim())) {
    const hop = el("section", "hop hop-cau-hoi");
    hop.append(el("h2", "tieu-de-hop", "Câu hỏi cuối buổi"));
    const ol = el("ol");
    for (const c of fm.cau_hoi_cuoi) if (c?.trim()) ol.append(el("li", null, c));
    hop.append(ol);
    phan.push(hop);
  }
  if (d.loai === "nhat-ky") {
    phan.push(el("p", "ghi-chu-nhat-ky", "Đây là ghi chép và cảm nhận riêng của người viết, không phải lời khuyên chuyên môn. Một số chi tiết đã được thay đổi để bảo vệ trẻ."));
  }
  const chuDe = tenChuDe(fm.chu_de);
  if (chuDe) phan.push(el("p", "phu", `Chủ đề: ${chuDe}`));
  vung.replaceChildren(...phan);
  document.title = `Xem trước: ${fm.title || ""}`;
})();
