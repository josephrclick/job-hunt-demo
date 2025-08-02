import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/dashboard"}>Dashboard</Link>
            <div className="flex items-center gap-4 text-sm font-normal">
              <Link
                href={"/jobs"}
                className="hover:text-foreground/80 transition-colors"
              >
                Jobs
              </Link>
              <Link
                href={"/new"}
                className="hover:text-foreground/80 transition-colors"
              >
                Notes & Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
      <div className="flex-1 w-full">
        {children}
      </div>
    </main>
  );
}
