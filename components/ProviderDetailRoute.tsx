import { ProviderDetailPage } from "@/features/providers/components/ProviderDetailPage";
import { nucleusPrivatePageShellCancelMainPaddingClass } from "@/shared/styles/prototypePageShell";
import { useParams } from "react-router-dom";

export function ProviderDetailRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return null;
  }
  return (
    <div className={nucleusPrivatePageShellCancelMainPaddingClass}>
      <ProviderDetailPage providerId={id} />
    </div>
  );
}
