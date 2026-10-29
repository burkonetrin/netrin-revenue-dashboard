import { DataSourceDetailsPage } from "@/features/providers/components/DataSourceDetailsPage";
import { nucleusPrivatePageShellCancelMainPaddingClass } from "@/shared/styles/prototypePageShell";
import { useParams } from "react-router-dom";

export function DataSourceDetailRoute() {
  const { sourceId } = useParams<{ sourceId: string }>();
  if (!sourceId) {
    return null;
  }
  return (
    <div className={nucleusPrivatePageShellCancelMainPaddingClass}>
      <DataSourceDetailsPage sourceId={sourceId} />
    </div>
  );
}
