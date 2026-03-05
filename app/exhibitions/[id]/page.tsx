import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

async function getExhibitionFirstRoom(
  exhibitionSlugOrId: string
): Promise<{ redirect: string } | { notFound: true } | { noRooms: true }> {
  const supabase = supabaseServerClient();
  const { data: ex } = await supabase
    .from("exhibitions")
    .select("id")
    .eq(isUuid(exhibitionSlugOrId) ? "id" : "slug", exhibitionSlugOrId)
    .maybeSingle();
  if (!ex) return { notFound: true };
  const { data: rows } = await supabase
    .from("rooms")
    .select("id, slug")
    .eq("exhibition_id", ex.id)
    .order("order", { ascending: true, nullsFirst: false });
  const rooms = (rows as { id: string; slug?: string | null }[]) ?? [];
  if (rooms.length === 0) return { noRooms: true };
  const first = rooms[0];
  const roomPath = first.slug && !isUuid(first.slug) ? first.slug : first.id;
  return { redirect: `/rooms/${roomPath}` };
}

const getCachedFirstRoom = (exhibitionSlugOrId: string) =>
  unstable_cache(
    () => getExhibitionFirstRoom(exhibitionSlugOrId),
    ["exhibition-first-room", exhibitionSlugOrId],
    { revalidate: 60 }
  )();

export default async function ExhibitionFirstRoomPage({ params }: Props) {
  const { id: exhibitionSlugOrId } = await params;
  const result = await getCachedFirstRoom(exhibitionSlugOrId);

  if ("notFound" in result && result.notFound) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-body/70">전시를 찾을 수 없습니다.</p>
          <Link href="/exhibitions" className="mt-4 inline-block text-sm text-body/80 underline hover:text-body">
            ← 전시 목록
          </Link>
        </div>
      </main>
    );
  }
  if ("noRooms" in result && result.noRooms) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-body/70">전시가 준비 중입니다.</p>
          <Link href="/exhibitions" className="mt-4 inline-block text-sm text-body/80 underline hover:text-body">
            ← 전시 목록
          </Link>
        </div>
      </main>
    );
  }
  redirect(result.redirect);
}
