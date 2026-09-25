import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarMenuItem } from "./SidebarMenuItem";
import type { MenuItem } from "./menuItems";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  items: MenuItem[];
}

type SidebarPhase =
  | "compact"
  | "expanding"
  | "expanded"
  | "hiding-labels"
  | "collapsing";

const LABEL_FADE_MS = 150;

const widthTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as const,
};

const PHASE_WIDTH: Record<SidebarPhase, string> = {
  compact: "70px",
  expanding: "280px",
  expanded: "280px",
  "hiding-labels": "280px",
  collapsing: "70px",
};

export function Sidebar({ items }: Readonly<SidebarProps>) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<SidebarPhase>("compact");
  const phaseRef = useRef<SidebarPhase>("compact");

  phaseRef.current = phase;

  useEffect(() => {
    if (phase !== "hiding-labels") {
      return;
    }

    const timer = setTimeout(() => {
      setPhase("collapsing");
    }, LABEL_FADE_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  const handleMouseEnter = () => {
    if (
      phaseRef.current === "compact" ||
      phaseRef.current === "collapsing" ||
      phaseRef.current === "hiding-labels"
    ) {
      setPhase("expanding");
    }
  };

  const handleMouseLeave = () => {
    if (
      phaseRef.current === "expanded" ||
      phaseRef.current === "expanding"
    ) {
      setPhase("hiding-labels");
    }
  };

  const handleWidthAnimationComplete = () => {
    const { current } = phaseRef;

    if (current === "expanding") {
      setPhase("expanded");
      return;
    }

    if (current === "collapsing") {
      setPhase("compact");
    }
  };

  const isCompact = phase === "compact";
  const showLabels = phase === "expanded";

  return (
    <motion.aside
      className={cn(
        "bg-[#FAFAFA] shadow h-screen flex flex-col sticky top-0 overflow-x-hidden",
      )}
      initial={false}
      animate={{ width: PHASE_WIDTH[phase] }}
      layout={false}
      transition={widthTransition}
      onAnimationComplete={handleWidthAnimationComplete}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex shrink-0 items-center h-16 relative">
        <AnimatePresence mode="wait">
          {isCompact ? (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="absolute flex items-center"
              style={{ left: "22.5px", top: 0, bottom: 0 }}
            >
              <img
                src="/logoNetrinCollapsed.png"
                alt="Netrin"
                width={25}
                height={25}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="absolute inset-0 flex items-center pl-4"
            >
              <img
                src="/logoNetrin.png"
                alt="Netrin"
                width={80}
                height={25}
                className="object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav
        className={cn(
          "flex-1 flex flex-col min-h-0 py-4",
          isCompact ? "px-2" : "p-4",
        )}
      >
        <div
          className={cn(
            "sidebar-menu-scroll flex-1 min-h-0 overflow-y-auto space-y-2",
            isCompact ? "sidebar-menu-scroll--collapsed" : "pr-1",
          )}
        >
          {items.map((item) => {
            const isActive = pathname === item.path;

            const iconWithActive =
              item.icon && typeof item.icon === "object" && "type" in item.icon
                ? React.cloneElement(
                    item.icon as React.ReactElement<{ isActive?: boolean }>,
                    {
                      isActive,
                    },
                  )
                : item.icon;

            return (
              <SidebarMenuItem
                key={item.path}
                icon={iconWithActive}
                label={item.label}
                isActive={isActive}
                isCompact={isCompact}
                showLabel={showLabels}
                onClick={() => navigate(item.path)}
              />
            );
          })}
        </div>
      </nav>
    </motion.aside>
  );
}
