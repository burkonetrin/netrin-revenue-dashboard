"use client";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import type { DynamicDrawerProps } from "./types";

/** Drawer lateral reutilizável (padrão Nucleus). */
export function DynamicDrawer({
  size = "md",
  component,
  title,
  subtitle,
  isOpen,
  onOpenChange,
  placement = "right",
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  classNames,
  footer,
  hideCloseButton = false,
  dataTestId,
}: DynamicDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement={placement}
      size={size}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      hideCloseButton={hideCloseButton}
      classNames={{
        wrapper: classNames?.wrapper,
        base: classNames?.base,
        backdrop: classNames?.backdrop,
        closeButton: `text-2xl ${classNames?.closeButton || ""}`,
      }}
    >
      <DrawerContent
        data-testid={dataTestId}
        className={classNames?.content}
      >
        <DrawerHeader className={`text-[30px] ${classNames?.header || ""}`}>
          <div className="flex flex-col gap-1">
            <span>{title}</span>
            {subtitle ? (
              <span className="text-sm font-normal text-zinc-500 leading-snug">
                {subtitle}
              </span>
            ) : null}
          </div>
        </DrawerHeader>
        <DrawerBody className={`flex-none! mb-8 ${classNames?.body || ""}`}>
          {component}
        </DrawerBody>
        {footer ? (
          <DrawerFooter className={classNames?.footer}>{footer}</DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
