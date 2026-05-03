"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "../../actions/projects";

export default function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the project: "${title}"?`)) {
      setIsDeleting(true);
      try {
        const result = await deleteProject(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(`Failed to delete: ${result.error}`);
          setIsDeleting(false);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while deleting the project.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)] hover:text-white rounded text-sm transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
