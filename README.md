# 💊 YOYAK (요약) — 복약지도 요약 앱

> 처방전·알약 촬영 한 번으로, AI가 복약지도를 쉽게 요약해 드립니다.

YOYAK은 고령자·환자·보호자를 위한 **모바일 복약지도 요약 서비스**입니다.  
카메라로 알약이나 처방전을 촬영하면 OCR과 AI가 약 정보를 분석하고, 누구나 이해할 수 있는 쉬운 말로 복약지도를 요약해 줍니다.

---

## ✨ 주요 기능

### 📷 알약 / 처방전 인식
- 알약 직접 촬영 (원형 가이드 제공)
- 처방전·약봉투 촬영 (사각 가이드 프레임, 85vw × 60vh)
- 갤러리 이미지 업로드
- OCR 분석 → 약 이름 자동 추출

### 🤖 복약지도 AI 요약
- 식약처 e약은요 공공 API 연동 (효능, 용법, 부작용, 주의사항)
- AI 기반 환자 맞춤 요약 생성
- 시니어 모드: 큰 글씨 + 쉬운 말 복약지도

### 🔊 TTS 음성 안내
- 서버 TTS API 우선 사용
- 실패 시 Web Speech API 자동 폴백
- 재생 진행률 표시

### 📅 복약 스케줄 관리
- 약별 복용 시간 설정
- 캘린더 기반 스케줄 관리
- 복약 시간 알림 (브라우저 Notification + 인앱 배너)
- 30초 주기 체크, 자정 자동 리셋

### 💬 AI 상담
- AI 채팅 기반 약 관련 질의응답
- 복용 중인 약 정보 기반 맞춤 상담

### 👴 시니어 모드
- 전역 큰 글씨·큰 버튼 모드
- `body.senior-mode` CSS 클래스 토글
- localStorage 기반 설정 유지

### 🌐 다국어 지원
- 한국어 / 영어 (i18next)
- 브라우저 언어 자동 감지

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | React 18 + Vite + TypeScript |
| **상태 관리** | React Context + React Query (@tanstack/react-query) |
| **UI** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **라우팅** | React Router v6 |
| **API 통신** | Axios (JWT 인터셉터, 토큰 자동 갱신) |
| **백엔드 API** | FastAPI + Tortoise ORM + MySQL + Redis |
| **클라우드 DB** | Supabase (Lovable Cloud) — 약 정보, 스케줄, 상호작용 데이터 |
| **Edge Functions** | Deno (식약처 API 프록시, 복약지도 번들 생성) |
| **다국어** | i18next + react-i18next |
| **앱 프레임워크** | @apps-in-toss/web-framework (토스 WebView 연동) |

---

## 📁 폴더 구조

```
src/
├── api/                      # FastAPI 백엔드 API 클라이언트
│   ├── client.ts             #   Axios 인스턴스 (인터셉터, 토큰 리프레시)
│   ├── auth.ts               #   인증 API (login, signup, getMe)
│   └── medicine.ts           #   약 관련 API (guide, recognize, TTS, history)
│
├── components/               # 재사용 컴포넌트
│   ├── BottomNav.tsx          #   하단 네비게이션 (홈/스캔/스케줄/AI/설정)
│   ├── PrivateRoute.tsx       #   인증 가드
│   ├── PillRecognizer.tsx     #   알약 촬영/업로드 → 약 이름 인식
│   ├── TTSPlayer.tsx          #   TTS 음성 재생 (서버 + Web Speech 폴백)
│   ├── AlarmBanner.tsx        #   복약 알림 배너
│   ├── AlarmPermissionPrompt.tsx  # 알림 권한 요청
│   └── ui/                    #   shadcn/ui 기본 컴포넌트
│
├── contexts/                 # React Context
│   ├── AuthContext.tsx         #   인증 상태 (JWT, 데모 모드 폴백)
│   └── SeniorModeContext.tsx   #   시니어 모드 on/off
│
├── hooks/                    # 커스텀 훅
│   ├── useMedicationAlarm.ts  #   복약 알람 로직 (30초 주기, 브라우저 푸시)
│   └── use-mobile.tsx         #   모바일 반응형 감지
│
├── i18n/                     # 다국어
│   ├── index.ts
│   └── locales/
│       ├── ko.json            #   한국어
│       └── en.json            #   영어
│
├── integrations/
│   └── supabase/             # Lovable Cloud (Supabase) 클라이언트
│
├── pages/                    # 페이지 컴포넌트 (18개)
│   ├── Onboarding.tsx         #   앱 소개
│   ├── Login.tsx / Signup.tsx #   인증
│   ├── Home.tsx               #   메인 대시보드
│   ├── CaptureMethod.tsx      #   입력 방식 선택
│   ├── PillCamera.tsx         #   알약 촬영
│   ├── PrescriptionCamera.tsx #   처방전 촬영
│   ├── FileUpload.tsx         #   파일 업로드
│   ├── OcrProcessing.tsx      #   OCR 분석 중
│   ├── OcrResultCheck.tsx     #   인식 결과 확인
│   ├── OcrResultEdit.tsx      #   약 정보 수정/저장
│   ├── MedicationTimeSetup.tsx#   복약 시간 설정
│   ├── MedicationSchedule.tsx #   스케줄 캘린더
│   ├── MedicationGuide.tsx    #   복약지도 상세
│   ├── SilverModeGuide.tsx    #   시니어 모드 복약지도
│   ├── TtsPlayer.tsx          #   TTS 페이지
│   ├── AiChat.tsx             #   AI 상담
│   └── Settings.tsx           #   설정
│
├── types/                    # TypeScript 타입
│   ├── user.ts                #   User, LoginRequest 등
│   └── medicine.ts            #   Medicine, GuideResponse 등
│
├── utils/
│   └── toss.ts               # 토스 앱 유틸리티
│
└── assets/                   # 정적 리소스

supabase/
└── functions/                # Edge Functions (Deno)
    ├── guide/index.ts         #   복약지도 번들 생성
    └── mfds-search/index.ts   #   식약처 e약은요 API 프록시
```

