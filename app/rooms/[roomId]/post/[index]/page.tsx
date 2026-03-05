import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";
import type { Room } from "@/types/room";

type Props = { params: Promise<{ roomId: string; index: string }> };

async function getRoomPostData(roomId: string, indexNum: number): Promise<{
  room: Pick<Room, "id" | "slug" | "title">;
  post: Post;
} | null> {
  const supabase = supabaseServerClient();
  const { data: roomRow, error: roomError } = await supabase
    .from("rooms")
    .select("id, slug, title")
    .eq(isUuid(roomId) ? "id" : "slug", roomId)
    .maybeSingle();
  if (roomError || !roomRow) return null;
  const room = roomRow as Pick<Room, "id" | "slug" | "title">;
  const { data: postRows } = await supabase
    .from("posts")
    .select("id, room_id, title, subtitle, content, thumbnail, order")
    .eq("room_id", room.id)
    .order("order", { ascending: true, nullsFirst: false });
  const orderedPosts = (postRows as Post[]) ?? [];
  const post = orderedPosts[indexNum - 1];
  if (!post) return null;
  return { room, post };
}

const getCachedRoomPost = (roomId: string, indexStr: string) =>
  unstable_cache(
    () => getRoomPostData(roomId, parseInt(indexStr, 10)),
    ["room-post", roomId, indexStr],
    { revalidate: 60 }
  )();

export default async function RoomPostPage({ params }: Props) {
  const { roomId, index: indexStr } = await params;
  const indexNum = parseInt(indexStr, 10);
  if (Number.isNaN(indexNum) || indexNum < 1) {
    notFound();
  }

  const data = await getCachedRoomPost(roomId, indexStr);
  if (!data) {
    notFound();
  }

  const { room, post } = data;
  const roomPath = room.slug && !isUuid(room.slug) ? room.slug : room.id;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-body/10 bg-panel/50">
        <div className="mx-auto flex max-w-4xl section-padding items-center gap-4">
          <Link
            href={`/rooms/${roomPath}`}
            className="text-sm text-body/70 hover:text-body"
          >
            ← 글 목록
          </Link>
          <span className="text-sm text-body/60">글 보기</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="rounded-none bg-zinc-200/60 px-10 py-12 shadow-none sm:px-14 sm:py-16">
          <h1 className="text-3xl font-black tracking-tight text-body sm:text-4xl">
            {post.title || "(제목 없음)"}
          </h1>
          {post.subtitle && (
            <p className="mt-2 text-sm text-body/70">{post.subtitle}</p>
          )}
          <hr className="mt-6 h-px w-full border-0 bg-black/70" />
          <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-body">
            {post.content ?? ""}
          </div>
        </div>
      </article>
    </main>
  );
}
