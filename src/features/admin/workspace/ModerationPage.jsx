import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ShieldCheck,
  ListFilter,
  Folder,
  X,
} from "lucide-react";
import { useAdminResourceQuery } from "./liveApi";
import { QueryNotice } from "./Dashboard";
import AdminLoading from "./AdminLoading";
import ReportRelated from "./ReportRelated";
import ManageDialog from "./ManageDialog";
import { matchesModerationFilter } from "./moderationData";
function ReviewDialog({ report, onClose }) {
  const { w } = useWorkspaceTranslation();
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="al-manage-dialog" onCancel={onClose}>
      <div className="al-heading">
        <h2>
          {report.title ||
            w("Report #{{value0}}", {
              value0: report.id,
            })}
        </h2>
        <button
          className="al-icon-button"
          aria-label={w("Close review")}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <p>{report.description || w("No description provided.")}</p>
      <p className="al-data-note">
        {report.categoryName || w("Uncategorized")} ·{" "}
        {report.locationLabel ||
          report.freeTextLocation ||
          w("Location unavailable")}{" "}
        · {w(report.moderationStatus || "Not classified")}
      </p>
      <ReportRelated id={report.id} />
      <button className="al-button" onClick={onClose}>
        {w("Close review")}
      </button>
    </dialog>
  );
}
export default function ModerationPage() {
  const { w } = useWorkspaceTranslation();
  const reports = useAdminResourceQuery("lost-found");
  const tags = useAdminResourceQuery("tags");
  const categories = useAdminResourceQuery("categories");
  const locations = useAdminResourceQuery("locations");
  const [filter, setFilter] = useState("all");
  const [detailed, setDetailed] = useState(true);
  const [review, setReview] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const rows = reports.isError ? [] : reports.data?.rows || [];
  const pending = rows.filter((row) =>
    matchesModerationFilter(row, "pending"),
  ).length;
  const hasModerationStatus =
    Boolean(reports.data) &&
    !reports.isError &&
    rows.every(
      (row) =>
        typeof row.moderationStatus === "string" && row.moderationStatus.length,
    );
  const visible = rows.filter((row) => matchesModerationFilter(row, filter));
  const tabs = [
    ["all", "All"],
    ["pending", "Pending"],
    ["suspicious", "Suspicious"],
    ["hidden", "Hidden"],
    ["resolved", "Resolved"],
  ];
  if (reports.isLoading) return <AdminLoading label="moderation" />;
  return (
    <div className="am-page">
      <div className="am-stats">
        <article className="am-stat am-red">
          <div>
            <span>{w("PENDING REPORTS")}</span>
            <strong>{hasModerationStatus ? pending : "—"}</strong>
            <small>
              {hasModerationStatus
                ? w("Require moderator triage \xB7 loaded reports")
                : w("Moderation status unavailable")}
            </small>
          </div>
          <i>
            <AlertTriangle size={18} />
          </i>
        </article>
        <article className="am-stat am-green">
          <div>
            <span>{w("RESOLVED TODAY")}</span>
            <strong>—</strong>
            <small>{w("Resolution dates are unavailable")}</small>
          </div>
          <i>
            <Check size={18} />
          </i>
        </article>
        <article className="am-stat am-blue">
          <div>
            <span>{w("SAFETY SCORE")}</span>
            <strong>—</strong>
            <small>{w("No safety score is provided")}</small>
          </div>
          <i>
            <ShieldCheck size={18} />
          </i>
        </article>
      </div>
      <div className="am-layout">
        <section className="am-queue al-card">
          <div className="am-queue-heading">
            <h2>
              <span className="am-dot" />
              {w("Review Queue")}{" "}
              <small>
                ({visible.length} {w("loaded reports)")}
              </small>
            </h2>
            <div className="am-controls">
              <div
                className="am-filters"
                role="group"
                aria-label={w("Review status")}
              >
                {tabs.map(([key, label]) => (
                  <button
                    key={key}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {w(label)}
                    {key !== "all" && reports.data && !reports.isError
                      ? ` (${rows.filter((row) => matchesModerationFilter(row, key)).length})`
                      : ""}
                  </button>
                ))}
              </div>
              <div
                className="am-filters"
                role="group"
                aria-label={w("Queue view")}
              >
                <button
                  aria-pressed={!detailed}
                  onClick={() => setDetailed(false)}
                >
                  {w("Table")}
                </button>
                <button
                  aria-pressed={detailed}
                  onClick={() => setDetailed(true)}
                >
                  {w("Detailed")}
                </button>
              </div>
            </div>
          </div>
          <QueryNotice query={reports} label={w("review queue")} />
          {!reports.isError &&
            reports.data &&
            (visible.length ? (
              detailed ? (
                <div className="am-reports">
                  {visible.map((report) => (
                    <article key={report.id} className="am-report">
                      <div>
                        <div className="am-report-title">
                          <strong>
                            {report.title ||
                              w("Report #{{value0}}", {
                                value0: report.id,
                              })}
                          </strong>
                          <span className="am-chip">
                            {w(report.moderationStatus || "Not classified")}
                          </span>
                          {report.status && (
                            <span className="am-chip">{w(report.status)}</span>
                          )}
                        </div>
                        <p>
                          {report.description ||
                            w("Report #{{value0}} \xB7 {{value1}}", {
                              value0: report.id,
                              value1: report.categoryName || w("Uncategorized"),
                            })}
                        </p>
                      </div>
                      <div className="al-actions">
                        <button
                          className="am-visibility"
                          disabled
                          title={w(
                            "The API does not support changing report visibility",
                          )}
                        >
                          {report.moderationStatus?.toUpperCase() === "HIDDEN"
                            ? w("Unhide")
                            : w("Hide")}
                        </button>
                        <button
                          className="am-review"
                          onClick={() => setReview(report)}
                        >
                          {w("Review \u2192")}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="al-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{w("Report")}</th>
                        <th>{w("Moderation")}</th>
                        <th>{w("Status")}</th>
                        <th>{w("Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td>
                            {w(report.moderationStatus || "Not classified")}
                          </td>
                          <td>{w(report.status || "—")}</td>
                          <td>
                            <button
                              className="am-review"
                              onClick={() => setReview(report)}
                            >
                              {w("Review \u2192")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="al-empty">
                {w("No")} {filter === "all" ? "" : `${w(filter)} `}
                {w("reports in the loaded results.")}
              </p>
            ))}
          <footer>
            {w(
              "Showing lost-and-found reports. Visibility controls require backend support.",
            )}
          </footer>
        </section>
        <aside className="am-side">
          <section className="al-card">
            <div className="am-panel-heading">
              <h2>
                <ListFilter size={15} />
                {w("Q&A Tags")}
              </h2>
              <Link to="/admin/tags">{w("Manage \u2192")}</Link>
            </div>
            <QueryNotice query={tags} label="tags" />
            {!tags.isError &&
              tags.data?.rows.map((tag) => (
                <div className="am-category" key={tag.id}>
                  <strong>{tag.tagName}</strong>
                  <span>
                    {Number.isFinite(tag.count)
                      ? w("{{value0}} posts", {
                          value0: tag.count,
                        })
                      : "—"}
                    <b className="am-dot" />
                  </span>
                </div>
              ))}
            {!tags.isError && tags.data?.rows.length === 0 && (
              <p className="al-data-note">{w("No tags available.")}</p>
            )}
          </section>
          <section className="al-card">
            <div className="am-panel-heading">
              <h2>
                <Folder size={15} />
                {w("Lost & Found Manager")}
              </h2>
            </div>
            <QueryNotice query={categories} label="categories" />
            <div className="am-category-chips">
              {!categories.isError &&
                categories.data?.rows.map((category) => (
                  <span className="am-chip" key={category.id}>
                    {category.name}
                  </span>
                ))}
              <button
                className="am-add"
                onClick={() => setCreatingCategory(true)}
              >
                {w("+ New Category")}
              </button>
            </div>
            <div className="am-zone-heading">
              {w("CAMPUS ZONES")}{" "}
              <Link to="/admin/locations">{w("View all \u2192")}</Link>
            </div>
            <QueryNotice query={locations} label="locations" />
            {!locations.isError &&
              locations.data?.rows.map((location) => (
                <div className="am-category" key={location.id}>
                  <strong>
                    {[location.building, location.floor, location.room]
                      .filter(Boolean)
                      .join(" · ") ||
                      w("Location #{{value0}}", {
                        value0: location.id,
                      })}
                  </strong>
                  <span>
                    {reports.data && !reports.isError
                      ? w("{{value0}} items", {
                          value0: rows.filter(
                            (row) => row.locationId === location.id,
                          ).length,
                        })
                      : "—"}
                  </span>
                </div>
              ))}
            {!locations.isError && locations.data?.rows.length === 0 && (
              <p className="al-data-note">{w("No locations available.")}</p>
            )}
          </section>
        </aside>
      </div>
      {review && (
        <ReviewDialog report={review} onClose={() => setReview(null)} />
      )}
      {creatingCategory && (
        <ManageDialog
          resource="categories"
          action="create"
          onClose={() => setCreatingCategory(false)}
        />
      )}
    </div>
  );
}
