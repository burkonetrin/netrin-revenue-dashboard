"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type FloatingAlign = "start" | "end";

interface FloatingPopoverPortalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  align?: FloatingAlign;
  offset?: number;
  minWidth?: number;
  fitContent?: boolean;
}

function computePosition(
  anchor: HTMLElement,
  align: FloatingAlign,
  offset: number,
  panelHeight: number,
) {
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  let top = rect.bottom + offset;
  let left = align === "end" ? rect.right : rect.left;

  if (top + panelHeight > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - panelHeight - offset);
  }

  if (align === "end") {
    left = Math.min(window.innerWidth - margin, left);
  } else {
    left = Math.max(margin, left);
  }

  return { top, left };
}

export function FloatingPopoverPortal({
  open,
  onClose,
  anchorRef,
  children,
  className = "",
  align = "start",
  offset = 8,
  minWidth = 260,
  fitContent = false,
}: FloatingPopoverPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [panelRef, setPanelRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      if (!anchorRef.current) return;
      const height = panelRef?.offsetHeight ?? 240;
      setPos(computePosition(anchorRef.current, align, offset, height));
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef, align, offset, panelRef]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose, anchorRef, panelRef]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={setPanelRef}
      role="dialog"
      className={`fixed z-[10090] rounded-lg border border-[var(--ds-border)] bg-white shadow-lg ${className}`}
      style={{
        top: pos.top,
        left: pos.left,
        minWidth: fitContent ? undefined : minWidth,
        width: fitContent ? "max-content" : undefined,
        transform: align === "end" ? "translateX(-100%)" : undefined,
        maxHeight: "min(70vh, 480px)",
        overflowY: "auto",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
