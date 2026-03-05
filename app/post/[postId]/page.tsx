import { isUuid } from "@/lib/uuid";
import { notFound, redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ postId: string }> };

export default async function PostPage({ params }: Props) {
  const { postId } = await params;
  const supabase = supabaseServerClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, room_id")
    .eq("id", postId)
    .single();

  if (error || !post?.room_id) {
    notFound();
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("id, slug")
    .eq("id", post.room_id)
    .maybeSingle();

  if (!room) {
    notFound();
  }

  const roomPath = room.slug && !isUuid(room.slug) ? room.slug : room.id;

  const { data: ordered } = await supabase
    .from("posts")
    .select("id")
    .eq("room_id", post.room_id)
    .order("order", { ascending: true, nullsFirst: false });

  const list = (ordered as { id: string }[]) ?? [];
  const idx = list.findIndex((p) => p.id === postId);
  if (idx === -1) {
    notFound();
  }

  const indexStr = String(idx + 1).padStart(3, "0");
  redirect(`/rooms/${roomPath}/post/${indexStr}`);
}
