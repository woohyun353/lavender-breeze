"use client";

import { isUuid } from "@/lib/uuid";
import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX = "exhibitions";

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      .from("exhibitions")
      .select("*")
      .eq(isUuid(exhibitionId) ? "id" : "slug", exhibitionId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("전시를 불러올 수 없습니다.");
          setLoading(false);
          return;
        }
        const ex = data as Exhibition;
        setExhibition(ex);
        setTitle(ex.title ?? "");
        setDescription(ex.description ?? "");
        setOrder(ex.order ?? 0);
        setSlug(ex.slug ?? "");
        setLoading(false);
        if (isUuid(exhibitionId) && ex.slug) {
          router.replace(`/admin/exhibitions/${ex.slug}`);
        }
      });
  }, [exhibitionId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exhibition) return;
    setError(null);
    setSubmitting(true);

    try {
      let coverImageUrl: string | null = exhibition.cover_image ?? null;

      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "png").toLowerCase();
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
        const path = `${STORAGE_PREFIX}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(path, imageFile, { upsert: true });

        if (uploadError) {
          setError("이미지 업로드 실패: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        coverImageUrl = data.publicUrl;
      }

      const { error: updateError } = await supabaseClient
        .from("exhibitions")
        .update({
          title: title.trim(),
          slug: slug.trim() || null,
          description: description.trim() || null,
          cover_image: coverImageUrl,
          order: order,
        })
        .eq("id", exhibition.id);

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

  if (!exhibition) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-red-600">{error}</p>
        <Link href="/admin/exhibitions" className="mt-4 inline-block text-sm underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/exhibitions"
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 전시 목록
        </Link>
      </div>

      <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4">
        <Link
          href={`/admin/exhibitions/${exhibition.slug ?? exhibition.id}/rooms`}
          className="flex items-center justify-between rounded-md px-3 py-3 text-neutral-700 hover:bg-neutral-50"
        >
          <span className="font-medium">전시실 관리로 이동</span>
          <span className="text-neutral-400">→</span>
        </Link>
        <p className="px-3 pb-2 text-sm text-neutral-500">
          이 전시에 속한 전시실 목록·추가·정렬을 관리합니다.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">전시 기본 정보</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-neutral-700">
              URL 경로 (영문·숫자·하이픈, 예: spring-2024)
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="비우면 UUID 사용"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label htmlFor="order" className="mb-1 block text-sm font-medium text-neutral-700">
              순서 (숫자, 작을수록 먼저)
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
              이미지
            </label>
            {exhibition.cover_image && !imageFile && (
              <div className="relative mb-2 h-32 w-48 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                <Image
                  src={exhibition.cover_image}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="192px"
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
              href="/admin/exhibitions"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
