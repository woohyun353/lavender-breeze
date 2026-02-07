-- Supabase SQL Editor에서 실행하세요.
-- rooms 테이블에 전시 카드용 컬럼을 추가합니다.

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS subtitle text;

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS cover_image_url text;

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS "order" int4 DEFAULT 0;
