import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Exhibition } from "@/types/exhibition";

async function getExhibitionsData() {
  const supabase = supabaseServerClient();
  const { data: rows } = await supabase
    .from("exhibitions")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false });
  const exhibitions = (rows as Exhibition[]) ?? [];
  const exhibitionIds = exhibitions.map((e) => e.id);
  const firstRoomByExId: Record<string, { slug: string | null; id: string }> = {};
  if (exhibitionIds.length > 0) {
    const { data: roomRows } = await supabase
      .from("rooms")
      .select("id, slug, exhibition_id, order")
      .in("exhibition_id", exhibitionIds)
      .order("order", { ascending: true, nullsFirst: false });
    const rooms = (roomRows as { id: string; slug: string | null; exhibition_id: string; order: number | null }[]) ?? [];
    const sorted = [...rooms].sort(
      (a, b) =>
        (a.exhibition_id > b.exhibition_id ? 1 : a.exhibition_id < b.exhibition_id ? -1 : 0) ||
        (a.order ?? 0) - (b.order ?? 0)
    );
    for (const r of sorted) {
      if (firstRoomByExId[r.exhibition_id] === undefined) {
        firstRoomByExId[r.exhibition_id] = { slug: r.slug, id: r.id };
      }
    }
  }
  return { exhibitions, firstRoomByExId };
}

const getCachedExhibitions = () =>
  unstable_cache(getExhibitionsData, ["exhibitions-list"], { revalidate: 60 })();

export default async function ExhibitionsPage() {
  const { exhibitions, firstRoomByExId } = await getCachedExhibitions();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <div className="mb-4">
          <Link
            href="/main"
            className="text-xs text-body/60 hover:text-body"
          >
            ← 뒤로
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="font-serif text-4xl font-semibold tracking-wide text-body">
            exhibition
          </h1>
          <div className="-mt-3 h-px w-64 bg-body/70" />
        </div>

        <section className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {exhibitions.map((ex, idx) => {
              const isHero = idx === 0;
              const coverUrl = ex.cover_image ?? null;
              const firstRoom = firstRoomByExId[ex.id];
              const roomPath = firstRoom
                ? (firstRoom.slug && !isUuid(firstRoom.slug) ? firstRoom.slug : firstRoom.id)
                : null;
              const href = roomPath ? `/rooms/${roomPath}` : `/exhibitions/${ex.slug}`;
              return (
                <Link
                  key={ex.id}
                  href={href}
                  className="group block"
                >
                  <div className="mx-auto w-full max-w-[320px]">
                    <div className="relative h-[600px] w-full overflow-hidden rounded-t-full rounded-b-none bg-zinc-200 shadow-sm ring-1 ring-black/10">
                      {isHero && coverUrl ? (
                        <>
                          <Image
                            src={coverUrl}
                            alt={ex.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute left-6 bottom-10 text-white">
                            <div className="text-sm font-semibold">
                              {ex.title}
                            </div>
                            {ex.description && (
                              <div className="mt-1.5 line-clamp-2 text-xs opacity-90">
                                {ex.description}
                              </div>
                            )}
                          </div>
                        </>
                      ) : coverUrl ? (
                        <>
                          <Image
                            src={coverUrl}
                            alt={ex.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute left-6 bottom-10 text-white">
                            <div className="text-sm font-semibold">
                              {ex.title}
                            </div>
                            {ex.description && (
                              <div className="mt-1.5 line-clamp-2 text-xs opacity-90">
                                {ex.description}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-zinc-200" />
                          <div className="absolute left-6 bottom-10 text-xs text-body/40">
                            {ex.title}
                          </div>
                        </>
                      )}
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
