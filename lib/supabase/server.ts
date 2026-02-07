import { createClient } from "@supabase/supabase-js";

// 서버(서버 컴포넌트, route handlers, server actions 등)에서만 사용하는 Supabase 클라이언트
// 절대 클라이언트 번들로 나가면 안 되는 키이므로, 브라우저 코드에서 import 하지 마세요.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE env vars for server client");
}

export const supabaseServerClient = () =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

