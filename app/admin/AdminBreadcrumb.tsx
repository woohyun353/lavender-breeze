"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  exhibitions: "전시 목록",
  new: "새로 만들기",
  rooms: "전시실",
  posts: "포스트",
  gallery: "갤러리",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items: { href: string; label: string }[] = [];
  let href = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;
    const label =
      SEGMENT_LABELS[seg] ??
      (seg === "admin" ? "Admin" : /^[0-9a-f-]{36}$/i.test(seg) ? "상세" : seg);
    items.push({ href, label });
  }

  if (items.length === 0) {
    return (
      <nav className="text-sm text-neutral-500">
        <Link href="/admin" className="hover:text-neutral-700">
          Admin
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-neutral-600">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-400">/</span>}
          {i === items.length - 1 ? (
            <span className="font-medium text-neutral-800">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-neutral-900 hover:underline">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
