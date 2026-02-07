"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { Post } from "@/types/post";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPostsListPage() {
  const params = useParams();
  const router = useRouter();
  const exhibitionId = params.exhibitionId as string;
  const roomId = params.roomId as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchPosts() {
    setLoading(true);
    void supabaseClient
      .from("posts")
      .select("*")
      .eq("room_id", roomId)
      .order("order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("posts fetch:", error);
          setLoading(false);
          return;
        }
        setPosts((data as Post[]) ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
    });
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, [roomId]);

  async function handleDelete(postId: string) {
    if (!confirm("이 포스트를 삭제할까요?")) return;
    setDeletingId(postId);
    const { error } = await supabaseClient.from("posts").delete().eq("id", postId);
    setDeletingId(null);
    if (error) {
      console.error(error);
      return;
    }
    fetchPosts();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">포스트 목록</h1>
        <Link
          href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/posts/new`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          새 포스트
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          이 전시실에 등록된 포스트가 없습니다. &quot;새 포스트&quot;로 추가해 보세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <Link
                href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/posts/${post.id}`}
                className="min-w-0 flex-1 hover:opacity-80"
              >
                <p className="font-medium text-neutral-900 truncate">{post.title || "(제목 없음)"}</p>
                <p className="text-xs text-neutral-500">순서: {post.order ?? 0}</p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}/posts/${post.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === post.id ? "삭제 중…" : "삭제"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link
          href={`/admin/exhibitions/${exhibitionId}/rooms/${roomId}`}
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          ← 전시실 상세
        </Link>
      </div>
    </div>
  );
}
