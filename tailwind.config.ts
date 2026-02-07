/**
 * Tailwind v4는 CSS 우선 설정(@theme in globals.css)을 사용합니다.
 * 이 파일은 디자인 토큰 참고용이며, 실제 테마는 app/globals.css에 정의되어 있습니다.
 */
export default {
  theme: {
    extend: {
      colors: {
        background: "#faf7f2",
        panel: "#ebe8e2",
        body: "#1a1a1a",
      },
      maxWidth: {
        read: "65ch",
      },
      spacing: {
        section: "2rem",
      },
    },
  },
};
