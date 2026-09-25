import type React from "react";

interface PageTitleProps {
  icon: React.ReactNode;
  label: string;
}

export function PageTitle({ icon, label }: Readonly<PageTitleProps>) {
  return (
    <div className="w-full flex items-center gap-3">
      <div className="shrink-0 flex items-center justify-center size-10 rounded-full bg-primary-50 text-primary">
        {icon}
      </div>
      <h1 className="text-[30px] font-semibold">{label}</h1>
    </div>
  );
}
