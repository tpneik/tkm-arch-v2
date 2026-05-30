import { getBlogs } from "@/lib/getBlogs";
import BlogsClient from "./BlogsClient";

// Server entry: loads blogs from the cached MongoDB loader and hands them to
// the interactive client UI. Data is cached + tagged "blogs", so this is
// static-fast and refreshes on admin save (revalidateTag) without a rebuild.
export default async function BlogsPage() {
  const blogs = await getBlogs();
  return <BlogsClient blogs={blogs} />;
}
