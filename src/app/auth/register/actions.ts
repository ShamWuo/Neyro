"use server";

import { createUserWithPassword } from "@/lib/auth-utils";

export async function registerWithCredentials(
  email: string,
  password: string,
  name?: string
) {
  return createUserWithPassword(email, password, name);
}

