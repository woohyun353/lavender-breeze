"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Room = { id: string; title: string; order?: number | null };

type Props = {
  rooms: Room[];
  currentRoomId: string;
};

export function RoomSwitcher({ rooms, currentRoomId }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen, close]);

  const handleItemClick = (id: string) => {
    if (id === currentRoomId) {
      close();
      return;
    }
    close();
    router.push(`/rooms/${id}`);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-500 transition hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[var(--color-panel)]"
        aria-label="전시실 목록"
        aria-expanded={isOpen}
      >
        <span className="sr-only">전시실 목록</span>
        <span
          className="h-1.5 w-1.5 rounded-full bg-white"
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-[200px] bg-zinc-800 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="전시실 목록"
        >
          <ul className="flex flex-col py-2">
            {rooms.map((room) => {
              const isCurrent = room.id === currentRoomId;
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(room.id)}
                    className={`w-full px-6 py-3 text-center text-xs font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:bg-zinc-700 ${
                      isCurrent
                        ? "bg-zinc-700/80 underline"
                        : "hover:underline"
                    }`}
                  >
                    {room.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
