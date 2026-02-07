import { redirect } from "next/navigation";
import Link from "next/link";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Room } from "@/types/room";

type Props = { params: Promise<{ id: string }> };

export default async function ExhibitionFirstRoomPage({ params }: Props) {
  const { id: exhibitionSlugOrId } = await params;
  const supabase = supabaseServerClient();

  const { data: ex } = await supabase
    .from("exhibitions")
    .select("id, slug")
    .eq(isUuid(exhibitionSlugOrId) ? "id" : "slug", exhibitionSlugOrId)
    .maybeSingle();
  if (!ex) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-body/70">전시를 찾을 수 없습니다.</p>
          <Link
            href="/exhibitions"
            className="mt-4 inline-block text-sm text-body/80 underline hover:text-body"
          >
            ← 전시 목록
          </Link>
        </div>
      </main>
    );
  }
  if (isUuid(exhibitionSlugOrId) && (ex as { slug?: string | null }).slug && !isUuid((ex as { slug: string }).slug)) {
    redirect(`/exhibitions/${(ex as { slug: string }).slug}`);
  }

  const { data: rows } = await supabase
    .from("rooms")
    .select("id, slug")
    .eq("exhibition_id", ex.id)
    .order("order", { ascending: true, nullsFirst: false });
  const rooms = (rows as { id: string; slug?: string | null }[]) ?? [];

  if (rooms.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-body/70">전시가 준비 중입니다.</p>
          <Link
            href="/exhibitions"
            className="mt-4 inline-block text-sm text-body/80 underline hover:text-body"
          >
            ← 전시 목록
          </Link>
        </div>
      </main>
    );
  }

  const first = rooms[0];
  const roomPath = first.slug && !isUuid(first.slug) ? first.slug : first.id;
  redirect(`/rooms/${roomPath}`);
}
