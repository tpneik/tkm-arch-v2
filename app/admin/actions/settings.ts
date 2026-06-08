"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import SettingsModel from "@/models/Settings";

/** Key of the homepage singleton settings document. */
const HOMEPAGE_KEY = "homepage";

export interface HomepageSettings {
  heroImage: string;
  serviceImages: string[];
}

/** Read the homepage settings for the admin form (empty when unset). */
export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    await connectToDatabase();
    const doc: any = await SettingsModel.findOne({ key: HOMEPAGE_KEY }).lean();
    return {
      heroImage: doc?.heroImage || "",
      serviceImages: Array.isArray(doc?.serviceImages) ? doc.serviceImages : [],
    };
  } catch (error) {
    console.error("Failed to fetch homepage settings:", error);
    return { heroImage: "", serviceImages: [] };
  }
}

/** Upsert the homepage settings and bust the public homepage cache. */
export async function updateHomepageSettings(
  data: HomepageSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    await SettingsModel.findOneAndUpdate(
      { key: HOMEPAGE_KEY },
      {
        $set: {
          heroImage: data.heroImage || "",
          serviceImages: (data.serviceImages || []).filter(Boolean),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    revalidateTag("homepage", "max"); // bust the cached public loader (@/lib/getHomepage)
    revalidatePath("/admin/homepage");
    revalidatePath("/en");
    revalidatePath("/vi");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update homepage settings:", error);
    return { success: false, error: error.message || "Failed to save homepage settings" };
  }
}
