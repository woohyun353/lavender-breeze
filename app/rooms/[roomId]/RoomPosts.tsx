"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Post } from "@/types/post";

const ROWS_PER_PAGE = 3;
const COLS_LG = 4;
const ITEMS_PER_PAGE = ROWS_PER_PAGE * COLS_LG;

function getPaginationItems(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const result: (number | null)[] = [1];
  const delta = 1;
  const windowStart = Math.max(2, currentPage - delta);
  const windowEnd = Math.min(totalPages - 1, currentPage + delta);
  if (windowStart > 2) result.push(null);
  for (let p = windowStart; p <= windowEnd; p++) result.push(p);
  if (windowEnd < totalPages - 1) result.push(null);
  if (totalPages > 1) result.push(totalPages);
  return result;
}

type Props = {
  roomTitle: string;
  posts: Post[];
};

export function RoomPosts({ roomTitle, posts }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagePosts = posts.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [posts.length]);

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
        {pagePosts.map((post) => (
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

      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-3"
          aria-label="글 목록 페이지"
        >
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:pointer-events-none disabled:opacity-30"
            aria-label="이전 페이지"
          >
            <span className="text-lg leading-none">‹</span>
          </button>
          <div className="flex items-center gap-1">
            {getPaginationItems(currentPage, totalPages).map((p, i) =>
              p === null ? (
                <span key={`ellipsis-${i}`} className="px-1 text-neutral-400" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[1.75rem] rounded px-1.5 py-1 text-xs leading-none transition-colors ${
                    currentPage === p
                      ? "bg-neutral-200 text-body font-medium"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-body"
                  }`}
                  aria-label={`${p}페이지`}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:pointer-events-none disabled:opacity-30"
            aria-label="다음 페이지"
          >
            <span className="text-lg leading-none">›</span>
          </button>
        </nav>
      )}
    </div>
  );
}
