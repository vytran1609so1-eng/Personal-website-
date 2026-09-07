"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Con trỏ tuỳ biến: một chấm nhỏ đi đúng theo chuột và một vòng tròn bám theo
 * có độ trễ mềm. Vòng dùng mix-blend-difference nên tự đọc được trên cả nền
 * sáng lẫn nền tối. Khi đi qua ảnh, vòng đổi thành một huy hiệu có chữ.
 * Chỉ bật trên thiết bị có chuột thật và khi người dùng không tắt chuyển động.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState("default"); // default | link | media
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const seen = useRef(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const rx = useSpring(x, { stiffness: 360, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 360, damping: 32, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    function onMove(e) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!seen.current) {
        seen.current = true;
        setVisible(true);
      }
    }
    function onOver(e) {
      const el = e.target.closest?.("a, button, [data-cursor]");
      if (!el) {
        setVariant("default");
        setLabel("");
        return;
      }
      const custom = el.getAttribute("data-cursor");
      if (custom !== null) {
        setVariant("media");
        setLabel(custom === "" || custom === "true" ? "" : custom);
      } else {
        setVariant("link");
        setLabel("");
      }
    }
    function onOut(e) {
      if (!e.relatedTarget) setVisible(false);
    }
    function onIn() {
      if (seen.current) setVisible(true);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerenter", onIn);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerenter", onIn);
    };
  }, [x, y]);

  if (!enabled) return null;

  const isMedia = variant === "media";
  const ringSize = variant === "link" ? 44 : 26;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      {/* Vòng tròn bám theo, có độ trễ */}
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          {/* vòng cho trạng thái thường + link */}
          <motion.div
            className="rounded-full border border-white mix-blend-difference"
            animate={{
              width: ringSize,
              height: ringSize,
              opacity: visible && !isMedia ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          />
          {/* huy hiệu khi đi qua ảnh */}
          <motion.div
            className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy"
            animate={{
              width: isMedia ? 78 : 0,
              height: isMedia ? 78 : 0,
              opacity: visible && isMedia ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            {isMedia && label && (
              <span className="select-none whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                {label}
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Chấm đi đúng theo chuột */}
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
          animate={{
            width: isMedia ? 0 : 6,
            height: isMedia ? 0 : 6,
            opacity: visible && !isMedia ? 1 : 0,
          }}
          transition={{ duration: 0.18 }}
        />
      </motion.div>
    </div>
  );
}
