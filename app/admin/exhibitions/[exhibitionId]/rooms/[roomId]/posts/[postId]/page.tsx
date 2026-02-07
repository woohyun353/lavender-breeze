"use client";

import { isUuid } from "@/lib/uuid";
import { supabaseClient } from "@/lib/supabase/client";
import type { Exhibition } from "@/types/exhibition";
import type { Post } from "@/types/post";
import type { Room } from "@/types/room";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_POSTS = "posts";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;
  const roomId = params.roomId as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("포스트를 불러올 수 없습니다.");
          setLoading(false);
          return;
        }
        const p = data as Post;
        setPost(p);
        setTitle(p.title ?? "");
        setContent(p.content ?? "");
        setOrder(p.order ?? 0);
        setLoading(false);
      });
  }, [postId]);

  useEffect(() => {
    if (!post?.room_id) return;
    void supabaseClient
      .from("rooms")
      .select("*")
      .eq("id", post.room_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRoom(data as Room);
      });
  }, [post?.room_id]);

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
      router.replace(`/admin/exhibitions/${exSlug}/rooms/${roomSlug}/posts/${postId}`);
    }
  }, [exhibition, room, exhibitionId, roomId, postId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setError(null);
    setSubmitting(true);

    try {
      let thumbnailUrl: string | null = post.thumbnail ?? null;

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

      const { error: updateError } = await supabaseClient
        .from("posts")
        .update({
          title: title.trim(),
          content: content.trim() || null,
          thumbnail: thumbnailUrl,
          order: order,
        })
        .eq("id", postId);

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

  if (!post) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-red-600">{error}</p>
        <Link
          href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/posts`}
          className="mt-4 inline-block text-sm underline"
        >
          포스트 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/posts`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 포스트 목록
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">포스트 수정</h1>

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
          {post.thumbnail && !thumbnailFile && (
            <div className="relative mb-2 h-24 w-32 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-600 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700"
          />
          <p className="mt-1 text-xs text-neutral-500">
            새 파일을 선택하면 기존 썸네일을 대체합니다.
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
            href={`/admin/exhibitions/${exhibitionPath}/rooms/${roomPath}/posts`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
