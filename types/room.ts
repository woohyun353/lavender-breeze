export type Room = {
  id: string;
  /** URL용 고유 문자열 (지정 가능). 없으면 id 사용 */
  slug?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  order?: number | null;
  exhibition_id: string;
  /** 'image' | 'text' – 갤러리 항목은 type이 'image'인 room만 선택 가능 */
  type?: string | null;
  /** 조인 시 전시명 (exhibitions.title) */
  exhibitions?: { title: string } | null;
};
