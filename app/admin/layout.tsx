"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import {
  FolderKanban,
  FileText,
  Tags,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../globals.css";
import AdminGate from "@/components/AdminGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Quản trị viên", icon: Users },
] as const;

/* ── Memoized nav link to avoid re-renders ── */
const NavLink = memo(function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`admin-nav-link${active ? " active" : ""}`}
    >
      <Icon />
      {label}
    </Link>
  );
});

function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar overlay is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/admin") return pathname === "/admin";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleSignOut = useCallback(() => {
    signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  // Get user display info
  const userName = user?.fullName || user?.firstName || "Admin";
  const userInitial = (user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "A").toUpperCase();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="admin-shell">
      {/* Hamburger (mobile) */}
      {!sidebarOpen && (
        <button
          className="admin-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
      )}

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="admin-overlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Close button (mobile) */}
        <button
          className="admin-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X />
        </button>

        {/* User Info */}
        <div className="admin-sidebar-header">
          <div className="admin-user-info">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={userName}
                className="admin-avatar-img"
              />
            ) : (
              <div className="admin-avatar">{userInitial}</div>
            )}
            <div className="admin-user-details">
              <div className="admin-user-name">{userName}</div>
              <div className="admin-user-role" title={userEmail}>
                {userEmail || "Administrator"}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <div className="admin-nav-section">Menu</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="admin-sidebar-footer">
          <button
            className="admin-logout-btn"
            onClick={handleSignOut}
          >
            <LogOut />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <title>TKM Admin</title>
          <meta name="description" content="Admin panel for TKM Group" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/admin.css" />
        </head>
        <body className="admin-body">
          <AdminGate>
            <AdminSidebar>{children}</AdminSidebar>
          </AdminGate>
        </body>
      </html>
    </ClerkProvider>
  );
}
