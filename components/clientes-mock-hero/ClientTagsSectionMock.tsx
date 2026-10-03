"use client";

import { Button, Input } from "@heroui/react";
import { CirclePlus, X } from "lucide-react";
import { useState } from "react";

const MOCK_TAGS = ["Enterprise", "Painel comercial"];

export function ClientTagsSectionMock() {
  const [tags, setTags] = useState(MOCK_TAGS);

  return (
    <div className="flex flex-wrap items-center gap-3 col-span-3 mb-1">
      <Button
        variant="bordered"
        radius="sm"
        startContent={<CirclePlus size={16} />}
        className="border-gray-300 text-gray-900 bg-white"
      >
        Adicionar tag
      </Button>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-gray-100 px-3 text-xs text-gray-700"
        >
          <span className="max-w-40 truncate">{tag}</span>
          <button
            type="button"
            aria-label={`Remover tag ${tag}`}
            className="inline-flex size-5 items-center justify-center rounded-full border border-gray-400 text-gray-700 hover:border-gray-700 hover:text-gray-900 cursor-pointer"
            onClick={() => setTags((t) => t.filter((x) => x !== tag))}
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}

export const SAP_CODE_SAVE_LABEL = "Salvar código";

export function SapCodeSectionMock() {
  const [value, setValue] = useState("100234");
  return (
    <div className="flex items-end gap-4">
      <div className="flex w-[301px] max-w-full flex-col">
        <label className="pb-3 pr-2 text-sm font-normal leading-4 text-default-600">
          Código SAP
        </label>
        <Input
          aria-label="Código SAP"
          value={value}
          onValueChange={setValue}
          radius="lg"
          classNames={{
            inputWrapper:
              "h-10 min-h-10 bg-default-100 shadow-none! border-0! hover:bg-default-100",
            input: "text-sm text-foreground",
          }}
        />
      </div>
      <Button
        variant="bordered"
        color="default"
        radius="sm"
        size="md"
        className="h-10 min-w-0 border-2 border-default-300 px-4 text-sm font-normal text-foreground"
      >
        {SAP_CODE_SAVE_LABEL}
      </Button>
    </div>
  );
}
