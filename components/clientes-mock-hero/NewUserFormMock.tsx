"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import {
  UserStepBasicInfoMock,
  UserStepFranchisesMock,
  UserStepPermissionsMock,
} from "./UserFormStepsMock";

const LAST_STEP = 3;

interface NewUserFormMockProps {
  defaultClientName?: string;
  onClose: () => void;
}

export function NewUserFormMock({
  defaultClientName,
  onClose,
}: NewUserFormMockProps) {
  const [step, setStep] = useState(1);
  const [isCreated, setIsCreated] = useState(false);

  const goNext = () => {
    if (step === 1) setIsCreated(true);
    if (step >= LAST_STEP) {
      onClose();
      return;
    }
    setStep((s) => s + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <UserStepBasicInfoMock defaultClientName={defaultClientName} />
        );
      case 2:
        return <UserStepPermissionsMock />;
      case 3:
        return <UserStepFranchisesMock />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="flex-1 overflow-y-auto pr-2">{renderStep()}</div>
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-default-100 bg-white sticky bottom-0 z-10 w-full font-sans">
        <Button
          variant="light"
          className="border border-default-200 min-w-32 h-11 font-medium"
          onPress={() => {
            if (step === 1) onClose();
            else setStep(step - 1);
          }}
        >
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>
        {isCreated && step < LAST_STEP ? (
          <Button
            variant="light"
            className="border border-default-200 min-w-32 h-11 font-medium"
            onPress={onClose}
          >
            Salvar e sair
          </Button>
        ) : null}
        <Button
          color="primary"
          className="min-w-40 h-11 font-semibold shadow-md text-white"
          onPress={goNext}
        >
          {step === LAST_STEP ? "Salvar" : "Salvar e prosseguir"}
        </Button>
      </div>
    </div>
  );
}
