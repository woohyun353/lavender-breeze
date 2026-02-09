-- Supabase SQL Editor에서 실행하세요.
-- posts 테이블에 부제(subtitle) 컬럼을 추가합니다. 포스트 상세보기 제목 아래에 표시용.

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS subtitle text;
