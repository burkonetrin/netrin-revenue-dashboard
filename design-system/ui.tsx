"use client";

import type { MouseEventHandler, ReactNode } from "react";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
  type ButtonProps,
  type InputProps,
  type SelectProps,
  type TextAreaProps,
} from "@heroui/react";
import { PageTitle } from "@/shared/components/PageTitle";
import {
  defaultCheckboxClassNames,
  defaultInputClassNames,
  nucleusSelectProps,
} from "@/shared/styles/inputClassNames";

export { PageTitle };

/** @deprecated Prefer `PageTitle` com prop `label`. */
export function PageHead({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return <PageTitle icon={icon} label={title} />;
}

function pressFromClick(onClick?: MouseEventHandler<HTMLButtonElement>) {
  if (!onClick) return undefined;
  return () => {
    onClick({} as React.MouseEvent<HTMLButtonElement>);
  };
}

export function OutlineButton({
  children,
  className,
  onClick,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Button
      radius="sm"
      variant="bordered"
      className={className}
      onPress={onPress ?? pressFromClick(onClick)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function PrimaryButton({
  children,
  className,
  onClick,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Button
      color="primary"
      radius="sm"
      className={className}
      onPress={onPress ?? pressFromClick(onClick)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function GhostButton({
  children,
  className,
  onClick,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="light"
      radius="sm"
      className={`border border-gray-300 ${className ?? ""}`}
      onPress={onPress ?? pressFromClick(onClick)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function FieldInput({
  label,
  className,
  ...props
}: InputProps & { label?: string }) {
  return (
    <Input
      label={label}
      labelPlacement={label ? "outside" : "inside"}
      radius="sm"
      classNames={defaultInputClassNames}
      className={className}
      {...props}
    />
  );
}

export type FieldSelectOption = { key: string; label: string };

type FieldSelectProps = Omit<
  SelectProps,
  "children" | "onSelectionChange" | "items"
> & {
  label?: string;
  items: FieldSelectOption[];
  onSelectionChange?: (key: string) => void;
};

export function FieldSelect({
  label,
  className,
  items,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  ...props
}: FieldSelectProps) {
  return (
    <Select
      {...nucleusSelectProps}
      label={label}
      className={className}
      selectionMode="single"
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={(keys) => {
        if (keys === "all" || !onSelectionChange) return;
        const key = Array.from(keys)[0]?.toString();
        if (key) onSelectionChange(key);
      }}
      {...props}
    >
      {items.map((item) => (
        <SelectItem key={item.key}>{item.label}</SelectItem>
      ))}
    </Select>
  );
}

export function FieldCheckbox({
  children,
  isSelected,
  onValueChange,
  className,
}: {
  children: ReactNode;
  isSelected: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <Checkbox
      size="sm"
      className={className}
      classNames={defaultCheckboxClassNames}
      isSelected={isSelected}
      onValueChange={onValueChange}
    >
      {children}
    </Checkbox>
  );
}

export function FieldTextarea({
  label,
  className,
  ...props
}: TextAreaProps & { label?: string }) {
  return (
    <Textarea
      label={label}
      labelPlacement={label ? "outside" : "inside"}
      radius="sm"
      minRows={3}
      classNames={{
        input: "text-black!",
        label: "text-zinc-400!",
        inputWrapper:
          "bg-zinc-100! border-1 border-default-200! hover:border-primary-100! data-[focus=true]:border-primary-100!",
      }}
      className={className}
      {...props}
    />
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <Switch
      size="sm"
      isSelected={checked}
      onValueChange={onChange}
      classNames={{
        label: "text-xs text-zinc-700",
        wrapper: "group-data-[selected=true]:bg-primary",
      }}
    >
      {label}
    </Switch>
  );
}

export { DynamicDrawer } from "@/shared/components/DynamicDrawer";
export { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
export { ConfirmModal } from "@/shared/components/ConfirmModal";
