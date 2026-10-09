import type React from "react";

export type DrawerSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

export interface DynamicDrawerProps {
  size?: DrawerSize;
  component: React.ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  placement?: DrawerPlacement;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  classNames?: {
    wrapper?: string;
    base?: string;
    backdrop?: string;
    content?: string;
    header?: string;
    body?: string;
    footer?: string;
    closeButton?: string;
  };
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  dataTestId?: string;
}
