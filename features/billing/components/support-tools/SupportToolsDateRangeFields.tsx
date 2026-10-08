"use client";

import { DatePicker } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { safeParseDate } from "../billing-drawer.shared";
import { SupportToolsFilterField } from "./SupportToolsFilterField";

interface SupportToolsDateRangeFieldsProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function SupportToolsDateRangeFields({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SupportToolsDateRangeFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SupportToolsFilterField label="Data inicial">
        <DatePicker
          aria-label="Data inicial"
          value={safeParseDate(startDate)}
          onChange={(date: DateValue | null) => onStartDateChange(date?.toString() ?? "")}
          className="w-full"
          classNames={defaultInputClassNames}
        />
      </SupportToolsFilterField>
      <SupportToolsFilterField label="Data final">
        <DatePicker
          aria-label="Data final"
          value={safeParseDate(endDate)}
          onChange={(date: DateValue | null) => onEndDateChange(date?.toString() ?? "")}
          className="w-full"
          classNames={defaultInputClassNames}
        />
      </SupportToolsFilterField>
    </div>
  );
}
