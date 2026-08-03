"use server";

import { revalidatePath } from "next/cache";

export async function revalidateServices() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin");
}
