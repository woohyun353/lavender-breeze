# Storage 이미지 업로드 "Failed to fetch" 해결

## 원인
브라우저에서 Supabase Storage로 요청은 나갔지만 응답을 받지 못할 때 발생합니다.

## 1. CORS 설정 확인 (가장 흔한 원인)

1. **Supabase 대시보드** → **Project Settings** (왼쪽 하단 톱니바퀴) → **API**
2. **CORS** 또는 **Allowed origins** 섹션에서 아래 주소가 포함되어 있는지 확인:
   - 로컬: `http://localhost:3000`
   - 배포 주소: `https://your-domain.com`
3. 없다면 **Add origin**으로 추가 후 저장.

또는 **Storage** → 사용 중인 버킷(`artworks`) → **Policies / Configuration**에서 CORS가 허용된 origin인지 확인합니다.

## 2. 네트워크 / 환경 확인

- **개발 서버**: `npm run dev`로 띄운 페이지에서 업로드하는지 확인.
- **파일 크기**: 너무 큰 이미지(예: 수 MB)는 제한에 걸릴 수 있으니, 1–2MB 이하로 시도.
- **브라우저**: 시크릿 모드나 확장 프로그램(광고 차단, 프라이버시 등)을 끄고 다시 시도.
- **개발자 도구** (F12) → **Network** 탭에서 실패한 요청을 클릭해 **Status**와 **Response** 확인.

## 3. 환경 변수 확인

`.env.local`에 다음이 올바르게 들어 있는지 확인:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

저장 후 **개발 서버를 재시작**했는지도 확인하세요.
