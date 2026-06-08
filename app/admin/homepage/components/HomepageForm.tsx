"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import MediaManager from "@/app/admin/components/MediaManager";
import {
  updateHomepageSettings,
  type HomepageSettings,
} from "../../actions/settings";

// All homepage images live under this single Cloudflare R2 folder.
const HOMEPAGE_BASE_PREFIX = "TKM/HOMEPAGE";

export default function HomepageForm({
  initialData,
}: {
  initialData: HomepageSettings;
}) {
  const [heroImage, setHeroImage] = useState(initialData.heroImage || "");
  const [serviceImages, setServiceImages] = useState<string[]>(
    initialData.serviceImages || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isDirty =
    heroImage !== (initialData.heroImage || "") ||
    serviceImages.join("|") !== (initialData.serviceImages || []).join("|");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await updateHomepageSettings({ heroImage, serviceImages });
      if (!res.success) throw new Error(res.error);
      // Reflect the saved state as the new baseline.
      initialData.heroImage = heroImage;
      initialData.serviceImages = [...serviceImages];
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--admin-content-text)]">
          Trang chủ
        </h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !isDirty}
          className={[
            "flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm text-sm sm:text-base text-white",
            isDirty && !loading
              ? "bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] cursor-pointer"
              : "bg-[var(--admin-accent)] opacity-30 cursor-not-allowed pointer-events-none",
          ].join(" ")}
        >
          {saved && !isDirty ? <Check size={18} /> : <Save size={18} />}
          {loading ? "Đang lưu..." : saved && !isDirty ? "Đã lưu" : "Lưu"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Hero / cover image */}
        <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <span className="text-2xl">🖼️</span> Ảnh bìa trang chủ
          </h2>
          <p className="text-sm text-[var(--admin-muted)] mb-4 pb-4 border-b border-[var(--admin-border)]">
            Ảnh nền lớn ở đầu trang chủ. Chọn một ảnh làm ảnh bìa.
          </p>
          <MediaManager
            mode="cover"
            basePrefix={HOMEPAGE_BASE_PREFIX}
            categoryLabel="HERO"
            projectName="COVER"
            thumbnail={heroImage}
            onChangeThumbnail={setHeroImage}
          />
        </div>

        {/* Expertise slider images */}
        <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <span className="text-2xl">🎞️</span> Ảnh slider — Chuyên môn hoạt động
          </h2>
          <p className="text-sm text-[var(--admin-muted)] mb-4 pb-4 border-b border-[var(--admin-border)]">
            Các ảnh chạy trong phần &quot;Chuyên môn hoạt động&quot;. Chọn <strong>tối đa 4
            ảnh</strong>; số thứ tự là thứ tự hiển thị. Tải thêm ảnh mới vào đây bất cứ
            lúc nào. Ảnh đang được dùng không xóa được — bỏ chọn trước nếu muốn xóa.
          </p>
          <MediaManager
            mode="gallery"
            showCover={false}
            minImages={0}
            maxImages={4}
            basePrefix={HOMEPAGE_BASE_PREFIX}
            categoryLabel="SERVICES"
            projectName="SLIDER"
            thumbnail=""
            onChangeThumbnail={() => {}}
            gallery={serviceImages}
            onChangeGallery={setServiceImages}
          />
        </div>
      </div>
    </div>
  );
}
