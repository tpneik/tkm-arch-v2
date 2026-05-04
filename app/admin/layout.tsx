"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tags,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>TKM Admin</title>
        <meta name="description" content="Admin panel for TKM Group" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="admin-body">
        {/* ── Inline Styles ── */}
        <style>{`
          :root {
            --admin-bg: #0F1117;
            --admin-surface: #1A1D26;
            --admin-surface-hover: #22252F;
            --admin-border: #2A2D36;
            --admin-text: #E4E5E9;
            --admin-muted: #8B8D97;
            --admin-accent: #3B82F6;
            --admin-accent-hover: #2563EB;
            /* Unified dark mode for main content */
            --admin-content-bg: #090A0F;
            --admin-content-text: #E4E5E9;
            --admin-card-bg: #1A1D26;
            --admin-card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --admin-sidebar-w: 260px;
            --admin-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
            
            /* Aliases used in project pages */
            --admin-primary: var(--admin-accent);
            --admin-card: var(--admin-card-bg);
            --admin-text-muted: var(--admin-muted);
            --admin-danger: #EF4444;
          }

          .admin-body {
            margin: 0;
            padding: 0;
            font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
            background: var(--admin-content-bg);
            color: var(--admin-content-text);
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }

          .admin-shell {
            display: flex;
            min-height: 100vh;
          }

          /* ── Sidebar ── */
          .admin-sidebar {
            background: var(--admin-bg);
            border-right: 1px solid var(--admin-border);
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--admin-sidebar-w);
            z-index: 40;
            transition: transform var(--admin-transition);
          }

          .admin-sidebar-header {
            padding: 24px 20px;
            border-bottom: 1px solid var(--admin-border);
          }

          .admin-user-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .admin-avatar {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--admin-accent), #8B5CF6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 15px;
            flex-shrink: 0;
            user-select: none;
          }

          .admin-user-details {
            min-width: 0;
          }

          .admin-user-name {
            color: var(--admin-text);
            font-weight: 600;
            font-size: 14px;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .admin-user-role {
            color: var(--admin-muted);
            font-size: 12px;
            margin-top: 2px;
          }

          /* ── Navigation ── */
          .admin-nav {
            flex: 1;
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
          }

          .admin-nav-section {
            color: var(--admin-muted);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 12px 12px 6px;
          }

          .admin-nav-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            color: var(--admin-muted);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all var(--admin-transition);
            cursor: pointer;
            position: relative;
          }

          .admin-nav-link:hover {
            background: var(--admin-surface);
            color: var(--admin-text);
          }

          .admin-nav-link.active {
            background: var(--admin-accent);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }

          .admin-nav-link svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }

          /* ── Sidebar Footer ── */
          .admin-sidebar-footer {
            padding: 12px;
            border-top: 1px solid var(--admin-border);
          }

          .admin-logout-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            color: #F87171;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            transition: all var(--admin-transition);
            font-family: inherit;
          }

          .admin-logout-btn:hover {
            background: rgba(248, 113, 113, 0.1);
            color: #EF4444;
          }

          .admin-logout-btn svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }

          /* ── Main Content ── */
          .admin-main {
            flex: 1;
            margin-left: var(--admin-sidebar-w);
            padding: 32px;
            min-height: 100vh;
          }

          /* ── Mobile hamburger ── */
          .admin-hamburger {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 50;
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: var(--admin-bg);
            border: 1px solid var(--admin-border);
            color: var(--admin-text);
            cursor: pointer;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all var(--admin-transition);
          }

          .admin-hamburger:hover {
            background: var(--admin-surface);
          }

          .admin-hamburger svg {
            width: 20px;
            height: 20px;
          }

          .admin-hamburger.hidden {
            display: none !important;
          }

          /* ── Mobile Overlay ── */
          .admin-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 35;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            opacity: 0;
            transition: opacity var(--admin-transition);
            pointer-events: none;
          }

          .admin-overlay.visible {
            display: block;
            opacity: 1;
            pointer-events: auto;
          }

          /* ── Mobile Close Button ── */
          .admin-sidebar-close {
            display: none;
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: transparent;
            border: 1px solid var(--admin-border);
            color: var(--admin-muted);
            cursor: pointer;
            align-items: center;
            justify-content: center;
            transition: all var(--admin-transition);
          }

          .admin-sidebar-close:hover {
            color: var(--admin-text);
            background: var(--admin-surface);
          }

          .admin-sidebar-close svg {
            width: 16px;
            height: 16px;
          }

          /* ── Mobile Responsive ── */
          @media (max-width: 768px) {
            .admin-sidebar {
              transform: translateX(-100%);
            }

            .admin-sidebar.open {
              transform: translateX(0);
              box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
            }

            .admin-main {
              margin-left: 0;
              padding: 20px 16px;
              padding-top: 72px;
              overflow-x: hidden;
              max-width: 100vw;
            }

            .admin-hamburger {
              display: flex;
            }

            .admin-sidebar-close {
              display: flex;
            }
          }

          /* ── Tablet ── */
          @media (min-width: 769px) and (max-width: 1024px) {
            :root {
              --admin-sidebar-w: 220px;
            }
            .admin-main {
              padding: 24px;
            }
          }
        `}</style>

        <div className="admin-shell">
          {/* Hamburger (mobile) */}
          <button
            className={`admin-hamburger${sidebarOpen ? " hidden" : ""}`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          {/* Overlay (mobile) */}
          <div
            className={`admin-overlay${sidebarOpen ? " visible" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

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
                <div className="admin-avatar">A</div>
                <div className="admin-user-details">
                  <div className="admin-user-name">Admin User</div>
                  <div className="admin-user-role">Administrator</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="admin-nav">
              <div className="admin-nav-section">Menu</div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link${isActive(item.href) ? " active" : ""}`}
                >
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="admin-sidebar-footer">
              <button className="admin-logout-btn" onClick={() => {}}>
                <LogOut />
                Đăng xuất
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
