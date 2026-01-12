import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect to inbox - inbox is now the home page
  redirect("/inbox");
}
