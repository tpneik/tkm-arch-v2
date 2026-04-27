export default function AdminDashboard() {
  const stats = [
    { label: "Tổng dự án", value: "43", icon: "📂", color: "#3B82F6" },
    { label: "Tổng bài viết", value: "12", icon: "📝", color: "#8B5CF6" },
    { label: "Đã xuất bản", value: "38", icon: "✅", color: "#10B981" },
    { label: "Bản nháp", value: "17", icon: "📋", color: "#F59E0B" },
  ];

  const recentActivity = [
    { action: "Cập nhật dự án", detail: "Chung cư Hà Đô Centrosa Garden", time: "2 giờ trước" },
    { action: "Thêm bài viết mới", detail: "Xu hướng thiết kế nội thất 2026", time: "5 giờ trước" },
    { action: "Xuất bản dự án", detail: "Villa Thảo Điền", time: "1 ngày trước" },
    { action: "Chỉnh sửa bài viết", detail: "Kiến trúc xanh bền vững", time: "2 ngày trước" },
    { action: "Thêm dự án mới", detail: "Trường học Quốc tế ABC", time: "3 ngày trước" },
  ];

  return (
    <>
      <style>{`
        .dash-header {
          margin-bottom: 32px;
        }
        .dash-greeting {
          font-size: 24px;
          font-weight: 700;
          color: #1A1D26;
          margin: 0 0 6px 0;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
        }
        .dash-subtitle {
          font-size: 14px;
          color: #8B8D97;
          margin: 0;
        }

        /* Stats Grid */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .dash-stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          border: 1px solid #F0F1F3;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }

        .dash-stat-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .dash-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 12px;
        }

        .dash-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1A1D26;
          line-height: 1;
          margin-bottom: 4px;
        }

        .dash-stat-label {
          font-size: 13px;
          color: #8B8D97;
          font-weight: 500;
        }

        /* Recent Activity */
        .dash-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1A1D26;
          margin: 0 0 16px 0;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
        }

        .dash-activity {
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          border: 1px solid #F0F1F3;
          overflow: hidden;
        }

        .dash-activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #F5F5F7;
          transition: background 150ms ease;
        }

        .dash-activity-item:last-child {
          border-bottom: none;
        }

        .dash-activity-item:hover {
          background: #FAFBFC;
        }

        .dash-activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3B82F6;
          flex-shrink: 0;
          margin-right: 14px;
        }

        .dash-activity-content {
          flex: 1;
          min-width: 0;
        }

        .dash-activity-action {
          font-size: 13px;
          font-weight: 600;
          color: #1A1D26;
          margin-bottom: 2px;
        }

        .dash-activity-detail {
          font-size: 13px;
          color: #8B8D97;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-activity-time {
          font-size: 12px;
          color: #B0B3BA;
          flex-shrink: 0;
          margin-left: 16px;
          white-space: nowrap;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dash-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .dash-stats {
            grid-template-columns: 1fr;
          }
          .dash-greeting {
            font-size: 20px;
          }
          .dash-stat-value {
            font-size: 24px;
          }
          .dash-activity-item {
            flex-wrap: wrap;
            gap: 4px;
          }
          .dash-activity-time {
            margin-left: 22px;
            width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header">
        <h1 className="dash-greeting">Xin chào, Admin 👋</h1>
        <p className="dash-subtitle">Tổng quan hệ thống quản trị TKM Group</p>
      </div>

      {/* Stats Cards */}
      <div className="dash-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dash-stat-card">
            <div
              className="dash-stat-icon"
              style={{ background: `${stat.color}15` }}
            >
              {stat.icon}
            </div>
            <div className="dash-stat-value">{stat.value}</div>
            <div className="dash-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="dash-section-title">Hoạt động gần đây</h2>
      <div className="dash-activity">
        {recentActivity.map((item, i) => (
          <div key={i} className="dash-activity-item">
            <div className="dash-activity-dot" />
            <div className="dash-activity-content">
              <div className="dash-activity-action">{item.action}</div>
              <div className="dash-activity-detail">{item.detail}</div>
            </div>
            <div className="dash-activity-time">{item.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
