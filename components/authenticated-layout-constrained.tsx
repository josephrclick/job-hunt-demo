import AuthenticatedLayout from "@/components/authenticated-layout";

export default function AuthenticatedLayoutConstrained({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 flex flex-col gap-20 max-w-5xl mx-auto p-5 w-full">
        {children}
      </div>
    </AuthenticatedLayout>
  );
}