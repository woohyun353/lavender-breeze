export type GalleryItem = {
  id: string;
  room_id: string;
  image_url: string | null;
  caption: string | null;
  /** 모달 캡션 창에 표시할 설명 (여러 줄 가능) */
  description: string | null;
  order: number | null;
  /** 조인 시 전시실명 (rooms.title) */
  rooms?: { title: string } | null;
};
