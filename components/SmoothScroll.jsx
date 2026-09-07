"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Cuộn có quán tính (Lenis). Lenis vẫn cuộn bằng scroll thật của trình duyệt
 * nên IntersectionObserver và useScroll của Framer Motion vẫn hoạt động bình thường.
 * Tự tắt khi người dùng bật "giảm chuyển động" trong hệ điều hành.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // để cuộn trên điện thoại giữ cảm giác gốc
    });

    window.__lenis = lenis;

    let frame;
    function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // Cho các link neo (#excellence) chạy qua Lenis
    function onClick(e) {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -70 });
    }
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return null;
}
