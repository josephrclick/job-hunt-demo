import AuthenticatedLayoutConstrained from "@/components/authenticated-layout-constrained";

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayoutConstrained>{children}</AuthenticatedLayoutConstrained>;
}
