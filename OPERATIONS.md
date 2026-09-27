# 운영 설명서 (OPERATIONS)

**이 저장소에서 일하는 세션은 이 파일부터 읽는다.**

techlifego.com — "기술로 가족 생활을 편하게". Astro 정적 사이트, Cloudflare Pages 자동 배포.

## 0. 꼭 지킬 것

- 이 저장소는 **공개**다. 파일·커밋 메시지·커밋 작성자 어디에도 운영자 실명, 개인 GitHub 계정 이름, 본업, 사는 지역, 가족 이름·얼굴을 넣지 않는다.
- 커밋 작성자는 이 저장소에서만 아래로 설정한다 (클론할 때마다 확인):
  ```sh
  git config user.name "techlifego"
  git config user.email "blog@techlifego.com"
  ```
- 토큰·비밀번호·API 키는 **값을 절대 적지 않는다** (파일에도, 채팅에도). 자리만 적는다 (아래 5번).
- 건강·의료 조언 글은 쓰지 않는다.
- 글은 **운영자가 "올려"라고 승인한 것만** 발행한다.

## 1. 구조

```
src/
  site.config.ts        사이트 이름·구역·댓글·애드센스 설정 (빈 값 = 꺼짐)
  content.config.ts     글 머리말 형식
  content/posts/*.md    글 (파일 이름 = 주소 슬러그, 영어 소문자-하이픈)
  pages/
    index.astro         첫 화면
    [section]/index.astro   구역 첫 화면 (/family/ /ai/ /essay/)
    [section]/[slug].astro  글 화면 (/구역/슬러그/)
    [section]/rss.xml.js    구역별 RSS
    rss.xml.js          전체 RSS
    about.md privacy.md contact.astro  필수 페이지
    robots.txt.js 404.astro
  components/           Comments(댓글 3종), AdSlot(광고), PostList
  layouts/              Base(메타·OG·canonical·JSON-LD), Page
scripts/check-post.mjs  발행 전 점검
public/                 그대로 복사되는 파일 (favicon, 나중에 ads.txt·이미지)
```

- 구역: `family` 가족 나들이·놀이 · `ai` 생활 속 AI · `essay` 아빠 에세이
- 사이트맵(`/sitemap-index.xml`)은 빌드 때 자동 생성.

### 글 머리말

```yaml
---
title: 글 제목
description: 검색 결과에 보일 설명 (160자 이하)
section: family        # family | ai | essay
pubDate: 2026-10-02
updatedDate: 2026-10-05  # 고쳤을 때만
draft: false           # true면 배포 사이트에 안 나옴
tags: [차 안 놀이, 퀴즈]
image: /images/slug/cover.jpg  # 선택, 공유 이미지
---
```

## 2. 글 발행 순서

1. **볼트 초안**: 운영자의 비공개 볼트 `50-publishing/drafts/`에서 쓰고 다듬는다.
2. **점검**: `npm run check:post -- <볼트 초안 경로>` → ❌ 0개가 될 때까지 고친다. ⚠️는 한 줄씩 읽고 판단.
3. **운영자 승인**: 운영자가 읽고 "올려".
4. **올리기**: `src/content/posts/<english-slug>.md`로 옮긴다 (볼트용 머리말은 위 형식으로 바꾼다). 이미지는 `public/images/<slug>/`에, **EXIF(위치 정보) 지우고**, 아이 얼굴·이름표·차 번호판 없는지 확인.
5. 다시 `npm run check:post` → `npm run build` 통과 확인.
6. 커밋 → `git push origin main` → **Cloudflare Pages가 자동 배포** (1~2분).
7. 볼트 `50-publishing/publishing-log.md`에 발행 기록 요청 (본부 세션 담당).

### 발행 전 점검 스크립트

