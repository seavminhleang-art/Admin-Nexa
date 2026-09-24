import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useEffect, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import { navigation } from "./AdminShell";
import {
  resourcePaths,
  useAdminResourceQuery,
  useAdminProfileQuery,
  useAdminMarkReadMutation,
  useAdminMarkAllReadMutation,
} from "./liveApi";
import { QueryNotice, dateOf } from "./Dashboard";
import ManageDialog from "./ManageDialog";
import ReportRelated from "./ReportRelated";
import AdminLoading from "./AdminLoading";
import ClaimLog from "./ClaimLog";
import ModerationPage from "./ModerationPage";
import SettingsPage from "./SettingsPage";
import UserManagement from "./UserManagement";
import Leaderboard from "./Leaderboard";
import LocationPage from "./LocationPage";
export default function ResourcePage({ resource, embedded = false }) {
  if (resource === "settings") return <SettingsPage />;
  if (resource === "users" && !embedded) return <UserManagement />;
  if (resource === "leaderboard") return <Leaderboard />;
  if (resource === "locations") return <LocationPage />;
  if (resource === "moderation") return <ModerationPage />;
  if (resource === "claims") return <ClaimLog />;
  // Reset filters and record details when navigating between resources.
  return <ResourceContent key={resource} resource={resource} />;
}
function ResourceContent({ resource }) {
  const { w } = useWorkspaceTranslation();
  const [filterTime] = useState(() => Date.now());
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [joinedDays, setJoinedDays] = useState("");
  const [search, setSearch] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const supported = Boolean(resourcePaths[resource]);
  const serverSearchable = ["users", "posts", "comments", "tags"].includes(
    resource,
  );
  const notifications = resource === "notifications";
  const query = useAdminResourceQuery(
    {
      resource,
      search: serverSearchable ? serverSearch : "",
      page: notifications ? page : 0,
    },
    {
      skip: !supported,
    },
  );
  const profile = useAdminProfileQuery(undefined, {
    skip: !["settings", "posts", "comments"].includes(resource),
  });
  const [markRead, markState] = useAdminMarkReadMutation();
  const [markAllRead, markAllState] = useAdminMarkAllReadMutation();
  const title = navigation.find(([key]) => key === resource)?.[1] || resource;
  const data = query.currentData;
  const sourceRows =
    resource === "leaderboard"
      ? [...(data?.rows || [])].sort(
          (a, b) => (b.reputation ?? 0) - (a.reputation ?? 0),
        )
      : data?.rows || [];
  const roleOf = row => typeof row.role === "string" ? row.role : "";
  const rows = sourceRows.filter(row => resource !== "users" || ((!userRole || roleOf(row) === userRole) && (!userStatus || row.status === userStatus) && (!joinedDays || (dateOf(row) && dateOf(row).getTime() >= filterTime - Number(joinedDays) * 86400000)))).filter(
    (row) =>
      serverSearchable ||
      JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  const pages = Math.max(
    1,
    Math.ceil(
      (notifications ? (data?.total ?? rows.length) : rows.length) / 20,
    ),
  );
  const current = notifications ? page : Math.min(page, pages - 1);
  const visibleRows = notifications
    ? rows
    : rows.slice(current * 20, (current + 1) * 20);
  useEffect(() => {
    const timer = setTimeout(() => setServerSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  function canEdit(row) {
    return (
      resource === "tags" ||
      (!profile.isError &&
        profile.data?.id != null &&
        profile.data.id === (resource === "posts" ? row.ownerId : row.userId))
    );
  }
  function exportRows() {
    const csvCell = value => { const text = String(value ?? ""); return '"' + (/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"'; };
    const csv = [["ID", "Name", "Email", "Role", "Status"], ...rows.map(row => [row.id, row.displayName, row.email, roleOf(row), row.status])].map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([resource === "users" ? "\uFEFF" + csv : JSON.stringify(rows, null, 2)], {type: resource === "users" ? "text/csv;charset=utf-8" : "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resource}.${resource === "users" ? "csv" : "json"}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (resource === "settings")
    return (
      <>
        <div className="al-heading">
          <div>
            <h1>{w("Settings")}</h1>
            <p>{w("Your administrator account.")}</p>
          </div>
          <button
            className="al-button"
            disabled={profile.isFetching}
            onClick={profile.refetch}
          >
            <RefreshCw size={16} />
            {w("Refresh")}
          </button>
        </div>
        <QueryNotice query={profile} label={w("account profile")} />
        {profile.data && !profile.isError && (
          <section className="al-card">
            <div className="al-heading">
              <h2>{w("Profile")}</h2>
              <button className="al-button" onClick={() => setEditing({ resource: "password", action: "update" })}>{w("Change password")}</button>
              <button
                className="al-button"
                onClick={() =>
                  setEditing({
                    action: "update",
                    record: profile.data,
                  })
                }
              >
                {w("Edit profile")}
              </button>
            </div>
            <dl className="al-profile">
              <dt>{w("Name")}</dt>
              <dd>{profile.data.displayName || "—"}</dd>
              <dt>{w("Email")}</dt>
              <dd>{profile.data.email || "—"}</dd>
              <dt>{w("Bio")}</dt>
              <dd>{profile.data.bio || "—"}</dd>
            </dl>
          </section>
        )}
        {editing && (
          <ManageDialog
            resource={editing.resource || "profile"}
            {...editing}
            onClose={() => setEditing(null)}
          />
        )}
      </>
    );
  return (
    <>
      <div className="al-heading">
        <div>
          <h1>{w(title)}</h1>
          <p>
            {resource === "leaderboard"
              ? w("Loaded users ranked by reputation.")
              : w("Browse and inspect {{value0}}.", {
                  value0: w(title.toLowerCase()),
                })}
          </p>
        </div>
        {supported && (
          <div className="al-actions">
            {["posts", "comments", "tags", "categories", "locations", "lost-found"].includes(resource) && (
              <button
                className="al-button"
                onClick={() =>
                  setEditing({
                    action: "create",
                  })
                }
              >
                {w("Create")}
              </button>
            )}
            {notifications && (
              <button
                className="al-button"
                disabled={
                  markAllState.isLoading ||
                  query.isFetching ||
                  query.isError ||
                  !rows.some((row) => row.read === false)
                }
                onClick={() => markAllRead()}
              >
                {w("Mark all read")}
              </button>
            )}
            <button
              className="al-button"
              disabled={!rows.length || query.isError || query.isFetching}
              onClick={exportRows}
            >
              <Download size={16} />
              {w(resource === "users" ? "Export CSV" : "Export JSON")}
            </button>
            <button
              className="al-button"
              disabled={query.isFetching}
              onClick={query.refetch}
            >
              <RefreshCw size={16} />
              {w("Refresh")}
            </button>
          </div>
        )}
      </div>
      {!supported ? (
        <section className="al-card">
          <h2>
            {w(title)} {w("is unavailable")}
          </h2>
          <p>
            {w("The backend does not currently provide")}{" "}
            {w(title.toLowerCase())} {w("endpoints.")}
          </p>
        </section>
      ) : (
        <>
          {!query.isFetching && (
            <QueryNotice query={query} label={title.toLowerCase()} />
          )}
          {["posts", "comments"].includes(resource) && (
            <p className="al-data-note">
              {w("The API permits editing and deleting your own content only.")}
            </p>
          )}
          {(markState.isError || markAllState.isError) && (
            <p className="al-alert" role="alert">
              {w("Could not update notifications. Please try again.")}
            </p>
          )}
          <section className="al-card">
            {resource === "users" && <div className="um-filters">{[["Role", userRole, setUserRole, [...new Set(sourceRows.map(roleOf).filter(Boolean))]], ["Status", userStatus, setUserStatus, [...new Set(sourceRows.map(row => row.status).filter(value => typeof value === "string"))]]].map(([label,value,setValue,options]) => <label key={label}>{w(label)}<select value={value} onChange={event => {setValue(event.target.value);setPage(0);}}><option value="">{w("All")}</option>{options.map(option => <option key={option} value={option}>{w(option)}</option>)}</select></label>)}<label>{w("Joined Date")}<select value={joinedDays} onChange={event => {setJoinedDays(event.target.value);setPage(0);}}><option value="">{w("All time")}</option><option value="7">{w("Last 7 days")}</option><option value="30">{w("Last 30 days")}</option></select></label></div>}
            <label className="al-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder={
                  serverSearchable
                    ? w("Search {{value0}}\u2026", {
                        value0: w(title.toLowerCase()),
                      })
                    : w("Filter loaded {{value0}}\u2026", {
                        value0: w(title.toLowerCase()),
                      })
                }
                aria-label={w("Search {{value0}}", {
                  value0: w(title),
                })}
              />
            </label>
            {query.isFetching ||
            (serverSearchable && search.trim() !== serverSearch) ? (
              <AdminLoading
                label={title.toLowerCase()}
                compact={Boolean(data)}
              />
            ) : (
              <p className="al-data-note">
                {rows.length} {w("loaded records")}
                {data?.total != null
                  ? w(" \xB7 {{value0}} total", {
                      value0: data.total,
                    })
                  : ""}
              </p>
            )}
            {!query.isError && data && (
              <>
                <div className="al-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          {resource === "users" ? w("Name") : "Title / Name"}
                        </th>
                        <th>
                          {resource === "leaderboard"
                            ? w("Reputation")
                            : w("Details")}
                        </th>
                        {resource === "users" && <><th>{w("Role")}</th><th>{w("Status")}</th></>}
                        <th>{w("Created")}</th>
                        <th>{w("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row, index) => (
                        <tr key={row.id ?? index}>
                          <td>
                            {(resource === "locations" ? [row.building, row.floor, row.room].filter(Boolean).join(", ") : null) ||
                            row.title ||
                              row.displayName ||
                              row.name ||
                              row.tagName ||
                              row.text ||
                              row.body ||
                              w("Record {{value0}}", {
                                value0: row.id ?? index + 1,
                              })}
                          </td>
                          <td>
                            {resource === "leaderboard"
                              ? (row.reputation ?? "—")
                              : notifications
                                ? row.read
                                  ? w("Read")
                                  : w("Unread")
                                : row.email ||
                                  row.status ||
                                  row.userDisplayName ||
                                  row.ownerDisplayName ||
                                  "—"}
                          </td>
                          {resource === "users" && <><td>{roleOf(row) || "—"}</td><td>{w(row.status || "Unknown")}</td></>}
                          <td>{dateOf(row)?.toLocaleDateString() || "—"}</td>
                          <td>
                            <div className="al-actions">
                              <button
                                className="al-button"
                                onClick={() => setSelected(row)}
                              >
                                {w("View")}
                              </button>
                              {["posts", "comments", "tags"].includes(
                                resource,
                              ) &&
                                canEdit(row) && (
                                  <button
                                    className="al-button"
                                    onClick={() =>
                                      setEditing({
                                        action: "update",
                                        record: row,
                                      })
                                    }
                                  >
                                    {w("Edit")}
                                  </button>
                                )}
                              {(resource === "users" ||
                                (["posts", "comments", "tags"].includes(
                                  resource,
                                ) &&
                                  canEdit(row))) && (
                                <button
                                  className="al-button"
                                  onClick={() =>
                                    setEditing({
                                      action: "delete",
                                      record: row,
                                    })
                                  }
                                >
                                  {w("Delete")}
                                </button>
                              )}
                              {notifications && row.read === false && (
                                <button
                                  className="al-button"
                                  disabled={
                                    markState.isLoading ||
                                    markAllState.isLoading
                                  }
                                  onClick={() => markRead(row.id)}
                                >
                                  {w("Mark read")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!rows.length && (
                  <p className="al-empty">
                    {search
                      ? w("No records match your search.")
                      : w("No records returned.")}
                  </p>
                )}
              </>
            )}
            <div className="al-pagination">
              <button
                className="al-button"
                disabled={current === 0 || query.isFetching}
                onClick={() => setPage(current - 1)}
              >
                {w("Previous")}
              </button>
              <span>
                {w("Page")} {current + 1}
                {data
                  ? w(" of {{value0}}", {
                      value0: pages,
                    })
                  : ""}
              </span>
              <button
                className="al-button"
                disabled={!data || current + 1 >= pages || query.isFetching}
                onClick={() => setPage(current + 1)}
              >
                {w("Next")}
              </button>
            </div>
          </section>
        </>
      )}
      {editing && (
        <ManageDialog
          resource={resource}
          {...editing}
          onClose={() => {
            setEditing(null);
            setSelected(null);
          }}
        />
      )}
      {selected && (
        <dialog open className="al-detail" aria-labelledby="record-title">
          <h2 id="record-title">{w("Record details")}</h2>
          <dl className="al-record-fields">{Object.entries(selected).map(([key, value]) => <div key={key}><dt>{w(key.replace(/([A-Z])/g, " $1"))}</dt><dd>{value == null ? "—" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</dd></div>)}</dl>
          {resource === "lost-found" && (
            <ReportRelated key={selected.id} report={selected} />
          )}
          <button className="al-button" onClick={() => setSelected(null)}>
            {w("Close")}
          </button>
        </dialog>
      )}
    </>
  );
}