---

## 🔀 사용자 흐름 (User Flow)

```
온보딩(/) → 로그인(/login) → 홈(/home)
                                  │
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
             캡처 방식 선택    스케줄 확인     AI 상담
             (/capture)      (/schedule)    (/ai-chat)
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 알약 촬영    처방전 촬영    파일 업로드
(/camera/    (/camera/      (/upload)
  pill)      prescription)
      │            │            │
      └────────────┼────────────┘
                   ▼
            OCR 분석 중 (/processing)
                   ▼
            결과 확인 (/result/check)
                   ▼
            정보 수정 (/result/edit)
                   ▼
            시간 설정 (/setup/time)
                   ▼
            복약지도 확인 (/guide/:id)
             ├─ 시니어 모드 (/guide/:id/silver)
             └─ TTS 듣기 (/guide/:id/tts)
```

---

## 🔌 API 연결 구조

### FastAPI 백엔드 (`http://localhost/api/v1`)

| 기능 | Method | Endpoint |
|------|--------|----------|
| 회원가입 | `POST` | `/auth/signup` |
| 로그인 | `POST` | `/auth/login` |
| 토큰 갱신 | `GET` | `/auth/token/refresh` |
| 내 정보 조회 | `GET` | `/users/me` |
| 내 정보 수정 | `PATCH` | `/users/me` |
| 복약지도 생성 | `POST` | `/medicines/guide` |
| 복약지도 조회 | `GET` | `/medicines/guide/:id` |
| 복약 이력 | `GET` | `/medicines/history` |
| 알약 이미지 인식 | `POST` | `/medicines/recognize` |
| TTS 생성 | `POST` | `/medicines/tts` |

### Supabase Edge Functions

| 함수 | 역할 |
|------|------|
| `guide` | medications + drug_info_chunks(RAG) 조합 → 복약지도 번들 반환 |
| `mfds-search` | 식약처 e약은요 공공 API 검색 프록시 |

### 인증 방식
- JWT Bearer 토큰 (localStorage 저장)
- 401 응답 시 httpOnly cookie 기반 자동 리프레시
- 리프레시 중 동시 요청 대기 큐 패턴 적용

---

## 🚀 로컬 개발 실행

### 사전 요구사항
- Node.js 18+
- Bun (패키지 매니저)

### 설치 및 실행

```bash
# 저장소 클론
git clone <YOUR_GIT_URL>
cd yoyak

# 의존성 설치
bun install

# 개발 서버 실행
bun run dev
```

개발 서버: `http://localhost:5173`

### 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다:

```env
# FastAPI 백엔드 URL
VITE_API_URL=http://localhost/api/v1

# Supabase (Lovable Cloud에서 자동 제공)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> **참고**: Lovable Cloud 환경에서는 Supabase 관련 변수가 자동 설정됩니다.  
> FastAPI 백엔드가 없어도 **데모 모드**로 기본 UI를 확인할 수 있습니다.

---

## 📱 WebView (앱인토스) 실행

이 프로젝트는 **토스 앱 내 WebView** 환경을 지원합니다.

### 설정 (`granite.config.ts`)
```ts
defineConfig({
  appName: 'yoyak',
  brand: {
    displayName: '요약',
    primaryColor: '#7C9A7E',
  },
})
```

### 모바일 UI 고려사항
- **Safe Area 패딩**: 노치·하단바 영역 자동 대응
- **하단 네비게이션**: 모바일에서만 표시 (`lg:hidden`)
- **카메라 접근**: `getUserMedia` API + `<input capture="environment">` 이중 지원
- **촬영 가이드**: 처방전(사각형), 알약(원형) 오버레이 제공
- **시니어 모드**: 전역 폰트/버튼 크기 증가

---

## 📊 데이터베이스 구조 (Supabase)

| 테이블 | 역할 |
|--------|------|
| `medications` | 약 정보 (이름, 용량, 효능, 부작용, 식약처 코드) |
| `schedules` | 복약 스케줄 (날짜, 시간, 복용 여부) |
| `drug_info_chunks` | 약 정보 RAG 청크 (효능, 주의사항 등 분할 저장) |
| `interaction_matrix` | 약물 상호작용 매트릭스 |
| `interaction_warnings` | 병용 금기 경고 |
| `profiles` | 사용자 프로필 (알레르기, 기저질환, 비상연락처) |
| `patient_links` | 환자-보호자 연결 (초대코드 기반) |
| `user_roles` | 사용자 역할 (patient / caregiver) |

---

## 🏗 아키텍처 다이어그램

```
┌─────────────────────────────────────────────┐
│           React Frontend (Vite)             │
│                                             │
│  api/client.ts ──── Axios ──────────────────┼──→ FastAPI Backend
│    ├── auth.ts      (Bearer JWT)            │      ├── /auth/*
│    └── medicine.ts  (auto refresh)          │      ├── /users/*
│                                             │      └── /medicines/*
│                                             │
│  supabase/client.ts ────────────────────────┼──→ Supabase (Lovable Cloud)
│    ├── DB queries (medications, schedules)  │      ├── PostgreSQL
│    └── Edge Functions                       │      └── Edge Functions
│         ├── guide (복약지도 번들)            │           └── mfds-search
│         └── mfds-search (식약처 API)        │
└─────────────────────────────────────────────┘
```

---

## 📝 라이선스

이 프로젝트는 비공개 프로젝트입니다.

---

## 🤝 기여

1. 이 레포를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다
