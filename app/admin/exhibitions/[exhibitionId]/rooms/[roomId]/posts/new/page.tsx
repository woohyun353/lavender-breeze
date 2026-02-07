"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import type { Room } from "@/types/room";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_POSTS = "posts";

export default function NewPostPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionSlugOrId = params.exhibitionId as string;
  const roomSlugOrId = params.roomId as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [order, setOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabaseClient
      .from("exhibitions")
      .select("*")
      .or(`slug.eq.${exhibitionSlugOrId},id.eq.${exhibitionSlugOrId}`)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExhibition(data as Exhibition);
      });
  }, [exhibitionSlugOrId]);

  useEffect(() => {
    if (!exhibition) return;
    void supabaseClient
      .from("rooms")
      .select("*")
      .eq("exhibition_id", exhibition.id)
      .or(`slug.eq.${roomSlugOrId},id.eq.${roomSlugOrId}`)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRoom(data as Room);
      });
  }, [exhibition?.id, roomSlugOrId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exhibition || !room) {
      setError("전시 또는 전시실을 찾을 수 없습니다.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      let thumbnailUrl: string | null = null;

      if (thumbnailFile) {
        const ext = (thumbnailFile.name.split(".").pop() || "png").toLowerCase();
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
        const path = `${STORAGE_PREFIX_POSTS}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(path, thumbnailFile, { upsert: true });

        if (uploadError) {
          setError("썸네일 업로드 실패: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        thumbnailUrl = data.publicUrl;
      }

      const { data: maxOrder } = await supabaseClient
        .from("posts")
        .select("order")
        .eq("room_id", room.id)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrder?.order ?? -1) + 1;
      const finalOrder = order !== 0 ? order : nextOrder;

      const { error: insertError } = await supabaseClient.from("posts").insert({
        room_id: room.id,
        title: title.trim(),
        content: content.trim() || null,
        thumbnail: thumbnailUrl,
        order: finalOrder,
      });

      if (insertError) {
        setError("저장 실패: " + insertError.message);
        setSubmitting(false);
        return;
      }

      router.push(`/admin/exhibitions/${exhibition!.slug ?? exhibition!.id}/rooms/${room!.slug ?? room!.id}/posts`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms/${room?.slug ?? room?.id ?? roomSlugOrId}/posts`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 포스트 목록
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">포스트 추가</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="order" className="mb-1 block text-sm font-medium text-neutral-700">
            순서
          </label>
          <input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-neutral-700">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            썸네일
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-600 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700"
          />
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "저장 중…" : "저장"}
          </button>
          <Link
            href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms/${room?.slug ?? room?.id ?? roomSlugOrId}/posts`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
