import Link from "next/link";
import Image from "next/image";
import { isUuid } from "@/lib/uuid";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { Exhibition } from "@/types/exhibition";

export const dynamic = "force-dynamic";

export default async function ExhibitionsPage() {
  const supabase = supabaseServerClient();
  const { data: rows } = await supabase
    .from("exhibitions")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false });
  const exhibitions = (rows as Exhibition[]) ?? [];

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
              return (
                <Link
                  key={ex.id}
                  href={`/exhibitions/${ex.slug}`}
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
