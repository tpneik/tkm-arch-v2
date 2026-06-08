import { getHomepageSettings } from "../actions/settings";
import HomepageForm from "./components/HomepageForm";

export default async function HomepageAdminPage() {
  const settings = await getHomepageSettings();
  return <HomepageForm initialData={settings} />;
}
