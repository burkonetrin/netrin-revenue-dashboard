import { HeroUIProvider, ToastProvider } from "@heroui/react";
import type { ReactNode } from "react";

interface HeroUIProviderProps {
  children: ReactNode;
}

export function HeroUIProviderWrapper({
  children,
}: Readonly<HeroUIProviderProps>) {
  return (
    <HeroUIProvider locale="pt-BR">
      <ToastProvider placement="top-right" />
      {children}
    </HeroUIProvider>
  );
}
