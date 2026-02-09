import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";

type Props = { params: Promise<{ postId: string }> };

export default async function PostPage({ params }: Props) {
  const { postId } = await params;
  const supabase = supabaseServerClient();

  const { data: row, error } = await supabase
    .from("posts")
    .select("id, room_id, title, subtitle, content, thumbnail, order")
    .eq("id", postId)
    .single();

  if (error || !row) {
    notFound();
  }

  const post = row as Post;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-body/10 bg-panel/50">
        <div className="mx-auto flex max-w-4xl section-padding items-center gap-4">
          <Link
            href={post.room_id ? `/rooms/${post.room_id}` : "/exhibitions"}
            className="text-sm text-body/70 hover:text-body"
          >
            ← {post.room_id ? "글 목록" : "전시 목록"}
          </Link>
          <span className="text-sm text-body/60">글 보기</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="rounded-none bg-zinc-200/60 px-10 py-12 shadow-none sm:px-14 sm:py-16">
          <h1 className="text-3xl font-black tracking-tight text-body sm:text-4xl">
            {post.title || "(제목 없음)"}
          </h1>
          {post.subtitle && (
            <p className="mt-2 text-sm text-body/70">{post.subtitle}</p>
          )}
          <hr className="mt-6 h-px w-full border-0 bg-black/70" />
          <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-body">
            {post.content ?? ""}
          </div>
        </div>
      </article>
    </main>
  );
}
