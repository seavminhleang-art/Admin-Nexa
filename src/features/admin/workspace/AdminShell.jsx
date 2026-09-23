import BrandLogo from "@/Components/common/BrandLogo";
import { useWorkspaceTranslation } from "@/locales/workspace/useWorkspaceTranslation";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutApiMutation } from "@/features/auth/authApi";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Tags,
  Search,
  ShieldAlert,
  Store,
  Bell,
  Settings,
  LogOut,
  MapPin,
  Inbox,
  Trophy,
  UserRoundPlus,
  X,
} from "lucide-react";
import { logout } from "@/features/auth/authSlice";
import { baseApi } from "@/store/api/baseApi";
import "./admin.css";
import AdminTopbar from "./AdminTopbar";
const sidebarNavigation = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["moderation", "Moderation", ShieldAlert],
  ["locations", "Location", MapPin],
  ["claims", "Claim Log", Inbox],
  ["leaderboard", "Leaderboard", Trophy],
  ["users", "User Management", UserRoundPlus],
  ["settings", "Setting", Settings],
];
export const navigation = [
  ...sidebarNavigation,
  ["posts", "Posts", FileText],
  ["comments", "Comments", MessageSquare],
  ["tags", "Tags", Tags],
  ["lost-found", "Lost & Found", Search],
  ["marketplace", "Marketplace", Store],
  ["notifications", "Notifications", Bell],
];
export default function AdminShell() {
  const { w } = useWorkspaceTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutApiMutation();
  const { pathname } = useLocation();
  const title =
    navigation.find(([key]) => pathname.includes(`/admin/${key}`))?.[1] ||
    "Dashboard";
  const name = user?.displayName || user?.name || "Admin";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  async function exit() {
    setLeaving(true);
    try {
      await logoutApi();
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      navigate("/login", {
        replace: true,
      });
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setLeaving(false);
    }
  }
  return (
    <div
      className={`admin-live ${collapsed ? "is-collapsed" : ""} ${dark ? "al-dark" : ""}`}
    >
      {mobile && (
        <button
          className="al-scrim"
          aria-label={w("Close navigation")}
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`al-sidebar ${mobile ? "is-open" : ""}`}>
        <div className="al-brand">
          <NavLink
            to="/admin/dashboard"
            className="al-wordmark"
            aria-label="NEXA dashboard"
          >
            <BrandLogo alt="NEXA" className="al-brand-image" darkMode={dark} />
          </NavLink>
          <button
            className="al-mobile"
            aria-label={w("Close navigation")}
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav aria-label={w("Admin navigation")}>
          {sidebarNavigation.map(([key, label, Icon]) => (
            <NavLink
              title={label}
              key={key}
              to={`/admin/${key}`}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                isActive || (key === "dashboard" && pathname === "/admin")
                  ? "active"
                  : ""
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="al-label">{w(label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="al-account">
          <button
            className="al-logout"
            disabled={leaving}
            onClick={exit}
            aria-label={w("Log out")}
            title={w("Log out")}
          >
            <span className="al-avatar">
              {user?.avatar || user?.photoURL ? (
                <img src={user.avatar || user.photoURL} alt="" />
              ) : (
                initials
              )}
            </span>
            <span className="al-label">
              {leaving ? w("Logging out\u2026") : w("Log out")}
            </span>
            <LogOut size={17} strokeWidth={1.5} />
          </button>
        </div>
      </aside>
      <div className="al-workspace">
        <AdminTopbar
          title={title}
          navigation={navigation}
          collapsed={collapsed}
          dark={dark}
          onToggleTheme={() => setDark((value) => !value)}
          onToggleSidebar={() =>
            window.matchMedia("(max-width: 767px)").matches
              ? setMobile((value) => !value)
              : setCollapsed((value) => !value)
          }
        />
        <main className="al-main">
          {error && (
            <p role="alert" className="al-alert">
              {w(error)}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
