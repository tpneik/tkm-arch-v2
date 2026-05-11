"use client";

import { useState, useEffect } from "react";
import {
  fetchProjects,
  fetchBlogs,
  fetchProjectCategories,
  fetchBlogCategories,
} from "@/data/queries";
import type { Project } from "@/data/projects";
import type { Blog } from "@/data/blogs";
import type { Category } from "@/data/categories";

/* ──────────────────── Projects ──────────────────── */

/**
 * Hook to fetch all projects from MongoDB.
 * Returns { projects, loading }.
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProjects().then((data) => {
      if (!cancelled) {
        setProjects(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading };
}

/* ──────────────────── Blogs ──────────────────── */

/**
 * Hook to fetch all blogs from MongoDB.
 * Returns { blogs, loading }.
 */
export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBlogs().then((data) => {
      if (!cancelled) {
        setBlogs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { blogs, loading };
}

/* ──────────────────── Categories ──────────────────── */

/**
 * Hook to fetch project categories from MongoDB.
 * Returns { categories, loading }.
 */
export function useProjectCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProjectCategories().then((data) => {
      if (!cancelled) {
        setCategories(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}

/**
 * Hook to fetch blog categories from MongoDB.
 * Returns { categories, loading }.
 */
export function useBlogCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBlogCategories().then((data) => {
      if (!cancelled) {
        setCategories(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
