import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useState } from "react";
import { useAdminResourceQuery } from "./liveApi";
import { QueryNotice } from "./Dashboard";
import ReportRelated from "./ReportRelated";
export default function ClaimLog() {
  const { w } = useWorkspaceTranslation();
  const reports = useAdminResourceQuery("lost-found");
  const [reportId, setReportId] = useState("");
  return (
    <>
      <div className="al-heading">
        <div>
          <h1>{w("Claim Log")}</h1>
          <p>{w("Select a report to review its claims and matches.")}</p>
        </div>
      </div>
      <QueryNotice query={reports} label={w("reports")} />
      {reports.data && !reports.isError && (
        <section className="al-card">
          <label className="al-report-select">
            {w("Report")}
            <select
              value={reportId}
              onChange={(event) => setReportId(event.target.value)}
            >
              <option value="">{w("Select a report")}</option>
              {reports.data.rows.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title ||
                    w("Report #{{value0}}", {
                      value0: report.id,
                    })}
                </option>
              ))}
            </select>
          </label>
          {!reports.data.rows.length && (
            <p className="al-empty">{w("No reports available.")}</p>
          )}
          {reportId && <ReportRelated key={reportId} id={reportId} />}
        </section>
      )}
    </>
  );
}
