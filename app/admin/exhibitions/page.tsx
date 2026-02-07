"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExhibitionsListPage() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchExhibitions() {
    setLoading(true);
    void supabaseClient
      .from("exhibitions")
      .select("*")
      .order("order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("exhibitions fetch:", error);
          setLoading(false);
          return;
        }
        setExhibitions((data as Exhibition[]) ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
    });
  }, [router]);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("이 전시를 삭제할까요? 하위 전시실·콘텐츠는 별도 확인이 필요할 수 있습니다.")) return;
    setDeletingId(id);
    const { error } = await supabaseClient.from("exhibitions").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      console.error(error);
      return;
    }
    fetchExhibitions();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">전시 목록</h1>
        <Link
          href="/admin/exhibitions/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          새 전시
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : exhibitions.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          등록된 전시가 없습니다. &quot;새 전시&quot;로 추가해 보세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {exhibitions.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <Link
                href={`/admin/exhibitions/${ex.slug ?? ex.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-80"
              >
                {ex.cover_image ? (
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                    <Image
                      src={ex.cover_image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded border border-neutral-200 bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{ex.title}</p>
                  <p className="text-xs text-neutral-500">순서: {ex.order ?? 0}</p>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/exhibitions/${ex.slug ?? ex.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  상세
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(ex.id)}
                  disabled={deletingId === ex.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === ex.id ? "삭제 중…" : "삭제"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
