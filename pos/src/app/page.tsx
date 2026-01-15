import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to products - middleware will handle auth
  redirect("/products");
}
