type Props = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  order?: number | null;
};

/** 글 전시실 페이지 상단의 종이 포스터 스타일 카드 (타이틀 / 부제 / 구분선 / 본문) */
export function TextRoomCard({ title, subtitle, description, order }: Props) {
  const displayTitle =
    title || `Room ${order ?? ""}`.trim() || "전시실";

  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-none bg-zinc-200/60 shadow-none">
      <div className="flex flex-col px-14 pt-16 pb-12">
        <h2 className="text-5xl font-black leading-none tracking-tight text-body">
          {displayTitle}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-2xl font-semibold leading-tight text-body">
            {subtitle}
          </p>
        ) : null}
        <hr className="mt-10 h-px w-full border-0 bg-black/70" />
        {description ? (
          <p className="mt-10 whitespace-pre-line text-xl font-semibold leading-relaxed text-black/90">
            {description}
          </p>
        ) : (
          <div className="mt-10 min-h-[4rem]" aria-hidden />
        )}
      </div>
    </div>
  );
}
