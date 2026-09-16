# ROI 시뮬레이터

장비 도입 시의 투자 회수기간(Payback Period)과 ROI를 그 자리에서 계산·비교하는 웹 애플리케이션입니다. 여러 장비의 도입 조건(가격, 시술가, 소모품 비용 등)을 입력하면 회수기간·월 순이익·ROI를 숫자와 그래프로 동시에 보여주고, 결과를 A4 한 장으로 인쇄할 수 있습니다.

## 주요 기능

- 장비 도입가·시술가·소모품 조건 입력 → 회수기간·ROI 자동 계산
- 최소 2개 이상 장비를 동시에 비교 (레이아웃이 깨지지 않는 범위 내)
- 무상 제공 소모품만으로 얻는 수익 별도 계산
- 누적 손익 추이 그래프
- 보수/공격 시나리오와 손익분기 건수 — 가정이 빗나갔을 때의 결과를 함께 제시
- 결과 화면 A4 인쇄 지원
- Supabase Auth 기반 매직링크(비밀번호 없음) 로그인 — 등록된 이메일만 접근 가능

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript (strict)
- Tailwind CSS 4
- [Supabase Auth](https://supabase.com/docs/guides/auth) — 로그인 게이트 전용, 계산 데이터는 저장하지 않음
- [Vercel](https://vercel.com) 배포

## 개발 환경 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채워주세요 (Supabase 프로젝트 대시보드 → Settings → API Keys에서 확인).

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

로그인 계정은 회원가입 화면 없이, Supabase 대시보드(Authentication → Users)에서 관리자가 직접 생성합니다.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |

## 주의

계산 결과는 입력한 가정에 따른 추정치이며 실제 수익을 보장하지 않습니다.
