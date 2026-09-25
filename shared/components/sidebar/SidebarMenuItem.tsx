import { AnimatePresence, motion } from "framer-motion";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface SidebarMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCompact: boolean;
  showLabel: boolean;
  onClick: () => void;
}

const labelTransition = {
  duration: 0.15,
  ease: "easeOut" as const,
};

export function SidebarMenuItem({
  icon,
  label,
  isActive = false,
  isCompact,
  showLabel,
  onClick,
}: Readonly<SidebarMenuItemProps>) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center rounded-lg transition-colors cursor-pointer overflow-hidden",
        isCompact ? "justify-center" : "justify-start",
        isActive
          ? "text-[#4F169D] font-medium"
          : "text-gray-700 hover:bg-gray-100",
      )}
      initial={false}
      layout={false}
      title={isCompact ? label : undefined}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 flex items-center justify-center",
            isActive && "bg-[#EDE8F5]",
          )}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: isActive ? "8px" : "0",
          }}
        >
          {icon}
        </span>
      )}

      <AnimatePresence mode="popLayout">
        {showLabel && (
          <motion.span
            key={`label-${label}`}
            className={cn(
              "text-sm whitespace-nowrap ml-3 shrink-0",
              isActive && "text-[#4F169D]",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={labelTransition}
            layout={false}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
