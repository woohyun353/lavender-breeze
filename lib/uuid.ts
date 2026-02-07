/** UUID v4 형식이면 true. slug vs id 조회 시 id 컬럼(UUID)에 비-UUID를 넣으면 PostgREST 400이 나므로 구분용. */
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
