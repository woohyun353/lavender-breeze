-- Supabase SQL Editor에서 실행하세요.
-- 메인 페이지용 단일 행 테이블 (이미지 URL + 오프닝 글).

CREATE TABLE IF NOT EXISTS public.main_page (
  id text PRIMARY KEY DEFAULT 'main',
  main_image_url text,
  opening_text text,
  updated_at timestamptz DEFAULT now()
);

-- 초기 행 삽입 (없을 때만)
INSERT INTO public.main_page (id, main_image_url, opening_text)
VALUES ('main', null, null)
ON CONFLICT (id) DO NOTHING;

-- RLS: 누구나 조회, 로그인한 사용자만 수정
ALTER TABLE public.main_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "main_page_select_all"
  ON public.main_page FOR SELECT
  USING (true);

CREATE POLICY "main_page_update_authenticated"
  ON public.main_page FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "main_page_insert_authenticated"
  ON public.main_page FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
