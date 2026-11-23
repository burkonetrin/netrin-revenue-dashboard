"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
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

export function SapCodeSectionMock() {
  const [sapCode, setSapCode] = useState("100234");
  const [sankhyaCode, setSankhyaCode] = useState("200345");

  return (
    <>
      <Input
        label="Código SAP"
        labelPlacement="outside"
        value={sapCode}
        onValueChange={setSapCode}
        classNames={defaultInputClassNames}
      />
      <Input
        label="Código Sankhya"
        labelPlacement="outside"
        value={sankhyaCode}
        onValueChange={setSankhyaCode}
        classNames={defaultInputClassNames}
      />
    </>
  );
}
