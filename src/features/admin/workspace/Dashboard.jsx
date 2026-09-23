import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import AdminLoading from "./AdminLoading";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  ShieldAlert,
  RefreshCw,
  Activity,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { useAdminResourceQuery } from "./liveApi";
import "./dashboard.css";
export function QueryNotice({ query, label }) {
  const { w } = useWorkspaceTranslation();
  if (query.isFetching)
    return <AdminLoading label={label} compact={Boolean(query.data)} />;
  if (!query.isError) return null;
  const status = query.error?.status;
  return (
    <div className="al-alert" role="alert">
      <strong>
        {w("Could not load")} {w(label)}.
      </strong>{" "}
      {status === 401 || status === 403
        ? w("The API did not authorize this account.")
        : w(
            "The service may be unavailable or its response format unsupported.",
          )}{" "}
      <button onClick={query.refetch}>{w("Try again")}</button>
    </div>
  );
}
export const dateOf = (row) => {
  const value = row.creationDate || row.createdAt || row.joinedAt;
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
};
const palette = ["#0050f3", "#4caf50", "#ef2929", "#f59e0b", "#8b5cf6"];
function Empty({ children }) {
  return <div className="al-empty">{children}</div>;
}
function Growth({ rows }) {
  const { w, locale } = useWorkspaceTranslation();
  const dates = rows.map(dateOf).filter(Boolean);
  if (!dates.length)
    return <Empty>{w("No registration dates are available.")}</Empty>;
  const now = new Date();
  const points = Array.from(
    {
      length: 7,
    },
    (_, i) => {
      const end = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        label: new Date(
          now.getFullYear(),
          now.getMonth() - 6 + i,
          1,
        ).toLocaleDateString(locale, {
          month: "short",
        }),
        value: dates.filter((d) => d < end).length,
      };
    },
  );
  const max = Math.max(4, ...points.map((p) => p.value));
  const coordinates = points
    .map((p, i) => `${45 + i * 100},${210 - (p.value / max) * 180}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 670 250"
      className="al-growth"
      role="img"
      aria-label="Cumulative registrations among loaded users over seven months"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            x1="45"
            x2="645"
            y1={210 - i * 45}
            y2={210 - i * 45}
            stroke="#e7ecf4"
            strokeDasharray="3 3"
          />
          <text x="35" y={214 - i * 45} textAnchor="end">
            {Math.round((max * i) / 4)}
          </text>
        </g>
      ))}
      <polygon points={`45,210 ${coordinates} 645,210`} fill="#edf4ff" />
      <polyline
        points={coordinates}
        fill="none"
        stroke="#0050f3"
        strokeWidth="2"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={45 + i * 100}
            cy={210 - (p.value / max) * 180}
            r="3"
            fill="#0050f3"
          >
            <title>
              {p.label}: {p.value} {w("users")}
            </title>
          </circle>
          <text x={45 + i * 100} y="238" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
export default function Dashboard() {
  const { w, locale } = useWorkspaceTranslation();
  const users = useAdminResourceQuery("users");
  const posts = useAdminResourceQuery("posts");
  const reports = useAdminResourceQuery("lost-found");
  const commentQuery = useAdminResourceQuery("comments");
  const userRows = users.data?.rows || [];
  const postRows = posts.data?.rows || [];
  const reportRows = reports.data?.rows || [];
  const categories = Object.entries(
    postRows.reduce((out, post) => {
      const names = post.tagResponses?.length
        ? post.tagResponses.map((tag) => tag.tagName)
        : ["Untagged"];
      names.forEach((name) => {
        out[name] = (out[name] || 0) + 1;
      });
      return out;
    }, Object.create(null)),
  );
  const tagTotal = categories.reduce((sum, [, count]) => sum + count, 0);
  const activeDates = userRows.map((user) =>
    user.lastAccessDate ? new Date(user.lastAccessDate).getTime() : NaN,
  );
  const hasActivity = userRows.length > 0 && activeDates.every(Number.isFinite);
  const [now] = useState(() => Date.now());
  const activeUsers = hasActivity
    ? activeDates.filter((date) => date <= now && date >= now - 30 * 86400000)
        .length
    : null;
  let running = 0;
  const stops = categories
    .map(([, count], i) => {
      const start = running;
      running += (count / tagTotal) * 100;
      return `${palette[i % palette.length]} ${start}% ${running}%`;
    })
    .join(",");
  const champions = Object.values(
    postRows.reduce((out, p) => {
      const id = p.ownerId || p.author?.id;
      if (!id) return out;
      out[id] ??= {
        id,
        name: p.ownerDisplayName || p.author?.name || `User ${id}`,
        count: 0,
      };
      out[id].count++;
      return out;
    }, Object.create(null)),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const pending = reportRows.filter((r) =>
    ["PENDING", "OPEN"].includes(String(r.status).toUpperCase()),
  ).length;
  const statusesAvailable =
    Boolean(reports.data) &&
    reportRows.every((r) => typeof r.status === "string");
  const stats = [
    [
      "Total Users",
      users.data?.total ?? userRows.length,
      Users,
      users,
      users.data?.total != null
        ? "Across your community"
        : "Members in this overview",
    ],
    [
      "Active Users",
      activeUsers,
      Activity,
      users,
      "Loaded users seen in the last 30 days",
    ],
    [
      "Total Posts",
      posts.data?.total ?? postRows.length,
      FileText,
      posts,
      posts.data?.total != null
        ? "Across your community"
        : "Posts in this overview",
    ],
    [
      "Pending Reports",
      statusesAvailable ? pending : null,
      ShieldAlert,
      reports,
      "Open or pending loaded reports",
    ],
  ];
  const datedPosts = postRows.filter((p) => dateOf(p));
  const comments = commentQuery.data?.rows || [];
  const hasComments = Boolean(commentQuery.data) && !commentQuery.isError;
  const activity = Array.from(
    {
      length: 7,
    },
    (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const key = d.toLocaleDateString(locale);
      return {
        label: d.toLocaleDateString(locale, {
          weekday: "short",
        }),
        value: datedPosts.filter(
          (p) => dateOf(p).toLocaleDateString(locale) === key,
        ).length,
        comments: comments.filter(
          (c) => dateOf(c)?.toLocaleDateString() === key,
        ).length,
      };
    },
  );
  const maximum = Math.max(
    1,
    ...activity.flatMap((d) => [d.value, d.comments]),
  );
  if ([users, posts, reports, commentQuery].some((query) => query.isLoading))
    return <AdminLoading label="dashboard" />;
  return (
    <div className="ad-dashboard">
      <div className="ad-eyebrow">
        <span>{w("WORKSPACE OVERVIEW")}</span>
        <span>
          <CalendarDays size={14} />
          {new Date(now).toLocaleDateString(locale, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="al-heading">
        <div>
          <h1>{w("Your community, at a glance.")}</h1>
          <p>
            {w(
              "Track engagement, discover trends, and keep your campus connected.",
            )}
          </p>
        </div>
        <button
          className="al-button"
          disabled={
            users.isFetching ||
            posts.isFetching ||
            reports.isFetching ||
            commentQuery.isFetching
          }
          onClick={() => {
            users.refetch();
            posts.refetch();
            reports.refetch();
            commentQuery.refetch();
          }}
        >
          <RefreshCw
            size={16}
            className={
              users.isFetching ||
              posts.isFetching ||
              reports.isFetching ||
              commentQuery.isFetching
                ? "al-loading-spin"
                : undefined
            }
          />
          {w("Refresh overview")}
        </button>
      </div>
      <div className="al-stats">
        {stats.map(([title, value, Icon, query, note], index) => (
          <article
            className="al-card al-stat"
            key={title}
            style={{
              "--ad-order": index,
              "--ad-accent": ["#4361ee", "#119477", "#8860d0", "#db8a21"][
                index
              ],
            }}
          >
            <div>
              <p>{w(title)}</p>
              <strong>
                {query?.isLoading
                  ? "…"
                  : query?.isError || value === null
                    ? "—"
                    : value.toLocaleString(locale)}
              </strong>
              <small>{w(note)}</small>
            </div>
            <span className="al-stat-icon">
              <Icon size={21} />
            </span>
          </article>
        ))}
      </div>
      <p className="al-data-note">
        {w(
          "Charts reflect loaded records. Unavailable metrics appear as \u2014.",
        )}
      </p>
      <QueryNotice query={users} label={w("users")} />
      <QueryNotice query={posts} label={w("posts")} />
      <QueryNotice query={reports} label={w("reports")} />
      <QueryNotice query={commentQuery} label={w("comments")} />
      <div className="al-panels">
        <section className="al-card al-wide">
          <div className="ad-panel-heading">
            <div>
              <h2>{w("Community growth")}</h2>
              <p>{w("Building a more connected campus")}</p>
            </div>
            <span className="ad-period">{w("7 months")}</span>
          </div>
          {users.data && !users.isError ? (
            <Growth rows={userRows} />
          ) : (
            <Empty>{w("User growth unavailable.")}</Empty>
          )}
          <small>{w("Registrations among loaded users")}</small>
        </section>
        <section className="al-card">
          <div className="ad-panel-heading">
            <div>
              <h2>{w("Content breakdown")}</h2>
              <p>{w("Conversations by topic")}</p>
            </div>
          </div>
          {categories.length && !posts.isError ? (
            <>
              <div
                className="al-donut"
                role="img"
                aria-label={categories
                  .map(([name, count]) => `${name}: ${count}`)
                  .join(", ")}
                style={{
                  background: `conic-gradient(${stops})`,
                }}
              >
                <span>
                  {postRows.length}
                  <small>{w("posts")}</small>
                </span>
              </div>
              <div className="al-legend">
                {categories.map(([name, count], i) => (
                  <span key={name}>
                    <i
                      style={{
                        background: palette[i % palette.length],
                      }}
                    />
                    {name} ({count})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Empty>{w("No tag data available.")}</Empty>
          )}
        </section>
        <section className="al-card al-wide">
          <div className="ad-panel-heading">
            <div>
              <h2>{w("Weekly engagement")}</h2>
              <p>{w("How your community is connecting")}</p>
            </div>
            <span className="ad-period">{w("7 days")}</span>
          </div>
          {(datedPosts.length || comments.length) && !posts.isError ? (
            <div className="al-bars">
              {activity.map((d, i) => (
                <div key={i}>
                  <div className="al-bar-pair">
                    <span
                      style={{
                        height: `${(d.value / maximum) * 170}px`,
                      }}
                      title={w("{{value0}} posts", {
                        value0: d.value,
                      })}
                    />
                    {hasComments && (
                      <span
                        className="al-comment-bar"
                        style={{
                          height: `${(d.comments / maximum) * 170}px`,
                        }}
                        title={w("{{value0}} comments", {
                          value0: d.comments,
                        })}
                      />
                    )}
                  </div>
                  <b>
                    {d.value}
                    {hasComments ? ` / ${d.comments}` : ""}
                  </b>
                  <small>{d.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <Empty>{w("No dated posts available.")}</Empty>
          )}
          <small>
            {w(
              "Last seven days \xB7 Blue: posts \xB7 Light blue: comments \xB7 Loaded records",
            )}
          </small>
        </section>
        <section className="al-card">
          <div className="ad-panel-heading">
            <div>
              <h2>{w("Community contributors")}</h2>
              <p>{w("The people starting conversations")}</p>
            </div>
          </div>
          {champions.length && !posts.isError ? (
            champions.map((c, i) => (
              <div className="al-champion" key={c.id}>
                <span className="al-avatar">{i + 1}</span>
                <div>
                  <strong>{c.name}</strong>
                  <small>{w("Community posts")}</small>
                </div>
                <b>{c.count}</b>
              </div>
            ))
          ) : (
            <Empty>{w("No contributor data available.")}</Empty>
          )}
        </section>
      </div>
      <section className="al-card al-recent">
        <div className="al-heading">
          <h2>{w("Recent Posts")}</h2>
          <Link to="/admin/posts">
            {w("View all posts")} <ArrowUpRight size={15} />
          </Link>
        </div>
        {postRows.length && !posts.isError ? (
          [...postRows]
            .sort(
              (a, b) =>
                (dateOf(b)?.getTime() || 0) - (dateOf(a)?.getTime() || 0),
            )
            .slice(0, 5)
            .map((p, i) => (
              <div className="al-post" key={p.id ?? i}>
                <span className="ad-post-icon">
                  <FileText size={18} />
                </span>
                <div>
                  <strong>{p.title || w("Untitled post")}</strong>
                  <small>
                    {p.ownerDisplayName ||
                      p.author?.name ||
                      w("Unknown author")}{" "}
                    · {dateOf(p)?.toLocaleDateString() || w("Date unavailable")}
                  </small>
                </div>
                <span className="al-badge">
                  {p.status || w("Status unavailable")}
                </span>
              </div>
            ))
        ) : (
          <Empty>{w("No posts to display.")}</Empty>
        )}
      </section>
    </div>
  );
}
