"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminBreadcrumb } from "./AdminBreadcrumb";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-52 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4">
          <Link href="/admin" className="text-lg font-bold text-neutral-900 hover:underline">
            Admin
          </Link>
        </div>
        <nav className="p-3">
          <Link
            href="/admin/exhibitions"
            className="block rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            전시 관리
          </Link>
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-3">
          <AdminBreadcrumb />
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
