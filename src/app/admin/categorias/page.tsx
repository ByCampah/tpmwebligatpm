import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      tournaments: true
    }
  });

  return <CategoriesClient categories={categories} userRole={session.user.role as string} />;
}
