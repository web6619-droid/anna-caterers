"use server";

import { revalidatePath } from "next/cache";

export async function revalidateServices() {
  try {
    revalidatePath("/");
    revalidatePath("/services");
  } catch (error) {
    console.error("Failed to trigger Next.js cache revalidation:", error);
  }
}
