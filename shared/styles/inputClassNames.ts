/** classNames reutilizáveis para Input/Select HeroUI (padrão Nucleus). */

export const defaultInputClassNames = {
  input: "group text-black!",
  label: "text-zinc-400!",
  inputWrapper:
    "group bg-zinc-100! border-1 border-default-200! hover:border-primary-100! data-[focus=true]:border-primary-100! data-[focus=true]:outline data-[focus=true]:outline-3 data-[focus=true]:outline-primary-50 data-[focus=true]:outline-offset-0 data-[invalid=true]:!border-danger data-[invalid=true]:!border-2",
};

export const defaultSelectClassNames = {
  trigger:
    "bg-zinc-100 border border-default-200! hover:border-primary-100! rounded-lg data-[focus=true]:border-primary-100! data-[focus=true]:outline data-[focus=true]:outline-3 data-[focus=true]:outline-primary-50 data-[focus=true]:outline-offset-0 data-[open=true]:border-primary-100! data-[open=true]:outline data-[open=true]:outline-3 data-[open=true]:outline-primary-50 data-[open=true]:outline-offset-0",
  value: "text-default-500! text-sm",
  popoverContent: "bg-white shadow-lg",
  listbox: "p-0 text-xs!",
  listboxWrapper: "max-h-[400px] text-xs!",
  label: "text-sm text-default-500!",
};

export const defaultCheckboxClassNames = {
  label: "text-sm text-gray-700",
};

/** Props padrão de Select HeroUI (Nucleus). */
export const nucleusSelectProps = {
  labelPlacement: "outside" as const,
  radius: "sm" as const,
  size: "sm" as const,
  classNames: defaultSelectClassNames,
};
