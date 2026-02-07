import Image from "next/image";
import { supabaseServerClient } from "@/lib/supabase/server";

// TODO: 버킷 이름만 본인 Storage 버킷에 맞게 수정
const BUCKET_NAME = "artworks"; // 파일이 들어 있는 버킷 이름
const IMAGE_PATH = "emoji-alchemist-1763623834015.png";

export default async function StorageTestPage() {
  const supabase = supabaseServerClient();

  // public bucket 기준: getPublicUrl 사용
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(IMAGE_PATH);
  const imageUrl = data.publicUrl;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-12">
      <h1 className="text-2xl font-bold">Supabase Storage 테스트</h1>

      <div className="w-full rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
        <p>
          <span className="font-semibold">Bucket</span>: {BUCKET_NAME}
        </p>
        <p>
          <span className="font-semibold">Path</span>: {IMAGE_PATH}
        </p>
        <p className="mt-2 break-all">
          <span className="font-semibold">Public URL</span>: {imageUrl}
        </p>
      </div>

      {/* 이미지 프리뷰 */}
      <div className="relative h-80 w-full max-w-xl overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
        <Image
          src={imageUrl}
          alt="Supabase Storage 이미지"
          fill
          className="object-contain"
        />
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        버킷이 public 이어야 위 이미지가 보입니다. private 버킷일 경우에는
        signed URL을 사용해야 합니다.
      </p>
    </main>
  );
}

