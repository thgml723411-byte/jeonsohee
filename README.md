# STAGE — 무대 컨셉 포트폴리오

> 그동안 만든 작업물을 한 무대 위에 모아두는 개인 포트폴리오입니다.

## 컨셉

사이트 전체를 **하나의 공연**으로 구성했습니다.
관객(방문자)은 스크롤을 내리며 막(Act)을 하나씩 관람하고, 커튼콜로 퇴장합니다.

| 순서 | 섹션 (id) | 막 | 내용 |
| --- | --- | --- | --- |
| 1 | `#prologue` | Prologue | 은색 조명 빔과 나무 무대 바닥 위에 이름 · 한 줄 소개 |
| 2 | `#performer` | Act I · The Performer | 프로필 사진(은색 액자), 자기소개, 기본 정보, 한 문장 |
| 3 | `#repertoire` | Act II · Repertoire | 공연 프로그램북 형식의 기술 스택 |
| 4 | `#program` | Act III · The Program | 공연 티켓 모양의 작업물 카드 (가로 스크롤) |
| 5 | `#curtain-call` | Finale · Curtain Call | 감사 인사, 연락처, 앙코르(맨 위로) |

모든 섹션은 **한 화면(100vh)** 크기이며, `scroll-snap`으로 스크롤할 때 섹션 단위로 딱 맞춰집니다.

### 테마 색상 — 레드 · 블랙 · 실버 · 브라운

| 색 | 역할 | 토큰 |
| --- | --- | --- |
| 🟥 레드 | 벨벳 커튼, 티켓 | `--velvet` `#9b111e`, `--velvet-deep` `#4a070e` |
| ⬛ 블랙 | 객석의 어둠, 배경 | `--ink` `#0a0a0b`, `--ink-2` `#131012` |
| ⬜ 실버 | 조명, 강조 글자, 테두리 | `--silver` `#c7cbd1`, `--silver-soft` `#eef0f3` |
| 🟫 브라운 | 무대 바닥, 카드 배경, 보조 라벨 | `--brown` `#5a3a26`, `--brown-deep` `#24170f`, `--brown-light` `#b0896a` |

모든 색상은 `src/app/globals.css`의 `:root`에 모여 있습니다. 여기 값만 바꾸면 사이트 전체에 적용됩니다.

### 레퍼런스

- **[artpieent.com](https://artpieent.com/)** — 커튼이 열리는 인트로 (다시 구현 예정)
- **emetsound** — 배경을 클릭하면 꽃이 계속 생겨나는 인터랙션 (다시 구현 예정), 한 섹션 = 한 화면 구성, 프로필 소개 방식

## 앞으로 할 일

- [ ] **커튼 인트로** — 첫 버전을 삭제했습니다. 좀 더 세련된 방식으로 다시 만들 예정입니다.
- [ ] **클릭하면 피어나는 해바라기** — 첫 버전을 삭제했습니다. 다시 만들 예정입니다.
- [ ] 프로필 사진, 실제 작업물 링크 채우기

> 커튼 인트로를 다시 만들 때는 `components/intro/`, 해바라기는 `components/stage/`에 두면
> 지금 폴더 구조와 잘 맞습니다. `page.tsx`에서 `<main>`을 해바라기 무대 컴포넌트로 감싸면 됩니다.

## 지금 있는 연출

- **Spotlight** — 마우스를 따라다니는 은색 조명입니다. 터치 기기에서는 꺼집니다.
- **Prologue** — 페이지가 열리면 조명 빔이 켜지고, 이름과 소개가 차례로 떠오릅니다.
- **Header** — 지금 보고 있는 막을 자동으로 표시합니다 (IntersectionObserver).
- **Reveal** — 섹션 콘텐츠가 화면에 들어오면 아래에서 떠오르며 등장합니다.
- `prefers-reduced-motion` 설정을 켠 사용자에게는 애니메이션을 최소화해서 보여줍니다.

## 폴더 구조

```
project01/
├─ public/
│  ├─ images/            # 프로필 사진 등 이미지
│  └─ works/             # 예전 HTML 실습 파일을 여기에 복사 → /works/파일명.html 로 링크
└─ src/
   ├─ app/
   │  ├─ layout.tsx      # 폰트(Playfair Display · Noto Serif KR · Noto Sans KR), 메타데이터
   │  ├─ page.tsx        # 조명 → 헤더 → 섹션들
   │  └─ globals.css     # 색상 토큰, 리셋, scroll-snap, reduced-motion
   ├─ components/
   │  ├─ layout/
   │  │  ├─ Header.tsx / .module.css            # 상단 네비게이션
   │  │  └─ Spotlight.tsx / .module.css         # 마우스 조명
   │  ├─ common/
   │  │  ├─ Section.tsx / .module.css           # 100vh 섹션 틀 + 막 제목
   │  │  └─ Reveal.tsx / .module.css            # 스크롤 등장 애니메이션
   │  └─ sections/
   │     ├─ Hero.tsx       # Prologue
   │     ├─ Profile.tsx    # Act I   — 프로필
   │     ├─ Skills.tsx     # Act II  — 기술
   │     ├─ Works.tsx      # Act III — 작업물
   │     └─ Contact.tsx    # Finale  — 연락처
   ├─ data/              # ✏️ 내용 수정은 여기서만 하면 됩니다
   │  ├─ acts.ts         # 섹션 순서 · 이름 (헤더와 섹션이 함께 사용)
   │  ├─ profile.ts      # 이름, 소개, 사진, 링크
   │  ├─ skills.ts       # 기술 스택
   │  └─ works.ts        # 작업물 목록
   ├─ hooks/
   │  └─ useInView.ts    # 요소가 화면에 들어왔는지 감지
   └─ types/
      └─ portfolio.ts    # 공통 타입
```

## 내 정보로 바꾸기

1. **프로필** — `src/data/profile.ts`에서 `name`, `nameEn`, `role`, `tagline`, `intro`, `facts`, `links`를 수정합니다.
   이메일은 `mailto:본인@메일.com` 형식으로 적습니다.
2. **프로필 사진** — 사진을 `public/images/profile.jpg`에 넣고 `photo: "/images/profile.jpg"`로 지정합니다.
   사진이 없으면 영문 이름의 첫 글자가 대신 표시됩니다.
3. **작업물** — `src/data/works.ts`에 항목을 추가합니다.
   - 예전 HTML 실습 파일은 `public/works/`에 복사한 뒤 `href: "/works/canvas060801.html"`처럼 연결합니다.
   - GitHub · 배포 주소처럼 `http`로 시작하는 링크는 새 탭에서 열립니다.
   - `href`를 비워두면 `Coming Soon`으로 표시됩니다.
4. **기술 스택** — `src/data/skills.ts`를 수정합니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run start
```

## 기술 스택

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- CSS Modules (외부 UI · 애니메이션 라이브러리를 쓰지 않음)
- `next/font/google`로 폰트를 셀프 호스팅
