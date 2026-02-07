import Link from "next/link";
import type { Post } from "@/types/post";

type Props = {
  roomTitle: string;
  posts: Post[];
};

export function RoomPosts({ roomTitle, posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-body/70">
        이 전시실에 등록된 글이 없습니다.
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="sr-only">{roomTitle} — 글 목록</h2>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.id}`}
              className="block overflow-hidden rounded-none bg-zinc-200/60 shadow-none transition hover:bg-zinc-200/80"
            >
              <div className="flex min-h-[180px] flex-col px-8 pt-8 pb-6">
                <h3 className="text-lg font-black leading-tight tracking-tight text-body">
                  {post.title || "(제목 없음)"}
                </h3>
                {post.content ? (
                  <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm font-medium leading-relaxed text-body/90">
                    {post.content}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-body/50">내용 없음</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
