"use client";

import { isUuid } from "@/lib/uuid";
import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import type { GalleryItem } from "@/types/gallery-item";
import type { Room } from "@/types/room";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_GALLERY = "gallery_items";

export default function EditGalleryItemPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;
  const roomId = params.roomId as string;
  const itemId = params.itemId as string;

  const [item, setItem] = useState<GalleryItem | null>(null);
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const exhibitionPath = exhibition?.slug ?? exhibitionId;
  const roomPath = room?.slug ?? roomId;

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
    });
  }, [router]);

  useEffect(() => {
    supabaseClient
      .from("gallery_items")
      .select("*")
      .eq("id", itemId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("갤러리 항목을 불러올 수 없습니다.");
          setLoading(false);
          return;
        }
        const g = data as GalleryItem;
        setItem(g);
        setCaption(g.caption ?? "");
        setDescription(g.description ?? "");
        setOrder(g.order ?? 0);
        setLoading(false);
      });
  }, [itemId]);

  useEffect(() => {
    if (!item?.room_id) return;
    void supabaseClient
      .from("rooms")
      .select("*")
      .eq("id", item.room_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRoom(data as Room);
      });
  }, [item?.room_id]);

  useEffect(() => {
    if (!room?.exhibition_id) return;
    void supabaseClient
      .from("exhibitions")
      .select("*")
      .eq("id", room.exhibition_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExhibition(data as Exhibition);
      });
  }, [room?.exhibition_id]);

  useEffect(() => {
    if (!exhibition || !room) return;
    const exSlug = exhibition.slug ?? exhibitionId;
    const roomSlug = room.slug ?? roomId;
    if ((isUuid(exhibitionId) && exhibition.slug) || (isUuid(roomId) && room.slug)) {
      router.replace(`/admin/exhibitions/${exSlug}/rooms/${roomSlug}/gallery/${itemId}`);
    }
  }, [exhibition, room, exhibitionId, roomId, itemId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    setSubmitting(true);

    try {
      let imageUrl: string | null = item.image_url ?? null;

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
      }

      const { error: updateError } = await supabaseClient
        .from("gallery_items")
        .update({
          caption: caption.trim() || null,
          description: description.trim() || null,
          image_url: imageUrl,
          order: order,
        })
        .eq("id", itemId);

      if (updateError) {
        setError("저장 실패: " + updateError.message);
        setSubmitting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-neutral-500">불러오는 중…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-red-600">{error}</p>
        <Link
          href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/gallery`}
          className="mt-4 inline-block text-sm underline"
        >
          갤러리 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/gallery`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 갤러리 목록
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">갤러리 항목 수정</h1>

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
            이미지
          </label>
          {item.image_url && !imageFile && (
            <div className="relative mb-2 aspect-[4/3] w-full max-w-sm overflow-hidden rounded border border-neutral-200 bg-neutral-100">
              <Image
                src={item.image_url}
                alt={item.caption ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-600 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700"
          />
          <p className="mt-1 text-xs text-neutral-500">
            새 파일을 선택하면 기존 이미지를 대체합니다.
          </p>
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
            href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/gallery`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
