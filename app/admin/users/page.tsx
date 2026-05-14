"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  UserPlus,
  UserMinus,
  Clock,
  Search,
  RefreshCw,
  X,
} from "lucide-react";
import {
  getAdminUsers,
  getPendingUsers,
  grantAdmin,
  revokeAdmin,
} from "../actions/users";
import type { AdminUser } from "../actions/users";

export default function AdminUsersPage() {
  const { user: currentUser } = useUser();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchPending, setSearchPending] = useState("");
  // Inline confirmation state: holds userId being confirmed for revoke
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminList, pendingList] = await Promise.all([
        getAdminUsers(),
        getPendingUsers(),
      ]);
      setAdmins(adminList);
      setPending(pendingList);
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleGrant = async (userId: string, email: string) => {
    setActionLoading(userId);
    setError(null);
    const result = await grantAdmin(userId);
    if (result.success) {
      setSuccessMsg(`Đã cấp quyền admin cho ${email}`);
      await loadUsers();
    } else {
      setError(result.error || "Thao tác thất bại");
    }
    setActionLoading(null);
  };

  const handleRevokeConfirm = async (userId: string, email: string) => {
    setConfirmRevoke(null);
    setActionLoading(userId);
    setError(null);
    const result = await revokeAdmin(userId);
    if (result.success) {
      setSuccessMsg(`Đã xóa quyền admin của ${email}`);
      await loadUsers();
    } else {
      setError(result.error || "Thao tác thất bại");
    }
    setActionLoading(null);
  };

  const filteredPending = pending.filter((u) => {
    if (!searchPending) return true;
    const q = searchPending.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q))
    );
  });

  const isSelf = (userId: string) => currentUser?.id === userId;

  if (loading) {
    return (
      <div className="um-loading">
        <div className="um-spinner" />
        <p>Đang tải danh sách...</p>
      </div>
    );
  }

  return (
    <div className="um-page">
      {/* Page header */}
      <div className="um-header">
        <div className="um-header-info">
          <h1 className="um-title">
            <Shield />
            Quản lý quản trị viên
          </h1>
          <p className="um-subtitle">
            Cấp hoặc thu hồi quyền quản trị cho người dùng
          </p>
        </div>
        <button
          className="dnd-btn dnd-btn-ghost"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Toast messages */}
      {error && (
        <div className="um-toast um-toast-error">
          <ShieldX size={16} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="um-toast um-toast-success">
          <ShieldCheck size={16} />
          {successMsg}
        </div>
      )}

      {/* ── Section 1: Current Admins ── */}
      <section className="um-section">
        <div className="um-section-header">
          <h2 className="um-section-title">
            <ShieldCheck size={18} />
            Quản trị viên hiện tại
          </h2>
          <span className="um-count">{admins.length}</span>
        </div>

        {admins.length === 0 ? (
          <div className="dnd-empty">Chưa có quản trị viên nào</div>
        ) : (
          <div className="um-list">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className={`um-user-row${isSelf(admin.id) ? " um-user-self" : ""}`}
              >
                <div className="um-user-avatar">
                  {admin.imageUrl ? (
                    <img src={admin.imageUrl} alt="" className="um-avatar-img" />
                  ) : (
                    <div className="um-avatar-fallback">
                      {(admin.fullName?.[0] || admin.email[0] || "?").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="um-user-info">
                  <div className="um-user-name">
                    {admin.fullName || "—"}
                    {isSelf(admin.id) && (
                      <span className="um-badge um-badge-self">Bạn</span>
                    )}
                  </div>
                  <div className="um-user-email">{admin.email}</div>
                </div>
                <div className="um-user-meta">
                  <span className="um-badge um-badge-admin">Admin</span>
                </div>
                <div className="um-user-actions">
                  {isSelf(admin.id) ? (
                    <button
                      className="dnd-btn dnd-btn-ghost"
                      disabled
                      title="Không thể xóa quyền của chính mình"
                    >
                      <UserMinus size={14} />
                      Xóa quyền
                    </button>
                  ) : confirmRevoke === admin.id ? (
                    /* Inline confirmation buttons */
                    <div className="um-confirm-group">
                      <button
                        className="dnd-btn um-btn-revoke"
                        onClick={() =>
                          handleRevokeConfirm(admin.id, admin.email)
                        }
                        disabled={actionLoading === admin.id}
                      >
                        {actionLoading === admin.id ? (
                          <>
                            <span className="dnd-spinner" />
                            Đang xử lý...
                          </>
                        ) : (
                          "Xác nhận?"
                        )}
                      </button>
                      <button
                        className="dnd-btn dnd-btn-ghost"
                        onClick={() => setConfirmRevoke(null)}
                        disabled={actionLoading === admin.id}
                      >
                        <X size={14} />
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      className="dnd-btn um-btn-revoke"
                      onClick={() => setConfirmRevoke(admin.id)}
                      disabled={actionLoading === admin.id}
                    >
                      <UserMinus size={14} />
                      Xóa quyền
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2: Pending Users ── */}
      <section className="um-section">
        <div className="um-section-header">
          <h2 className="um-section-title">
            <Clock size={18} />
            Người dùng chờ cấp quyền
          </h2>
          <span className="um-count">{pending.length}</span>
        </div>

        {/* Search bar for pending users */}
        {pending.length > 0 && (
          <div className="um-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchPending}
              onChange={(e) => setSearchPending(e.target.value)}
              className="um-search-input"
            />
          </div>
        )}

        {pending.length === 0 ? (
          <div className="dnd-empty">
            Không có người dùng nào đang chờ cấp quyền
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="dnd-empty">
            Không tìm thấy kết quả cho &quot;{searchPending}&quot;
          </div>
        ) : (
          <div className="um-list">
            {filteredPending.map((user) => (
              <div key={user.id} className="um-user-row">
                <div className="um-user-avatar">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="um-avatar-img" />
                  ) : (
                    <div className="um-avatar-fallback">
                      {(user.fullName?.[0] || user.email[0] || "?").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="um-user-info">
                  <div className="um-user-name">{user.fullName || "—"}</div>
                  <div className="um-user-email">{user.email}</div>
                </div>
                <div className="um-user-meta">
                  <span className="um-badge um-badge-pending">Chờ duyệt</span>
                </div>
                <div className="um-user-actions">
                  <button
                    className="dnd-btn um-btn-grant"
                    onClick={() => handleGrant(user.id, user.email)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? (
                      <>
                        <span className="dnd-spinner" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        Cấp quyền
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
