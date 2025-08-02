import Link from "next/link";
import { Home, Briefcase, FileText } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="h-screen w-16 border-r flex flex-col items-center py-4 bg-background/75 backdrop-blur-lg">
      <nav className="flex flex-col gap-6 items-center text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground" title="Dashboard">
          <Home className="w-5 h-5" />
        </Link>
        <Link href="/jobs" className="hover:text-foreground" title="Jobs">
          <Briefcase className="w-5 h-5" />
        </Link>
        <Link href="/new" className="hover:text-foreground" title="Notes & Docs">
          <FileText className="w-5 h-5" />
        </Link>
      </nav>
    </aside>
  );
} 