# 침몽도시: 루시드 다이버 — HTML 포트폴리오 기획서

Team REMnants | 기획 담당: 장수영 | 2026.06

---

## 개요

이 페이지는 Unity 팀 프로젝트 `침몽도시: 루시드 다이버`의 **포트폴리오 겸 게임 소개서/기획서 역할을 하는 HTML 페이지**입니다.

코치/퍼블리셔/팀원/포트폴리오 검토자가 단 한 페이지에서 이 프로젝트를 이해할 수 있도록 제작되었습니다.

---

## 실행 방법

```
index.html을 브라우저에서 열면 됩니다.
별도의 서버 설치 없이 정적으로 동작합니다.
```

> [!TIP]
> AI 에이전트나 로컬 자동화 브라우저 테스트 중 파일 접근 보안 정책(Access Blocked)이나 경로 매핑 문제로 로드에 실패할 경우, 다음 주소 형식을 사용하면 정상적으로 동작합니다:
> - **일반 웹 브라우저 직접 실행 시**: `file://localhost/C$/Project/Document_LucidDiver/docs/index.html`
> - **자동화 도구 / 보안 우회 필요 시 (Windows UNC)**: `\\localhost\C$\Project\Document_LucidDiver\docs\index.html`

---

## 폴더 구조

```
lucid-diver-web/
├─ index.html          ← 메인 페이지
├─ css/
│   └─ style.css       ← 다크 SF 테마 스타일시트
├─ js/
│   └─ main.js         ← Scroll-spy, 모바일 메뉴, 라이트박스
├─ assets/
│   ├─ images/         ← 웹용 이미지 (UI 레퍼런스, 개념 아트 등)
│   └─ downloads/      ← 다운로드 파일 (PPT 등)
└─ README.md
```

---

## 주요 섹션

| # | 섹션 | 내용 |
|---|---|---|
| 0 | Hero | 게임 소개 카피, CTA 버튼 |
| 1 | Project Overview | 프로젝트 기본 정보 표 |
| 2 | Core Pitch | 핵심 3대 경험 카드 |
| 3 | World | 침몽도시 세계관 |
| 4 | Controller | 플레이어 역할: 관제사 |
| 5 | Diver | 다이버 캐릭터 개념 + 비교표 |
| 6 | Yuan | 메인 다이버 유안 프로필 + 감정 변화 |
| 7 | Extraction | 익스트랙션 장르 설명 |
| 8 | Lucid Variation | 루시드 다이버식 변형 + 이중 보상 루프 |
| 9 | Core Loop | 전체 게임 흐름도 |
| 10 | Combat | 전투 순서도 |
| 11 | P0 Goal | P0 검증 목표 및 루프 |
| 12 | P0 Scope | P0-Core 구현 범위 |
| 13 | P0 Exclude | P0 제외 항목 |
| 14 | Screens | 주요 화면 7종 가이드 |
| 15 | Portfolio | 장수영 기획 담당 역할 |
| 16 | Downloads | 문서 다운로드 링크 |
| 17 | Feedback | 피드백 요청 질문 6개 |

---

## 디자인 테마

- **색상**: 다크 SF / 보라색 루시드 균열 / 시안 포인트 / 검은 배경
- **컴포넌트**: 반투명 패널, 카드, 플로우 다이어그램, 비교표
- **폰트**: Noto Sans KR (Google Fonts CDN)
- **반응형**: PC 좌측 사이드 네비게이션 / 모바일 햄버거 메뉴
- **기능**: Scroll-spy 활성 메뉴, 이미지 라이트박스, 맨 위로 버튼, 페이드인 애니메이션

---

## 사용 이미지 목록

| 파일명 | 용도 |
|---|---|
| hero_main.png | Hero 배경 |
| world_city.png | 세계관 / 프로젝트 개요 |
| control_room.png | 관제실 섹션 |
| yuan_standing.png | 유안 캐릭터 프로필 |
| extraction_diagram.png | 익스트랙션 개념 / 다이버 섹션 |
| salvation_concept.png | P0 목표 섹션 |
| return_log.png | (추가 참고용) |
| reward_loop.png | 이중 보상 루프 |
| ui_overall.png | (추가 참고용) |
| ui_lobby.png | 로비/관제실 UI |
| ui_sortie.png | 출격 준비 UI |
| ui_hud.png | 인게임 HUD |
| ui_result_success.png | 결과창 성공 |
| ui_result_fail.png | 결과창 실패 |
| ui_record.png | 다이버/기록 |
| ui_storage.png | 창고/인벤토리 |
| combat_flowchart.png | 전투 순서도 |

---

## 주의

- UI 이미지는 **목표 비주얼 레퍼런스**이며, 실제 구현 범위는 P0 시스템 명세서를 우선합니다.
- 별도의 회차 시스템은 P0에서 구현하지 않습니다.
- 여러 다이버 구원 시스템, 괴이 변질 캐릭터 전투는 P0 제외 항목입니다.

---

## 버전 정보

| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026.06.20 | v1.0.0 | 초안 완성 — 전체 섹션 구현, 이미지 연결, 반응형 적용 |
