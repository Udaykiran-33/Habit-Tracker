import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UrHabit Admin",
  description: "Admin portal for managing UrHabit feedback",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
