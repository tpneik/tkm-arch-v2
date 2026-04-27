import { FolderKanban } from "lucide-react";

export default function AdminProjects() {
  return (
    <>
      <style>{`
        .placeholder-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }
        .placeholder-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #3B82F615;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3B82F6;
          margin-bottom: 20px;
        }
        .placeholder-icon svg {
          width: 28px;
          height: 28px;
        }
        .placeholder-title {
          font-size: 20px;
          font-weight: 700;
          color: #1A1D26;
          margin: 0 0 8px 0;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
        }
        .placeholder-desc {
          font-size: 14px;
          color: #8B8D97;
          margin: 0;
          max-width: 360px;
          line-height: 1.5;
        }
        .placeholder-badge {
          margin-top: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #3B82F6;
          background: #3B82F610;
          padding: 6px 14px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="placeholder-container">
        <div className="placeholder-icon">
          <FolderKanban />
        </div>
        <h1 className="placeholder-title">Quản lý dự án</h1>
        <p className="placeholder-desc">
          Trang quản lý dự án đang được phát triển. Bạn sẽ có thể thêm, sửa và xóa các dự án tại đây.
        </p>
        <div className="placeholder-badge">Sắp ra mắt</div>
      </div>
    </>
  );
}
