"use client";

import { supabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX = "exhibitions";

export default function NewExhibitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

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
        imageUrl = data.publicUrl;
      }

      const { data: existing } = await supabaseClient
        .from("exhibitions")
        .select("order")
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (existing?.order ?? -1) + 1;

      const { error: insertError } = await supabaseClient.from("exhibitions").insert({
        title: title.trim(),
        description: description.trim() || null,
        cover_image: imageUrl,
        order: nextOrder,
      });

      if (insertError) {
        setError("저장 실패: " + insertError.message);
        setSubmitting(false);
        return;
      }

      router.push("/admin/exhibitions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/exhibitions"
            className="text-sm text-neutral-600 underline hover:text-neutral-900"
          >
            ← 목록
          </Link>
        </div>
        <h1 className="text-2xl font-bold">전시 추가</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
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
              href="/admin"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
