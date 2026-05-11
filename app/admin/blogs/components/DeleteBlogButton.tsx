"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBlog } from "../../actions/blogs";

export default function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the blog: "${title}"?`)) {
      setIsDeleting(true);
      try {
        const result = await deleteBlog(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(`Failed to delete: ${result.error}`);
          setIsDeleting(false);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while deleting the blog.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full md:w-auto px-3 py-2 md:py-1 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)] hover:text-white rounded text-sm transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
