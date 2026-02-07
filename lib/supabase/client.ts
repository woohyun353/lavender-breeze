import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// 빌드 시(prerender)에는 env가 없을 수 있으므로, 첫 사용 시점에만 클라이언트 생성 및 검사
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  _client = createClient(url, key);
  return _client;
}

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string];
  },
});
