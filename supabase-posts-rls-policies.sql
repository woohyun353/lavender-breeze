-- Supabase SQL Editor에서 실행하세요.
-- posts 테이블 RLS: 로그인한 사용자(admin)는 INSERT/UPDATE/DELETE, 비로그인은 SELECT만 허용.

-- 1) RLS가 켜져 있으면 정책만 추가. (이미 켜져 있는 경우가 많음)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2) 기존 정책이 있다면 이름이 겹치지 않도록 확인 후 실행. (이미 같은 이름이 있으면 오류 → 해당 줄만 제거하고 실행)

-- 누구나 조회 가능 (공개 페이지용)
CREATE POLICY "posts_select_all"
  ON public.posts FOR SELECT
  USING (true);

-- 로그인한 사용자만 추가
CREATE POLICY "posts_insert_authenticated"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 로그인한 사용자만 수정
CREATE POLICY "posts_update_authenticated"
  ON public.posts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 로그인한 사용자만 삭제
CREATE POLICY "posts_delete_authenticated"
  ON public.posts FOR DELETE
  USING (auth.role() = 'authenticated');
