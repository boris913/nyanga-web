"use client";

import { useEffect, useState } from "react";
import { HEART_PATH } from "@/lib/brand";

/** Petite explosion de cœurs autour d'un élément (bouton touché). */
export function heartBurst(origin: HTMLElement | null) {
  if (!origin || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = origin.getBoundingClientRect();
  const colors = ["#b3343a", "#d4607a", "#a86f0c", "#e88a9a"];
  for (let i = 0; i < 9; i++) {
    const angle = (Math.PI * 2 * i) / 9 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 40;
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 64 64");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<path d="${HEART_PATH}" fill="${colors[i % colors.length]}"/>`;
    const size = 10 + Math.random() * 10;
    Object.assign(el.style, {
      position: "fixed",
      left: `${box.left + box.width / 2}px`,
      top: `${box.top + box.height / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      pointerEvents: "none",
      zIndex: "60",
      animation: `burst ${600 + Math.random() * 300}ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards`,
    });
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

type Toast = { id: number; text: string; tone: "ok" | "error" };
const EVENT = "nyanga:toast";

/** Message de confirmation animé, affiché en bas de l'écran. */
export function toast(text: string, tone: Toast["tone"] = "ok") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { text, tone } }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const { text, tone } = (e as CustomEvent<Omit<Toast, "id">>).detail;
      const id = ++seq;
      setToasts((t) => [...t.slice(-2), { id, text, tone }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 lg:bottom-6 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast flex max-w-sm items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${
            t.tone === "ok" ? "bg-ink text-white" : "bg-brand-dark text-white"
          }`}
        >
          {t.tone === "ok" && (
            <svg viewBox="0 0 64 64" className="size-4 shrink-0 text-[#e88a9a]" aria-hidden>
              <path d={HEART_PATH} fill="currentColor" />
            </svg>
          )}
          {t.text}
        </div>
      ))}
    </div>
  );
}
