import Link from "next/link";

type RoomCard = {
  id: string;
  title: string;
  subtitle: string;
  caption: string;
  coverUrl?: string; // 1번 카드만 사용
};

const rooms: RoomCard[] = [
  {
    id: "room-01",
    title: "Room 01",
    subtitle: "순욱 문학×서문전람",
    caption: "가장 따뜻한 겨울",
    coverUrl:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200&auto=format&fit=crop",
  },
  { id: "room-02", title: "Room 01", subtitle: "순욱 문학×서문전람", caption: "가장 따뜻한 겨울" },
  { id: "room-03", title: "Room 01", subtitle: "순욱 문학×서문전람", caption: "가장 따뜻한 겨울" },
  { id: "room-04", title: "Room 01", subtitle: "순욱 문학×서문전람", caption: "가장 따뜻한 겨울" },
];

export default function ExhibitionsPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ee]">
      {/* 타이틀 */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex flex-col items-center">
          <h1 className="font-serif text-5xl font-semibold tracking-wide">
            exhibition
          </h1>
          <div className="-mt-3 h-px w-64 bg-black/70" />
          {/* 필요하면 뒤로가기/헤더 추가 가능 */}
        </div>

        {/* 그리드 */}
        <section className="mt-10 pb-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room, idx) => {
              const isHero = idx === 0; // ✅ 맨 왼쪽 카드
              return (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="group block"
                >
                  <div className="w-full">
                    {/* 카드 프레임 */}
                    <div className="relative w-full overflow-hidden rounded-[999px] rounded-b-3xl bg-[#d9d9d9] shadow-sm ring-1 ring-black/10">
                      {/* 높이 (피그마 느낌: 세로로 길게) */}
                      <div className="aspect-[3/5] w-full">
                        {isHero ? (
                          <>
                            {/* ✅ 실제 이미지 */}
                            {/* next/image 써도 되는데 지금은 더미라 그냥 img */}
                            <img
                              src={room.coverUrl}
                              alt={room.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />

                            {/* ✅ 아래→위 검정 그라데이션 */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                            {/* ✅ 흰색 텍스트 (그라데이션 위) */}
                            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                              <div className="text-sm font-semibold opacity-95">
                                {room.title}
                              </div>
                              <div className="mt-1 text-xs opacity-80">
                                {room.subtitle}
                              </div>
                              <div className="mt-3 text-xs opacity-90">
                                {room.caption}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* ✅ 나머지는 회색 더미(아치 프레임 느낌 유지) */}
                            <div className="h-full w-full bg-[#d9d9d9]" />
                            {/* 살짝 깊이감 */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-black/5" />
                          </>
                        )}
                      </div>
                    </div>

                    {/* 카드 아래 텍스트 (피그마처럼) */}
                    <div className="mt-4 px-1">
                      <div className="text-sm font-semibold text-black/90">
                        {room.title}
                      </div>
                      <div className="mt-1 text-xs text-black/60">
                        {room.subtitle}
                      </div>
                      <div className="mt-3 text-[11px] text-black/45">
                        {room.caption}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}