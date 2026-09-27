// 사이트 설정. 값이 비어 있으면 그 기능은 화면에 나오지 않는다.
// 토큰·비밀번호는 여기에 넣지 않는다 (공개 저장소). 아래 값들은 공개돼도 되는 ID다.

export const SITE = {
  name: 'techlifego',
  title: 'techlifego — 기술로 가족 생활을 편하게',
  description: '기술로 가족 생활을 편하게. 아이와 나들이·놀이, 생활 속 AI 활용, 아빠의 기록을 씁니다.',
  url: 'https://techlifego.com',
  lang: 'ko',
  locale: 'ko_KR',
  author: 'techlifego',
  // 문의 이메일. 메일 받을 곳(예: Cloudflare 이메일 라우팅)을 연결한 뒤에 넣는다.
  contactEmail: 'blog@techlifego.com',
  // 네이버 서치어드바이저 소유 확인 (HTML 태그의 content 값). 비어 있으면 태그를 넣지 않는다.
  naverVerification: 'e0d84b48b42f0ff7efce8b0a363e5b0808d7ae2e',
};

export const SECTIONS = {
  family: {
    name: '가족 나들이·놀이',
    description: '아이와 함께 다녀온 곳, 집과 차 안에서 해 본 놀이를 기록합니다.',
  },
  ai: {
    name: '생활 속 AI',
    description: 'AI를 집안일·아이 공부·가족 여행에 써 본 이야기입니다.',
  },
  essay: {
    name: '아빠 에세이',
    description: '아이를 키우며 배우고 느낀 것을 씁니다.',
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;
export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

// 댓글 3종. 값이 비어 있으면 그 댓글 창은 표시되지 않는다.
export const COMMENTS = {
  // 라이브리 설치 코드의 data-uid 값
  livereUid: '',
  // giscus.app 에서 만든 값 (저장소 Discussions 켜기 + giscus 앱 설치 후)
  giscus: {
    repo: 'techlifego/blog',
    repoId: '',
    category: '',
    categoryId: '',
  },
  // 카카오 오픈채팅방 링크 (오픈프로필로 만든 방)
  openChatUrl: '',
};

// 구글 애드센스. 승인 후 'ca-pub-...' 값을 넣으면 광고 스크립트와 광고 자리가 켜진다.
export const ADSENSE = {
  client: '',
  // 글 안 광고 단위 ID (선택). 비어 있으면 자동 광고만 쓴다.
  inArticleSlot: '',
};
