import { BackgroundCheckTemplatesPreview } from "@/features/background-check-templates-preview/components/BackgroundCheckTemplatesPreview";
import { BACKGROUND_CHECK_TEMPLATE_PERMISSIONS } from "@/features/background-check-templates/constants/backgroundCheckTemplatePermissions.constants";
import { PROVIDERS_BASE_PATH } from "@/constants";
import { usePermission } from "@/shared/hooks/usePermission";
import { nucleusPrivatePageShellClass } from "@/shared/styles/prototypePageShell";
import { Navigate } from "react-router-dom";

/** Prévia isolada da interface de Modelos Background Check. */
export function BackgroundCheckPreviewRoute() {
  const { can } = usePermission();
  const canAccessPreview = can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.access);

  if (!canAccessPreview) {
    return <Navigate to={PROVIDERS_BASE_PATH} replace />;
  }

  return (
    <div className={nucleusPrivatePageShellClass}>
      <div className="size-full">
        <BackgroundCheckTemplatesPreview />
      </div>
    </div>
  );
}
