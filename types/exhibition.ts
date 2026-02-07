export type Exhibition = {
  id: string;
  /** URL용 고유 문자열 (지정 가능). 없으면 id 사용 */
  slug?: string | null;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  order?: number | null;
};
