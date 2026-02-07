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

export function RoomGallery({ roomTitle, items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId);

  const close = useCallback(() => setSelectedId(null), []);

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
        {items.map((item) => (
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
