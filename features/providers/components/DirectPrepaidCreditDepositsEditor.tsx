import {
  PrepaidCreditDepositsEditor,
  type PrepaidCreditDepositsEditorProps,
} from "./PrepaidCreditDepositsEditor";

export type DirectPrepaidCreditDepositsEditorProps = PrepaidCreditDepositsEditorProps;

/** Reuses the shared controlled deposits editor for direct prepaid competences. */
export function DirectPrepaidCreditDepositsEditor(props: DirectPrepaidCreditDepositsEditorProps) {
  return <PrepaidCreditDepositsEditor {...props} />;
}
