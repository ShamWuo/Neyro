"use server";

import { createUserWithPassword } from "@/lib/auth-utils";

export async function registerWithCredentials(
  email: string,
  password: string,
  name?: string
): Promise<{ user?: { id: string; email: string | null }; error?: string }> {
  try {
    return await createUserWithPassword(email, password, name);
  } catch (error) {
    console.error("Server Action error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

