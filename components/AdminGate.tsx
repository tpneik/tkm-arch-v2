"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

/* ── Context so nested components can read admin state ── */
const AdminAuthContext = createContext({ isAdmin: false, isLoading: true });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/**
 * AdminGate — guards admin routes using Clerk privateMetadata.role.
 *
 * Flow:
 *  1. Wait for Clerk to load the user.
 *  2. Call /api/auth/check-admin to verify privateMetadata.role === 'admin'.
 *  3. If not admin → show "access denied" UI with sign-out option.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isUserLoaded || !user) return;

    fetch("/api/auth/check-admin")
      .then((res) => {
        setIsAdmin(res.ok); // 200 = admin, 403 = not admin
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, [isUserLoaded, user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      window.location.href = "/sign-in";
    }
  };

  /* ── Loading state ── */
  if (!isUserLoaded || isLoading) {
    return (
      <>
        <style>{adminGateStyles}</style>
        <div className="admin-gate-loading">
          <div className="admin-gate-spinner" />
          <p>Đang xác thực...</p>
        </div>
      </>
    );
  }

  /* ── No user (shouldn't happen — proxy redirects to /sign-in) ── */
  if (!user) {
    return null;
  }

  /* ── Not an admin ── */
  if (!isAdmin) {
    const userEmail =
      user.primaryEmailAddress?.emailAddress || user.fullName || "—";

    return (
      <>
        <style>{adminGateStyles}</style>
        <div className="admin-gate-denied">
          <div className="admin-gate-card">
            {/* Icon */}
            <div className="admin-gate-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#F87171" }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6" />
                <path d="M9 9l6 6" />
              </svg>
            </div>

            <h2>Truy cập bị từ chối</h2>

            <p>Tài khoản của bạn không có quyền truy cập trang quản trị.</p>

            <div className="admin-gate-email">{userEmail}</div>

            <p style={{ fontSize: "13px", marginBottom: "24px" }}>
              Vui lòng liên hệ quản trị viên để được cấp quyền, hoặc đăng nhập
              bằng tài khoản khác.
            </p>

            <div className="admin-gate-actions">
              <a href="/" className="admin-gate-btn admin-gate-btn-secondary">
                Về trang chủ
              </a>

              <button
                className="admin-gate-btn admin-gate-btn-danger"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <span className="admin-gate-btn-spinner" />
                    Đang đăng xuất...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Đăng xuất
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Authorized admin ── */
  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/* ─────────────────── Inline Styles ─────────────────── */
const adminGateStyles = `
  .admin-gate-denied {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0F1117;
    color: #E4E5E9;
    font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  }

  .admin-gate-card {
    background: #1A1D26;
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 16px;
    padding: 40px;
    max-width: 460px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
  }

  .admin-gate-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: rgba(248, 113, 113, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.3);
  }

  .admin-gate-card h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 12px;
    color: #E4E5E9;
  }

  .admin-gate-card p {
    font-size: 14px;
    line-height: 1.6;
    color: #8B8D97;
    margin: 0 0 8px;
  }

  .admin-gate-email {
    display: inline-block;
    background: rgba(59, 130, 246, 0.1);
    color: #60A5FA;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    margin: 12px 0 24px;
    word-break: break-all;
  }

  .admin-gate-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .admin-gate-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }

  .admin-gate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-gate-btn-secondary {
    background: rgba(59, 130, 246, 0.1);
    color: #60A5FA;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .admin-gate-btn-secondary:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.03);
  }

  .admin-gate-btn-danger {
    background: rgba(248, 113, 113, 0.1);
    color: #F87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
  }

  .admin-gate-btn-danger:hover:not(:disabled) {
    background: rgba(248, 113, 113, 0.2);
    transform: scale(1.03);
  }

  .admin-gate-btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(248, 113, 113, 0.3);
    border-top-color: #F87171;
    border-radius: 50%;
    animation: admin-gate-spin 0.6s linear infinite;
  }

  .admin-gate-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0F1117;
    color: #8B8D97;
    font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
    gap: 16px;
  }

  .admin-gate-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #2A2D36;
    border-top-color: #3B82F6;
    border-radius: 50%;
    animation: admin-gate-spin 0.6s linear infinite;
  }

  @keyframes admin-gate-spin {
    to { transform: rotate(360deg); }
  }
`;