- 공개 규칙(연락처·주소·번호판·학교·의료 효과 표현·사진)은 스크립트 안에 있다.
- **개인 금지어 목록**(실명·가족 이름·본업·사는 지역)은 공개 저장소에 둘 수 없어 **볼트**에 있다: `60-projects/blog/private-words.txt`.
  스크립트는 `BLOG_PRIVATE_WORDS` 환경변수 → `../life-plan/60-projects/blog/private-words.txt` 순으로 찾는다. 못 찾으면 실패한다.
- 이 저장소만 클론한 세션은 볼트도 함께 클론해 옆에 두거나 환경변수로 위치를 알려 준다.

## 3. 배포

- Cloudflare Pages 프로젝트가 이 저장소 `main` 브랜치와 연결돼 있다. **푸시하면 자동 배포.**
- 빌드 설정: 프레임워크 Astro · 빌드 명령 `npm run build` · 출력 폴더 `dist` · Node 버전은 `.node-version`(22).
- 다른 브랜치에 푸시하면 미리보기 주소가 생긴다 (큰 변경 확인용).
- 로컬 확인: `npm install` → `npm run dev` (초안도 보임). 초안까지 빌드: `SHOW_DRAFTS=1 npm run build`.

## 4. 켜고 끄는 기능 (`src/site.config.ts`)

| 기능 | 값 | 비어 있으면 |
|---|---|---|
| 문의 이메일 | `SITE.contactEmail` | 문의 페이지에 안 나옴 |
| 라이브리 댓글 | `COMMENTS.livereUid` (설치 코드의 `data-uid`) | 안 나옴 |
| Giscus 댓글 | `COMMENTS.giscus.repoId/category/categoryId` (giscus.app에서 생성) | 안 나옴 |
| 오픈채팅 버튼 | `COMMENTS.openChatUrl` | 안 나옴 |
| 애드센스 | `ADSENSE.client` (`ca-pub-…`), 글 안 광고는 `inArticleSlot`도 | 광고 스크립트 없음 |

- 댓글 스크립트는 댓글 자리가 화면에 가까워질 때만 불러온다 (첫 화면 속도 유지).
- 애드센스 **승인 후**: `ADSENSE.client` 입력 + `public/ads.txt` 만들기
  (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` — 숫자는 애드센스 화면의 값).
- Giscus를 켜려면: 저장소 Settings → Discussions 켜기, giscus 앱을 이 저장소에 설치, giscus.app에서 값 받기.

## 5. 계정·토큰 위치 (값은 적지 않는다)

| 무엇 | 어디에 | 누가 |
|---|---|---|
| 도메인 `techlifego.com` | Cloudflare Registrar (자동 갱신, WHOIS 가림) | 운영자 로그인·결제 |
| 배포 | Cloudflare 대시보드 → Workers & Pages → 이 저장소 프로젝트 | 운영자 로그인 (2단계 인증) |
| 코드 | GitHub 조직 `techlifego` / 저장소 `blog` | 조직 소유자 = 운영자 |
| 라이브리 관리자 | livere.com 관리자 페이지 | 운영자 |
| 오픈채팅 | 카카오톡 오픈프로필 방 | 운영자 |
| 애드센스·서치콘솔 | Google 계정 (블로그용) | 운영자 |
| 네이버 서치어드바이저 | 네이버 계정 | 운영자 |
| API 토큰 (필요해질 때만) | Claude 환경 설정의 비밀값 칸 또는 Cloudflare 대시보드. **저장소·채팅에 붙이지 않는다** | 운영자가 직접 입력 |

지금 배포에는 토큰이 필요 없다 (Cloudflare가 GitHub 앱으로 저장소를 읽는다).

## 6. 하지 않는 것

- 유료 테마, 무거운 외부 스크립트, 분석 도구 여러 개 붙이기
- Cloudflare **Bot Fight Mode** 켜기 (검색·광고 크롤러를 막을 수 있다)
- 글 주소(슬러그) 바꾸기 — 바꿔야 하면 `public/_redirects`에 옛 주소 → 새 주소를 적는다
