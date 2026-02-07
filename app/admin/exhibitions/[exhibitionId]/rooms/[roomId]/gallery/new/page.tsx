"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import type { Room } from "@/types/room";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_GALLERY = "gallery_items";

export default function NewGalleryItemPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionSlugOrId = params.exhibitionId as string;
  const roomSlugOrId = params.roomId as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "png").toLowerCase();
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
        const path = `${STORAGE_PREFIX_GALLERY}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(path, imageFile, { upsert: true });

        if (uploadError) {
          setError("이미지 업로드 실패: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        imageUrl = data.publicUrl;
      } else {
        setError("이미지를 선택해 주세요.");
        setSubmitting(false);
        return;
      }

      const { data: maxOrder } = await supabaseClient
        .from("gallery_items")
        .select("order")
        .eq("room_id", room.id)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrder?.order ?? -1) + 1;
      const finalOrder = order !== 0 ? order : nextOrder;

      const { error: insertError } = await supabaseClient.from("gallery_items").insert({
        room_id: room.id,
        image_url: imageUrl,
        caption: caption.trim() || null,
        description: description.trim() || null,
        order: finalOrder,
      });

      if (insertError) {
        setError("저장 실패: " + insertError.message);
        setSubmitting(false);
        return;
      }

      router.push(`/admin/exhibitions/${exhibition.slug ?? exhibition.id}/rooms/${room.slug ?? room.id}/gallery`);
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
          href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms/${room?.slug ?? room?.id ?? roomSlugOrId}/gallery`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 갤러리 목록
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">갤러리 항목 추가</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
      >
        <div>
          <label htmlFor="caption" className="mb-1 block text-sm font-medium text-neutral-700">
            캡션 (이미지 아래 짧은 제목)
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
            설명 (클릭 시 모달에 표시)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
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
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            이미지 *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            required
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
            href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms/${room?.slug ?? room?.id ?? roomSlugOrId}/gallery`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
