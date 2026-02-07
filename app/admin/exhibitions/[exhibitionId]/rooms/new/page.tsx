"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_ROOMS = "rooms";

export default function NewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionSlugOrId = params.exhibitionId as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [order, setOrder] = useState(0);
  const [type, setType] = useState<"text" | "image" | "">("text");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exhibition) {
      setError("전시를 찾을 수 없습니다.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      let coverImageUrl: string | null = null;

      if (coverImageFile) {
        const ext = (coverImageFile.name.split(".").pop() || "png").toLowerCase();
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
        const path = `${STORAGE_PREFIX_ROOMS}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(path, coverImageFile, { upsert: true });

        if (uploadError) {
          setError("이미지 업로드 실패: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        coverImageUrl = data.publicUrl;
      }

      const { data: maxOrder } = await supabaseClient
        .from("rooms")
        .select("order")
        .eq("exhibition_id", exhibition.id)
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrder?.order ?? -1) + 1;
      const finalOrder = order !== 0 ? order : nextOrder;

      const slugValue = slug.trim() || null;
      const { error: insertError } = await supabaseClient.from("rooms").insert({
        exhibition_id: exhibition.id,
        title: title.trim(),
        slug: slugValue,
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        cover_image_url: coverImageUrl,
        order: finalOrder,
        type: type || null,
      });

      if (insertError) {
        setError("저장 실패: " + insertError.message);
        setSubmitting(false);
        return;
      }

      router.push(`/admin/exhibitions/${exhibition.slug ?? exhibition.id}/rooms`);
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
          href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 전시실 목록
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">전시실 추가</h1>

      {!exhibition && <p className="text-sm text-neutral-500">전시 정보를 불러오는 중…</p>}
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
            disabled={!exhibition}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-neutral-700">
            URL 경로 (영문·숫자·하이픈, 예: room-1)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="비우면 자동 생성"
            disabled={!exhibition}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="subtitle" className="mb-1 block text-sm font-medium text-neutral-700">
            부제목
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
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
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-neutral-700">
            타입
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as "text" | "image" | "")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            <option value="">선택</option>
            <option value="text">text</option>
            <option value="image">image</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
            설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            커버 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
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
            href={`/admin/exhibitions/${exhibition?.slug ?? exhibition?.id ?? exhibitionSlugOrId}/rooms`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
