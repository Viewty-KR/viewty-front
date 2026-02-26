# Viewty (뷰티)

> **"나만의 아름다움을 찾는 가장 스마트한 방법"**  
> AI 설문 기반의 맞춤형 제품 큐레이션 및 AR 가상 메이크업 플랫폼

---

## Project Overview

**Viewty**는 정보 과잉의 시대에서 사용자가 자신의 피부 타입과 취향에 꼭 맞는 화장품을 찾지 못하는 문제를 해결하기 위해 개발되었습니다. 정교한 설문을 통한 **개인화 추천 엔진**과 구매 전 가상으로 체험해 볼 수 있는 **실시간 AR Try-on** 기능을 통해 새로운 뷰티 쇼핑 경험을 제공합니다.

---

## Key Features

### 1. 맞춤형 큐레이션 (Personalized Recommendation)

- **AI 설문 조사**: 사용자의 피부 타입, 고민, 선호하는 스타일을 분석합니다.
- **데이터 기반 매칭**: 분석된 데이터를 바탕으로 최적의 성분과 제품을 매칭하여 메인 화면에 노출합니다.

### 2. AR 가상 메이크업 (Real-time AR Try-on)

- **DeepAR Engine 통합**: 고성능 얼굴 인식 및 트래킹 기술을 통해 립스틱 등 메이크업 제품을 실시간으로 얼굴에 적용해 봅니다.
- **즉각적인 피드백**: 제품의 발색과 느낌을 구매 전에 미리 확인하여 쇼핑 실패율을 줄입니다.

### 3. 스마트 제품 정보 및 리뷰

- **성분 분석**: 화장품의 주요 성분을 한눈에 파악할 수 있도록 시각화합니다.
- **실사용자 커뮤니티**: 신뢰도 높은 리뷰 시스템을 통해 제품 정보를 공유합니다.

---

## 🛠 Tech Stack

### **Frontend & Mobile**

- <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=Expo&logoColor=white"/>: Cross-platform 효율성 극대화 (v54.0.32)
- <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>: 코드 안정성 및 유지보수성 확보
- <img src="https://img.shields.io/badge/Expo%20Router-000000?style=flat-square&logo=Expo&logoColor=white"/>: 파일 기반 라우팅 시스템 도입

### **Core Technologies**

- **AR Solution**: `DeepAR` (React Native SDK)
- **State Management**: `Context API` & `Custom Hooks`
- **Security**: `Expo Secure Store` (JWT 기반 보안 인증)
- **Performance**: `React Native Reanimated` & `Lottie` (부드러운 UX 애니메이션)

---

## Architecture & Project Structure

관심사 분리(SoC)와 모듈화를 고려하여 설계된 프로젝트 구조입니다.

```bash
viewty-front/
├── 📂 app/                 # Expo Router 기반의 페이지 및 레이아웃
│   ├── (tabs)/             # 하단 탭 네비게이션 (홈, 카테고리, 프로필)
│   ├── auth/               # 사용자 인증 (로그인, 회원가입, 설문조사)
│   ├── product/            # 제품 관련 화면 ([id] 상세, 리스트)
│   └── ar2/                # DeepAR 기반 가상 메이크업 구현부
├── 📂 assets/              # 정적 자원 (이미지, 아이콘, 폰트)
├── 📂 components/          # 공통 UI 컴포넌트
│   ├── ui/                 # 원자 단위(Atomic) 디자인 컴포넌트
│   └── Skeletons.tsx       # 데이터 로딩 상태 대응 UI
├── 📂 constants/           # 전역 상수 (테마 컬러, 라우트 정의)
├── 📂 hooks/               # 비즈니스 로직 재사용을 위한 커스텀 훅
│   ├── useProducts.ts      # 제품 데이터 페칭 및 관리
│   └── useToken.ts         # JWT 인증 토큰 관리
├── 📂 libs/                # 외부 라이브러리 설정 (Axios API 등)
├── 📂 screens/             # 복잡한 화면의 스타일 및 유틸리티 분리
│   ├── home/               # 메인 화면 전용 스타일 및 로직
│   └── auth/               # 인증/설문 단계별 컴포넌트 관리
├── 📂 src/contexts/        # 전역 상태 관리 (Auth, Theme 등)
├── 📂 scripts/             # 프로젝트 초기화 및 자동화 스크립트
├── 📄 app.config.js        # Expo 동적 환경 설정 (Native 연동)
└── 📄 package.json         # 프로젝트 의존성 및 스크립트
```
