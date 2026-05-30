import { getBlogs } from "@/lib/getBlogs";
import BlogDetailClient from "./BlogDetailClient";

// Server entry: loads blogs from the cached MongoDB loader. The client
// component resolves the current blog (and prev/next/related) from this list
// using the URL params. Cached + tagged "blogs" → fast and auto-fresh.
export default async function BlogDetailPage() {
  const blogs = await getBlogs();
  return <BlogDetailClient blogs={blogs} />;
}
