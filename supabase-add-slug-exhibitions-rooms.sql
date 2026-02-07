-- Supabase SQL Editor에서 실행하세요.
-- exhibitions, rooms 테이블에 URL용 slug 컬럼을 추가합니다.
-- 기존 행에는 id를 slug로 넣어 두고, 이후 어드민에서 원하는 문자열로 수정할 수 있습니다.

-- exhibitions
ALTER TABLE public.exhibitions
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 기존 행: slug가 비어 있으면 id로 채움
UPDATE public.exhibitions
SET slug = id
WHERE slug IS NULL;

-- rooms
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

UPDATE public.rooms
SET slug = id
WHERE slug IS NULL;
