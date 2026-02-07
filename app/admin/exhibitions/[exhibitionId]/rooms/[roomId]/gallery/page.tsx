"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { GalleryItem } from "@/types/gallery-item";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomGalleryListPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;
  const roomId = params.roomId as string;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchItems() {
    setLoading(true);
    void supabaseClient
      .from("gallery_items")
      .select("*")
      .eq("room_id", roomId)
      .order("order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("gallery_items fetch:", error);
          setLoading(false);
          return;
        }
        setItems((data as GalleryItem[]) ?? []);
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
    fetchItems();
  }, [roomId]);

  async function handleDelete(itemId: string) {
    if (!confirm("이 갤러리 항목을 삭제할까요?")) return;
    setDeletingId(itemId);
    const { error } = await supabaseClient.from("gallery_items").delete().eq("id", itemId);
    setDeletingId(null);
    if (error) {
      console.error(error);
      return;
    }
    fetchItems();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">갤러리 목록</h1>
        <Link
          href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/gallery/new`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          새 항목
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          이 전시실에 등록된 갤러리 항목이 없습니다. &quot;새 항목&quot;으로 추가해 보세요.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <Link
                href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/gallery/${item.id}`}
                className="block hover:opacity-90"
              >
                {item.image_url ? (
                  <div className="relative aspect-[4/3] w-full bg-neutral-100">
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full bg-neutral-100" />
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                    {item.caption || "(캡션 없음)"}
                  </p>
                  <p className="text-xs text-neutral-500">순서: {item.order ?? 0}</p>
                </div>
              </Link>
              <div className="flex gap-2 border-t border-neutral-100 p-3">
                <Link
                  href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/gallery/${item.id}`}
                  className="flex-1 rounded-md border border-neutral-300 py-1.5 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === item.id ? "삭제 중…" : "삭제"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link
          href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 전시실 상세
        </Link>
      </div>
    </div>
  );
}
