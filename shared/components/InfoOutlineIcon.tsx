"use client";

const SIZE_CLASSES = {
  sm: "size-3.5 text-[9px]",
  md: "size-4 text-[10px]",
} as const;

export type InfoOutlineIconSize = keyof typeof SIZE_CLASSES;

interface InfoOutlineIconProps {
  size?: InfoOutlineIconSize;
  className?: string;
}

/** Ícone “i” circular com borda (painel comercial / MockInfoTooltip). */
export function InfoOutlineIcon({ size = "md", className = "" }: InfoOutlineIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-primary bg-white font-medium leading-none text-primary ${SIZE_CLASSES[size]} ${className}`.trim()}
      aria-hidden
    >
      i
    </span>
  );
}

interface InfoOutlineButtonProps extends InfoOutlineIconProps {
  "aria-label": string;
  className?: string;
  onClick?: () => void;
}

/** Botão acessível com o mesmo visual do ícone outline. */
export function InfoOutlineButton({
  size = "md",
  className = "",
  onClick,
  "aria-label": ariaLabel,
}: InfoOutlineButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-default items-center border-none bg-transparent p-0 hover:opacity-80 ${className}`.trim()}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <InfoOutlineIcon size={size} />
    </button>
  );
}
