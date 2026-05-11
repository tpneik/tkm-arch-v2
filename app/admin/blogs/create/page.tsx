import BlogForm from "../components/BlogForm";
import { getBlogCategories } from "../../actions/categories";

export default async function CreateBlogPage() {
  const categories = await getBlogCategories();

  return (
    <div className="max-w-5xl mx-auto">
      <BlogForm initialCategories={categories} />
    </div>
  );
}
