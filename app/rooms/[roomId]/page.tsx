import Link from "next/link";
import { notFound } from "next/navigation";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";
import { RoomGallery } from "./RoomGallery";
import { RoomPosts } from "./RoomPosts";
import { RoomSwitcher } from "./RoomSwitcher";
import type { Room } from "@/types/room";
import type { Post } from "@/types/post";

// GalleryItem 형식 (RoomGallery용)
type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  artist: string;
  description?: string;
};

// Supabase에 room이 없을 때만 사용하는 더미 (기존 roomId 1,2,3 호환)
const DUMMY_FALLBACK: Record<
  string,
  { title: string; items: GalleryItem[] }
> = {
  "1": {
    title: "첫 번째 전시실",
    items: [
      {
        id: "a",
        imageUrl: "https://picsum.photos/400/533?random=1",
        title: "작품 1",
        artist: "작가 A",
        description:
          "이곳에는 작품에 대한 설명이 들어갑니다. 2024년 제작. 재료 및 기법에 대한 간단한 소개를 넣을 수 있습니다.",
      },
      {
        id: "b",
        imageUrl: "https://picsum.photos/400/533?random=2",
        title: "작품 2",
        artist: "작가 B",
        description: "두 번째 작품의 설명 텍스트입니다.",
      },
      {
        id: "c",
        imageUrl: "https://picsum.photos/400/533?random=3",
        title: "작품 3",
        artist: "작가 C",
      },
    ],
  },
  "2": {
    title: "두 번째 전시실",
    items: [
      {
        id: "x",
        imageUrl: "https://picsum.photos/400/533?random=10",
        title: "작품 A",
        artist: "Artist X",
        description: "Series 2023. Mixed media.",
      },
      {
        id: "y",
        imageUrl: "https://picsum.photos/400/533?random=11",
        title: "작품 B",
        artist: "Artist Y",
      },
    ],
  },
  "3": {
    title: "세 번째 전시실",
    items: [
      {
        id: "p",
        imageUrl: "https://picsum.photos/400/533?random=20",
        title: "Untitled",
        artist: "Unknown",
      },
    ],
  },
};

type Props = { params: Promise<{ roomId: string }> };

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  const supabase = supabaseServerClient();

  const { data: roomRow, error: roomError } = await supabase
    .from("rooms")
    .select("id, slug, title, subtitle, description, exhibition_id, type, order")
    .eq(isUuid(roomId) ? "id" : "slug", roomId)
    .maybeSingle();

  if (roomError || !roomRow) {
    const fallback = DUMMY_FALLBACK[roomId];
    if (fallback) {
      return (
        <main className="min-h-screen bg-[var(--color-bg)]">
          <header className="border-b border-black/5 bg-[var(--color-panel)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 sm:py-5">
              <Link
                href="/exhibitions"
                className="text-sm text-body/70 hover:text-body"
              >
                ← 전시 목록
              </Link>
              <h1 className="text-base font-medium text-body">{fallback.title}</h1>
            </div>
          </header>
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <RoomGallery roomTitle={fallback.title} items={fallback.items} />
          </div>
        </main>
      );
    }
    notFound();
  }

  const room = roomRow as Pick<Room, "id" | "slug" | "title" | "subtitle" | "description" | "exhibition_id" | "type" | "order">;

  const { data: siblingRows } = await supabase
    .from("rooms")
    .select("id, slug, title, order")
    .eq("exhibition_id", room.exhibition_id)
    .order("order", { ascending: true, nullsFirst: false });
  const siblingRooms = (siblingRows as { id: string; slug?: string | null; title: string; order: number | null }[]) ?? [];

  let items: GalleryItem[] = [];
  let posts: Post[] = [];

  if (room.type === "image") {
    const { data: galleryRows } = await supabase
      .from("gallery_items")
      .select("id, image_url, caption, description")
      .eq("room_id", room.id)
      .order("order", { ascending: true, nullsFirst: false });
    const rows = (galleryRows as { id: string; image_url: string | null; caption: string | null; description?: string | null }[]) ?? [];
    items = rows.map((r) => ({
      id: r.id,
      imageUrl: r.image_url ?? "",
      title: r.caption ?? "",
      artist: "",
      description: r.description ?? "",
    }));
    if (items.length === 0 && DUMMY_FALLBACK[roomId]) {
      items = DUMMY_FALLBACK[roomId].items;
    }
  } else if (room.type === "text") {
    const { data: postRows } = await supabase
      .from("posts")
      .select("id, room_id, title, content, thumbnail, order")
      .eq("room_id", room.id)
      .order("order", { ascending: true, nullsFirst: false });
    posts = (postRows as Post[]) ?? [];
  }

  const isTextRoom = room.type === "text";

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-black/5 bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 sm:py-5">
          <Link
            href="/exhibitions"
            className="text-sm text-body/70 hover:text-body"
          >
            ← 전시 목록
          </Link>
          <h1 className="text-base font-medium text-body">{room.title}</h1>
          <RoomSwitcher rooms={siblingRooms} currentRoomSlugOrId={room.slug ?? room.id} />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {isTextRoom ? (
          <RoomPosts roomTitle={room.title} posts={posts} />
        ) : (
          <RoomGallery roomTitle={room.title} items={items} />
        )}
      </div>
    </main>
  );
}
