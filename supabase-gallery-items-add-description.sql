-- Supabase SQL Editor에서 실행하세요.
-- gallery_items 테이블에 모달 캡션 창용 설명(description) 컬럼을 추가합니다.

ALTER TABLE public.gallery_items
ADD COLUMN IF NOT EXISTS description text;
