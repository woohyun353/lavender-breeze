"use client";

import { isUuid } from "@/lib/uuid";
import { supabaseClient } from "@/lib/supabase/client";
import type { Room } from "@/types/room";
import type { Exhibition } from "@/types/exhibition";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExhibitionRoomsListPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  function fetchExhibition() {
    void supabaseClient
      .from("exhibitions")
      .select("*")
      .eq(isUuid(exhibitionId) ? "id" : "slug", exhibitionId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          const ex = data as Exhibition;
          setExhibition(ex);
          if (isUuid(exhibitionId) && ex.slug) {
            router.replace(`/admin/exhibitions/${ex.slug}/rooms`);
          }
        }
      });
  }

  function fetchRooms(exhibitionIdFromEx: string) {
    setLoading(true);
    void supabaseClient
      .from("rooms")
      .select("*")
      .eq("exhibition_id", exhibitionIdFromEx)
      .order("order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("rooms fetch:", error);
          setLoading(false);
          return;
        }
        setRooms((data as Room[]) ?? []);
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
    fetchExhibition();
  }, [exhibitionId, router]);

  useEffect(() => {
    if (!exhibition) return;
    fetchRooms(exhibition.id);
  }, [exhibition?.id]);

  async function handleDelete(roomId: string) {
    if (!confirm("이 전시실을 삭제할까요? 하위 포스트·갤러리는 별도 확인이 필요할 수 있습니다."))
      return;
    setDeletingRoomId(roomId);
    const { error } = await supabaseClient.from("rooms").delete().eq("id", roomId);
    setDeletingRoomId(null);
    if (error) {
      console.error(error);
      return;
    }
    if (exhibition) fetchRooms(exhibition.id);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          전시실 목록 {exhibition?.title ? `— ${exhibition.title}` : ""}
        </h1>
        <Link
          href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionId}/rooms/new`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          새 전시실
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : rooms.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          이 전시에 등록된 전시실이 없습니다. &quot;새 전시실&quot;로 추가해 보세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <Link
                href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionId}/rooms/${room.slug ?? room.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-80"
              >
                {room.cover_image_url ? (
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                    <Image
                      src={room.cover_image_url}
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
                  <p className="font-medium text-neutral-900 truncate">{room.title}</p>
                  <p className="text-xs text-neutral-500">순서: {room.order ?? 0}</p>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionId}/rooms/${room.slug ?? room.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  상세
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(room.id)}
                  disabled={deletingRoomId === room.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingRoomId === room.id ? "삭제 중…" : "삭제"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
