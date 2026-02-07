import Link from "next/link";
import Image from "next/image";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { MainPage } from "@/types/main-page";

export const dynamic = "force-dynamic";

const DEFAULT_OPENING_TEXT = `갤러리를 방문해 주셔서 감사합니다.
이곳에서는 다양한 전시와 작품을 만나보실 수 있습니다.`;

export default async function MainPage() {
  const supabase = supabaseServerClient();
  const { data: row } = await supabase
    .from("main_page")
    .select("main_image_url, opening_text")
    .eq("id", "main")
    .maybeSingle();

  const mainPage = row as Pick<MainPage, "main_image_url" | "opening_text"> | null;
  const mainImageUrl = mainPage?.main_image_url ?? null;
  const openingText = mainPage?.opening_text?.trim() || DEFAULT_OPENING_TEXT;

  return (
    <main className="min-h-screen bg-background">
      <h1 className="py-8 text-center font-serif text-3xl font-semibold tracking-wide text-body">
        lavender-breeze
      </h1>

      <div className="relative grid grid-cols-1 overflow-visible lg:grid-cols-[55%_1fr]">
        {/* 왼쪽: 메인 이미지 (가로 조금 짧게) */}
        <div className="relative min-h-[70vh] w-full overflow-visible">
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
              alt="메인 이미지"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-200/80" />
          )}
          {/* 아치: 이미지와 텍스트 경계에 반만 걸치도록 */}
          <Link
            href="/exhibitions"
            className="absolute bottom-0 left-full top-0 flex w-[min(280px,70vw)] -translate-x-1/2 items-end justify-center"
            aria-label="전시 목록으로 이동"
          >
            <span className="block h-[70%] min-h-[280px] w-full max-w-[240px] rounded-t-full rounded-b-none bg-zinc-600/90 shadow-lg transition hover:bg-zinc-700/95" />
          </Link>
        </div>

        {/* 오른쪽: 오프닝 글 (아치와 겹치지 않게, 가로 줄이고 오른쪽으로) */}
        <div className="flex flex-col justify-center overflow-visible px-8 py-12 lg:pl-[140px] lg:pr-12 lg:py-16">
          <p className="ml-auto max-w-md whitespace-pre-line font-serif text-sm leading-relaxed text-body/90">
            {openingText}
          </p>
        </div>
      </div>
    </main>
  );
}
