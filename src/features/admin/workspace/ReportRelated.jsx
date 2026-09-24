import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useState } from "react";
import { useAdminManageMutation, useAdminReportRelatedQuery, useAdminProfileQuery } from "./liveApi";
import { QueryNotice } from "./Dashboard";
import { ownsReport } from "./reportOwnership";
export default function ReportRelated({ report }) {
  const { w } = useWorkspaceTranslation();
  const profile = useAdminProfileQuery();
  if (profile.isLoading || profile.isError || !profile.data) {
    return <QueryNotice query={profile} label={w("account profile")} />;
  }
  if (!ownsReport(report, profile.data)) {
    return <p className="al-data-note">{w("Claims and matches are available only for reports you posted.")}</p>;
  }
  return <OwnedReportRelated key={report.id} id={report.id} />;
}
function OwnedReportRelated({ id }) {
  const { w } = useWorkspaceTranslation();
  const claims = useAdminReportRelatedQuery({
    id,
    kind: "claims",
  });
  const matches = useAdminReportRelatedQuery({
    id,
    kind: "matches",
  });
  const [manage, state] = useAdminManageMutation();
  const [pending, setPending] = useState(null);
  async function confirm() {
    const response = await manage({
      ...pending,
    });
    if (!response.error) setPending(null);
  }
  return (
    <div className="al-report-related">
      <h2>{w("Claims")}</h2>
      <QueryNotice query={claims} label={w("claims")} />
      {!claims.isError &&
        claims.data?.rows.map((claim) => (
          <div className="al-post" key={claim.id}>
            <div>
              <strong>
                {w("Claim #")}
                {claim.id}
              </strong>
              <small>
                {w("Claimant #")}
                {claim.claimantUserId} · {w(claim.status)}
              </small>
            </div>
            {claim.status?.toUpperCase() === "PENDING" && (
              <div className="al-actions">
                <button
                  className="al-button"
                  disabled={state.isLoading}
                  onClick={() => {
                    state.reset();
                    setPending({
                      resource: "claims",
                      id: claim.id,
                      action: "approve",
                    });
                  }}
                >
                  {w("Approve")}
                </button>
                <button
                  className="al-button"
                  disabled={state.isLoading}
                  onClick={() => {
                    state.reset();
                    setPending({
                      resource: "claims",
                      id: claim.id,
                      action: "reject",
                    });
                  }}
                >
                  {w("Reject")}
                </button>
              </div>
            )}
          </div>
        ))}
      {!claims.isError && claims.data?.rows.length === 0 && (
        <p>{w("No claims for this report.")}</p>
      )}
      {pending && (
        <div className="al-alert">
          <p>
            {pending.action === "approve"
              ? w("Approve")
              : pending.action === "confirm"
                ? w("Confirm")
                : w("Reject")}{" "}
            {w(pending.resource === "claims" ? "claim" : "match")} #{pending.id}
            ?
          </p>
          <div className="al-actions">
            <button
              className="al-button"
              disabled={state.isLoading}
              onClick={confirm}
            >
              {w("Confirm")}
            </button>
            <button
              className="al-button"
              disabled={state.isLoading}
              onClick={() => setPending(null)}
            >
              {w("Cancel")}
            </button>
          </div>
        </div>
      )}
      {state.isError && (
        <p role="alert" className="al-alert">
          {w(
            "The record could not be updated. Your account may not have permission.",
          )}
        </p>
      )}
      <h2>{w("Matches")}</h2>
      <QueryNotice query={matches} label={w("matches")} />
      {!matches.isError &&
        matches.data?.rows.map((match) => (
          <div className="al-post" key={match.id}>
            <div>
              <strong>
                {w("Match #")}
                {match.id}
              </strong>
              <small>
                {w("Lost item #")}
                {match.lostItemId} {w("\xB7 Found item #")}
                {match.foundItemId}
              </small>
            </div>
            <span>
              {w(match.status)} {w("\xB7 Score:")} {match.totalScore}
            </span>
            {!["CONFIRMED", "REJECTED"].includes(match.status) && (
              <div className="al-actions">
                <button
                  className="al-button"
                  disabled={state.isLoading}
                  onClick={() => {
                    state.reset();
                    setPending({
                      resource: "matches",
                      id: match.id,
                      action: "confirm",
                    });
                  }}
                >
                  {w("Confirm match")}
                </button>
                <button
                  className="al-button"
                  disabled={state.isLoading}
                  onClick={() => {
                    state.reset();
                    setPending({
                      resource: "matches",
                      id: match.id,
                      action: "reject",
                    });
                  }}
                >
                  {w("Reject match")}
                </button>
              </div>
            )}
          </div>
        ))}
      {!matches.isError && matches.data?.rows.length === 0 && (
        <p>{w("No matches for this report.")}</p>
      )}
    </div>
  );
}
