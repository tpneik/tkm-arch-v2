import ProjectForm from "../components/ProjectForm";
import { getProjectCategories } from "../../actions/categories";

export default async function CreateProjectPage() {
  const categories = await getProjectCategories();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ProjectForm initialCategories={categories} />
    </div>
  );
}
