"use client";

import { supabaseClient } from "@/lib/supabase/client";
import type { MainPage } from "@/types/main-page";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";

const STORAGE_BUCKET = "artworks";
const STORAGE_PREFIX_MAIN = "main_page";

function storageErrorMessage(err: { message?: string }): string {
  const msg = err?.message ?? "";
  if (msg.includes("Failed to fetch") || msg === "Failed to fetch") {
    return "네트워크 오류입니다. Supabase 대시보드 → Project Settings → API에서 CORS에 http://localhost:3000 을 추가했는지 확인해 주세요.";
  }
  return msg;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const mainPageFileInputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(true);

  const [mainPage, setMainPage] = useState<MainPage | null>(null);
  const [mainPageLoading, setMainPageLoading] = useState(true);
  const [mainPageImageFile, setMainPageImageFile] = useState<File | null>(null);
  const [mainPageOpeningText, setMainPageOpeningText] = useState("");
  const [mainPageSubmitting, setMainPageSubmitting] = useState(false);
  const [mainPageError, setMainPageError] = useState<string | null>(null);

  function fetchMainPage() {
    setMainPageLoading(true);
    void supabaseClient
      .from("main_page")
      .select("*")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("main_page fetch:", error);
          return;
        }
        setMainPage((data as MainPage) ?? null);
        setMainPageOpeningText((data as MainPage)?.opening_text ?? "");
      })
      .then(() => setMainPageLoading(false), () => setMainPageLoading(false));
  }

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (checking) return;
    fetchMainPage();
  }, [checking]);

  async function handleMainPageSave(e: React.FormEvent) {
    e.preventDefault();
    setMainPageError(null);
    setMainPageSubmitting(true);
    try {
      let mainImageUrl: string | null = mainPage?.main_image_url ?? null;
      if (mainPageImageFile) {
        const ext = (mainPageImageFile.name.split(".").pop() || "png").toLowerCase();
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
        const path = `${STORAGE_PREFIX_MAIN}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(path, mainPageImageFile, { upsert: true });
        if (uploadError) {
          setMainPageError("이미지 업로드 실패: " + storageErrorMessage(uploadError));
          setMainPageSubmitting(false);
          return;
        }
        const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        mainImageUrl = data.publicUrl;
      }
      const { error } = await supabaseClient
        .from("main_page")
        .upsert(
          {
            id: "main",
            main_image_url: mainImageUrl,
            opening_text: mainPageOpeningText.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      if (error) {
        setMainPageError("저장 실패: " + error.message);
        setMainPageSubmitting(false);
        return;
      }
      setMainPageImageFile(null);
      if (mainPageFileInputRef.current) mainPageFileInputRef.current.value = "";
      fetchMainPage();
      router.refresh();
    } catch (err) {
      setMainPageError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setMainPageSubmitting(false);
    }
  }

  async function handleSignOut() {
    await supabaseClient.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">확인 중…</p>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">대시보드</h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          로그아웃
        </button>
      </div>

      <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4">
        <Link
          href="/admin/exhibitions"
          className="flex items-center justify-between rounded-md px-3 py-3 text-neutral-700 hover:bg-neutral-50"
        >
          <span className="font-medium">전시 관리</span>
          <span className="text-neutral-400">→</span>
        </Link>
        <p className="px-3 pb-2 text-sm text-neutral-500">
          전시 · 전시실 · 갤러리 · 포스트를 계층별로 관리합니다.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">메인 페이지 세팅</h2>
        <p className="mb-4 text-sm text-neutral-500">
          메인 페이지의 이미지와 오프닝 글을 수정합니다.
        </p>
        {mainPageLoading ? (
          <p className="text-sm text-neutral-500">불러오는 중…</p>
        ) : (
          <form onSubmit={handleMainPageSave} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                메인 이미지
              </label>
              {mainPage?.main_image_url && (
                <div className="relative mb-2 h-32 w-48 overflow-hidden rounded border border-neutral-200">
                  <Image
                    src={mainPage.main_image_url}
                    alt="현재 메인 이미지"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              )}
              <input
                ref={mainPageFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setMainPageImageFile(e.target.files?.[0] ?? null)}
                className="w-full max-w-md text-sm text-neutral-600 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700"
              />
            </div>
            <div>
              <label htmlFor="main-opening-text" className="mb-1 block text-sm font-medium text-neutral-700">
                오프닝 글
              </label>
              <textarea
                id="main-opening-text"
                value={mainPageOpeningText}
                onChange={(e) => setMainPageOpeningText(e.target.value)}
                rows={6}
                className="w-full max-w-2xl rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
            {mainPageError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mainPageError}</p>
            )}
            <button
              type="submit"
              disabled={mainPageSubmitting}
              className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {mainPageSubmitting ? "저장 중…" : "저장"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
