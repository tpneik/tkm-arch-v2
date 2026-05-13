"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

/* ── Context so nested components can read admin state ── */
const AdminAuthContext = createContext({ isAdmin: false, isLoading: true });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/* ── Session cache for admin status (avoid Clerk API call on every nav) ── */
const CACHE_KEY = "tkm_admin_status";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedAdmin(userId: string): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { uid, isAdmin, ts } = JSON.parse(raw);
    if (uid !== userId || Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return isAdmin;
  } catch {
    return null;
  }
}

function setCachedAdmin(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ uid: userId, isAdmin, ts: Date.now() })
    );
  } catch {
    // ignore storage errors
  }
}

/**
 * AdminGate — guards admin routes using Clerk privateMetadata.role.
 *
 * Flow:
 *  1. Wait for Clerk to load the user.
 *  2. Check sessionStorage cache first (avoids API call on every navigation).
 *  3. If cache miss → call /api/auth/check-admin to verify privateMetadata.role === 'admin'.
 *  4. If not admin → show "access denied" UI with sign-out option.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isUserLoaded || !user) return;
    if (checkedRef.current) return;
    checkedRef.current = true;

    // Try cache first
    const cached = getCachedAdmin(user.id);
    if (cached !== null) {
      setIsAdmin(cached);
      setIsLoading(false);
      return;
    }

    // Cache miss — verify with API
    fetch("/api/auth/check-admin")
      .then((res) => {
        const admin = res.ok;
        setIsAdmin(admin);
        setCachedAdmin(user.id, admin);
      })
      .catch(() => {
        setIsAdmin(false);
        setCachedAdmin(user.id, false);
      })
      .finally(() => setIsLoading(false));
  }, [isUserLoaded, user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      sessionStorage.removeItem(CACHE_KEY);
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      window.location.href = "/sign-in";
    }
  };

  /* ── Loading state ── */
  if (!isUserLoaded || isLoading) {
    return (
      <div className="admin-gate-loading">
        <div className="admin-gate-spinner" />
        <p>Đang xác thực...</p>
      </div>
    );
  }

  /* ── No user ── */
  if (!user) {
    return null;
  }

  /* ── Not an admin ── */
  if (!isAdmin) {
    const userEmail =
      user.primaryEmailAddress?.emailAddress || user.fullName || "—";

    return (
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
    );
  }

  /* ── Authorized admin ── */
  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
