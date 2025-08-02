import AuthenticatedLayout from "@/components/authenticated-layout";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
} 