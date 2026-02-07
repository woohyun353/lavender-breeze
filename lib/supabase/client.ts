import { createClient } from "@supabase/supabase-js";

// 브라우저/클라이언트에서 사용하는 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // 개발 단계에서 env 설정 안 했을 때 빨리 알아차리기 위함
  // (프로덕션에서는 빌드 단계에서 잡히는 것이 좋음)
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

