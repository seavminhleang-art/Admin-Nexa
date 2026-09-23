import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { LoaderCircle } from "lucide-react";
import LoadingSpinner from "@/Components/common/LoadingSpinner";
export default function AdminLoading({ label = "dashboard", compact = false }) {
  const { w } = useWorkspaceTranslation();
  if (compact)
    return (
      <div className="al-loading-progress" role="status" aria-live="polite">
        <LoaderCircle
          size={18}
          className="al-loading-spin"
          aria-hidden="true"
        />
        <span>
          {w("Loading")} {w(label)}…
        </span>
      </div>
    );
  return (
    <div className="al-loading" aria-busy="true">
      <LoadingSpinner
        fullScreen={false}
        title={w("Loading {{value0}}", {
          value0: w(label),
        })}
        subtitle={w("Please wait while your data loads.")}
      />
    </div>
  );
}
