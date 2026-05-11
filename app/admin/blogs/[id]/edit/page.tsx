import { notFound } from "next/navigation";
import { getBlogById } from "../../../actions/blogs";
import { getBlogCategories } from "../../../actions/categories";
import BlogForm from "../../components/BlogForm";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [blog, categories] = await Promise.all([
    getBlogById(id),
    getBlogCategories(),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <BlogForm initialData={blog} initialCategories={categories} />
    </div>
  );
}
