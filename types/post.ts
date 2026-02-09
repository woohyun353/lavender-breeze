export type Post = {
  id: string;
  room_id: string | null;
  title: string;
  subtitle?: string | null;
  content: string | null;
  thumbnail: string | null;
  order: number | null;
};
