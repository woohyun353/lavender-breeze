"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  artist: string;
  description?: string;
};

type Props = {
  roomTitle: string;
  items: GalleryItem[];
};

function InfoPanel({
  title,
  artist,
  description,
  className = "",
}: {
  title: string;
  artist: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--color-bg)]/95 p-6 shadow-sm ring-1 ring-black/10 ${className}`}
    >
      <p className="text-sm font-semibold text-body">{title}</p>
      <p className="mt-1 text-[11px] text-body/70">{artist}</p>
      {(description ?? "").trim() && (
        <>
          <hr className="my-3 border-black/10" />
          <p className="text-[11px] leading-relaxed text-body/70">
            {description}
          </p>
        </>
      )}
    </div>
  );
}

const ROWS_PER_PAGE = 4;
const COLS_LG = 3;
const ITEMS_PER_PAGE = ROWS_PER_PAGE * COLS_LG;

export function RoomGallery({ roomTitle, items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const selected = items.find((i) => i.id === selectedId);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = items.slice(start, start + ITEMS_PER_PAGE);

  const close = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, close]);

  return (
    <>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-x-20 gap-y-16 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((item) => (
          <li key={item.id} className="w-full max-w-sm">
            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="group w-full text-center"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden shadow-md transition-shadow group-hover:shadow-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.title || "전시 이미지"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-body">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-body/60">
                {item.artist}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {/* 페이지네이션: 4줄(12개) 단위, 미니멀 */}
      {totalPages > 1 && (
        <nav
          className="mx-auto flex max-w-6xl items-center justify-center gap-3 py-8"
          aria-label="갤러리 페이지"
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            ))}
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

      {/* 모달: 라이트박스 + 우하단 안내판 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="작품 보기"
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 p-2 text-white/80 hover:text-white"
            aria-label="닫기"
            onClick={close}
          >
            <span className="text-2xl leading-none">×</span>
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center overflow-y-auto lg:h-[80vh] lg:max-h-[90vh] lg:flex-row lg:items-end lg:justify-center lg:gap-6 lg:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 이미지: 바닥선 맞추기 위해 래퍼만 높이 참여, 내부는 max-h-[80vh] */}
            <div className="relative w-full max-w-md shrink-0 lg:flex lg:items-end lg:self-end">
              <div className="relative aspect-[3/4] w-full overflow-hidden lg:aspect-[3/4] lg:max-h-[80vh] lg:w-[min(60vw,60vh)]">
                <Image
                  src={selected.imageUrl}
                  alt={selected.title || "전시 이미지"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 90vw, 60vw"
                />
              </div>
            </div>
            {/* 설명 패널: w-[320px], 바닥 정렬 */}
            <div className="mt-4 w-full max-w-md shrink-0 lg:mt-0 lg:flex lg:items-end lg:w-[320px] lg:self-end">
              <div className="w-full lg:max-h-[70vh] lg:overflow-auto">
                <InfoPanel
                  title={selected.title}
                  artist={selected.artist}
                  description={selected.description}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
