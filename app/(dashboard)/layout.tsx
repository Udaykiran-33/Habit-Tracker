import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import SessionWrapper from "@/components/providers/SessionWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionWrapper>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:ml-60 min-h-screen overflow-x-hidden pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </SessionWrapper>
  );
}
