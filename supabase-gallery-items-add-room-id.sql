-- Supabase SQL Editor에서 실행하세요.
-- gallery_items 테이블에 room_id 컬럼이 없을 때 추가합니다.

-- room_id 컬럼 추가 (rooms.id가 uuid면 아래 첫 줄, text면 두 번째 줄 중 하나만 실행)
ALTER TABLE public.gallery_items
ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE;

-- rooms.id가 text 타입이면 위 대신 아래 사용 후, 위 ALTER는 실행하지 마세요.
-- ALTER TABLE public.gallery_items
-- ADD COLUMN IF NOT EXISTS room_id text REFERENCES public.rooms(id) ON DELETE CASCADE;
