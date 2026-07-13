# 침몽도시: 루시드 다이버 — 문서 × Unity 교차검증 종합 분석 보고서

**분석 일자**: 2026-07-13  
**프로젝트 기준**: P0.5 알파 빌드 (버그 리포트 v2.0.0 기준)  
**보고서 버전**: v1.0.0

---

## 1. Executive Summary

### 현재 프로젝트 단계
P0.5 알파 빌드 완료, P1 진입 검토 단계

### P0 안정성
P0 기능 티켓 36건 중 35건 완료 (**97%**). 핵심 PvE 익스트랙션 루프(로비→출격→전투→아이템 획득→탈출→결과정산→로비복귀)는 구현 완료. 다만, 동조율 저장/로드 사이클(LS-07)에서 `hasNewMemoryLog` 영속성 미보장으로 1건 부분 완료.

### P0.5 구현률
P0.5 확장 기능 20건 중 17건 완료, 3건 부분 구현 (**85%**). 시간 제한, 달리기, 구르기, 아티팩트, 스킬, 에너미 AI FSM, 소음 시스템, 루시드 낙인, 각성 보존 슬롯 등 핵심 확장 기능 대부분 구현 확인.

### P1 준비도
**조건부 진입 가능**. 7건의 P1 블로커 중 물리 관통(B-01), 피격 판정 누락(B-02), Addressable 키 누락(B-03)은 반드시 해결 필요.

### 가장 큰 강점
- 모듈형 에너미 AI(EnemyBrain/Perception/Memory/Combat/Locomotion) 구조가 우수하여 P1 확장에 유리
- 이벤트 버스 기반 시스템 연동(GlobalEventBus)으로 느슨한 결합 달성
- JSON 기반 데이터 리포지토리로 SO 의존성 탈피 완료

### 가장 큰 위험
- **벽 관통 문제** 5건 연관 — 적 이동/돌진/구르기/Raycast 모두에서 벽 Collider 무시
- **동조율 데이터 동기화** 실패 — 로비 복귀/앱 재시작 시 Lv.0 초기화

### 즉시 해결해야 할 문제 TOP 5
1. 벽 관통 (적/플레이어/Raycast) — QA-PM-002,004,006,007, QA-CD-007
2. 피격 판정 누락 (총알→체력 미감소) — QA-TD-004
3. Addressable 키 누락 (FrozenClockwork) — QA-CD-004
4. 동조율 로비 미반영 + 앱 재시작 초기화 — QA-CD-002,005, QA-TD-005
5. 결과창 중 인벤토리 열림 → UI 고장 — QA-TD-003

### P1 진입 최종 판단
> **조건부 P1 진입 가능** — 상기 TOP 5 문제 해결 및 3회 연속 QA 통과를 전제로 P1 진입 권장.

---

## 2. 분석 범위 및 조사 방법

### 2.1 조사한 문서 목록

| # | 문서명 | 경로 | 버전 | 상태 |
|:---:|:---|:---|:---:|:---:|
| D-01 | 최종 P0 정의서 | `01_SSOT_최종_기준문서/00_최종_P0_정의서.md` | P0_0.05 | SSOT |
| D-02 | P0 시스템 명세서 | `01_SSOT_최종_기준문서/01_P0_시스템_명세서.md` | P0_0.05 | 검수전 |
| D-03 | P0.5 시스템 명세서 | `01_SSOT_최종_기준문서/02_P0.5_시스템_명세서.md` | v0.2 | 활성 |
| D-04 | P0 개발자 구현명세서 | `01_SSOT_최종_기준문서/02_P0_개발자_구현명세서.md` | - | 활성 |
| D-05 | P0 QA 체크리스트 | `01_SSOT_최종_기준문서/04_P0_QA_체크리스트.md` | v0.1 | 활성 |
| D-06 | P0 기능 티켓 목록 | `02_개발_전달용/P0_기능_티켓_목록.md` | v0.1 | 활성 |
| D-07 | P0 UI 플로우 | `02_개발_전달용/P0_UI_플로우.md` | - | 활성 |
| D-08 | P0 데이터 변수표 | `02_개발_전달용/P0_데이터_변수표.md` | - | 활성 |
| D-09 | P0 테스트케이스 | `02_개발_전달용/P0_테스트케이스.md` | - | 활성 |
| D-10 | P0 리소스 요구사항 | `02_개발_전달용/P0_리소스_요구사항.md` | - | 활성 |
| D-11 | 버그 리포트 v2.0.0 | `검수/20260710_P0.5 알파_버그 리포트_v2.0.0.md` | v2.0.0 | 최신 |

### 2.2 조사한 Unity 자산

| 분류 | 조사 범위 | 방법 |
|:---|:---|:---|
| MonoScript | 633개 전수 목록 확보 | `find_gameobjects assetType:MonoScript` |
| Prefab | 1435개 전수 목록 확보 | `find_gameobjects assetType:Prefab` |
| ScriptableObject | 99개 전수 목록 확보 | `find_gameobjects assetType:ScriptableObject` |
| 핵심 스크립트 정독 | GameManager, ResultManager, PlayerMovement, PlayerStatus, PlayerInventory, EnemyBrain, EnemyPerception, EnemyCombat, EnemyLocomotion, EnemyMemory, TimeLimitController, ExitPoint, SessionManager, Enums, SpawnManager 등 15개+ | `manage_script read` |
| 콘솔 | 에디터 로그 4건 확인 (MCP 초기화 로그만, 에러 0건) | `read_console` |

### 2.3 접근하지 못한 영역

| 영역 | 사유 |
|:---|:---|
| 런타임 플레이 모드 | Unity MCP는 정적 분석만 지원, 실제 Play 모드 실행 불가 |
| Build Settings 상세 | MCP에서 직접 빌드 설정 조회 API 미제공 |
| NavMesh Bake 상태 | 씬 내부 NavMesh 유효성 직접 확인 불가 |
| AudioSource/AudioClip | AudioManager 스크립트 미발견, 오디오 시스템 구조 확인 불가 |
| Shader/Material Inspector | Flat Kit 셰이더 상세 설정 직접 조회 불가 |
| Layer/Tag 설정 | Project Settings 직접 조회 불가, 코드 내 `LayerMask.NameToLayer("Wall")` 등에서 간접 확인 |
| Post Processing | URP 렌더러 설정 직접 확인 불가 |

---

## 3. 단계별 현황

### 3.1 P0 현황

#### 완료 (35/36)
Scene Flow 8건, InGame Core 8건, Loot/Settlement 8건, Lobby/OutGame 8건, Data/Persistence 3건 — 전부 `COMPLETED`

#### 부분 완료 (1/36)
- **LS-07** `hasNewMemoryLog` 저장 — 런타임 필드로만 존재, `PlayerSaveData` 직렬화 주석 처리됨

#### 회귀 위험
- P0.5 구르기 벽 관통(QA-PM-006)이 P0에서 검증된 이동 안정성을 훼손
- P0.5 아티팩트/상자 시스템 추가로 아이템 Addressable 로드 실패 신규 발생(QA-CD-004)

---

### 3.2 P0.5 현황

| ID | 기능 | 문서 근거 | Unity 근거 | 상태 | QA |
|:---:|:---|:---|:---|:---:|:---:|
| P05-01 | 세션 시간 제한 | §1.1 | `TimeLimitController.cs` | COMPLETED | 테스트 필요 |
| P05-02 | 시간 제한 가속 구역 | §1.1.1 | `TimeLimitController.timeLimitAccel` 필드 존재 | PARTIAL | 가속 구역 Trigger 오브젝트 미확인 |
| P05-03 | 시간 제한 회복 아이템 | §1.1.2 | `EffectType` enum에 해당 타입 미확인 | UNKNOWN | 런타임 검증 필요 |
| P05-04 | 플레이어 시야 제한 | §1.2 | `VisionGizmo.cs` 존재 | PARTIAL | 렌더링 마스킹 구현 여부 미확인 |
| P05-05 | 달리기 | §1.3 | `PlayerMovement.sprintSpeed` + `PlayerStatus.UseSprintMana()` | COMPLETED | ✅ |
| P05-06 | 구르기 | §1.4 | `PlayerMovement.PlayerEvade()` + `isEvading` 무적 | COMPLETED | ⚠️ 벽 관통 |
| P05-07 | 탈출 채널링 | §1.5 | `ExitPoint.cs` — `escapeTime=3.0f`, 피격 취소 `EscapeFailure()` | COMPLETED | ✅ |
| P05-08 | 각성 보존 슬롯 | §1.6 | `PlayerInventory.safeSlots` + `ResultManager.InventorySync()` | COMPLETED | ✅ |
| P05-09 | 소비 기물 채널링 | §1.7.1 | `QuickSlotPresenter.cs` 존재 | UNKNOWN | 런타임 검증 필요 |
| P05-10 | 소비 기물 쿨타임 | §1.7.2 | `QuickSlotPresenter.cs` 존재 | UNKNOWN | 런타임 검증 필요 |
| P05-11 | 아티팩트 장비 | §1.8 | `ArtifactItemData.cs` + `PlayerArtifactEquipment.cs` + `PlayerArtifactEffectController.cs` | COMPLETED | ✅ |
| P05-12 | 다이버 스킬 | §2 | `SkillData.cs` + `GrenadeProjectile.cs` | COMPLETED | ✅ |
| P05-13 | 에너미 모듈형 FSM | §4 | `EnemyBrain` + `EnemyPerception` + `EnemyCombat` + `EnemyLocomotion` + `EnemyMemory` | COMPLETED | ⚠️ 벽 관통 |
| P05-14 | 에너미 시야/청각 감지 | §4 | `EnemyPerception.FindVisibleTarget()` + `CanHear()` + LOS Raycast | COMPLETED | ⚠️ 벽 너머 감지 |
| P05-15 | 소음 시스템 | §4 | `NoiseManager.cs` + `NoiseType.cs` + `NoiseStimulus.cs` + `EnemyNoiseListener.cs` | COMPLETED | ✅ |
| P05-16 | 루시드 낙인 | §4 | `PlayerLucidMarkController` (PlayerStatus.cs 내) — 2중첩, 시간감소, 의식누출 흔적 | COMPLETED | ✅ |
| P05-17 | 아이템 상자 루트 | §3 | `ItemBox.cs` + `BoxLootOption.cs` + `LevelBoxSpawner.cs` | COMPLETED | ⚠️ 위치 버그 |
| P05-18 | 결과창 순차 애니메이션 | P0.5 선택 | `Canvas-ResultPanel.prefab` 존재 | UNKNOWN | UI 내부 미검증 |
| P05-19 | 슬롯 등급 배경 이미지 | §7 | `ItemGrade` enum 존재 | PARTIAL | UI 연동 코드 미확인 |
| P05-20 | 적 사망 드롭 | §4 | `DropItem.cs` + `DropItem.prefab` | COMPLETED | ✅ |

---

### 3.3 P1 준비도

#### P1 BLOCKER (7건)

| # | 블로커 | 근거 | 조건 |
|:---:|:---|:---|:---|
| B-01 | 벽 관통 (적/플레이어/Raycast) | QA-PM-002,004,006,007, QA-CD-007 | LayerMask 통합 + 에너미 NavMesh 안정화 |
| B-02 | 피격 판정 누락 | QA-TD-004 | Raycast 레이어 필터 + TakeDamage 호출 경로 검증 |
| B-03 | Addressable 키 누락 | QA-CD-004 | FrozenClockwork 에셋 등록 + 빌드 |
| B-04 | 동조율 데이터 동기화 실패 | QA-CD-002,005, QA-TD-005 | DataManager 로드→UI 바인딩 타이밍 수정 |
| B-05 | 결과창 중 인벤토리 열림 | QA-TD-003 | 상태 기반 입력 차단 |
| B-06 | 적 벽 너머 감지/무한 추격 | QA-PM-001,003,005 | EnemyPerception LOS + EnemyMemory 타임아웃 |
| B-07 | hasNewMemoryLog 영속성 미보장 | DI-03 | PlayerSaveData 직렬화 복원 |

#### P1 REQUIRED (3건)
- 씬 이름 통일 (DI-01)
- 퀵슬롯 칸수 문서 갱신 (DI-02)
- _Deprecated/ 폴더 정리 (DI-08)

#### P1 PARALLEL (4건)
- 싱글톤→서비스 로케이터 리팩토링 (TD-02)
- FindObjectOfType 제거 (TD-03)
- 매직 넘버 상수화 (TD-04)
- GlobalEventBus 이벤트 문서화 (U-07)

#### P1 DEFERRED (3건)
- Enum `UserType` 주석 수정 (DI-05)
- 주석 코드 정리 (TD-05)
- MVVM 구조 정비 (TD-07)

---

## 4. 기능 추적 매트릭스

### 4.1 플레이어 시스템 (PLR)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| PLR-001 | P0 | WASD 이동 | D-02 §1.3.1 | `PlayerMovement.cs` — `movementInput` + isometric 45° | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-002 | P0 | 마우스 조준 | D-02 §1.3.2 | `PlayerMovement.AimTowardsMouse()` | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-003 | P0 | 좌클릭 공격 | D-02 §1.3.2 | `PlayerWeapon.cs` + `PlayerCombatPresenter.cs` | COMPLETED | 일치 | ⚠️ QA-TD-004 | Critical |
| PLR-004 | P0 | MP 시스템 | D-02 §1.4 | `PlayerStatus.mpCurrent/mpMax/manaRegen` | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-005 | P0 | HP 시스템 | D-02 §1.1 | `PlayerStatus.hpCurrent/hpMax` + `TakeDamage()` | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-006 | P0 | HP 0 → 강제 각성 | D-02 §1.2 | `PlayerStatus.GameOver()` → `livingState.gameover` | COMPLETED | 일치 | ⚠️ 사망 후 적 공격 지속 | High |
| PLR-007 | P0 | 상호작용 (F키) | D-02 §1.3.3 | `PlayerInteraction.cs` + `IInteractable` 인터페이스 | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-008 | P0.5 | 달리기 | D-03 §1.3 | `PlayerMovement.sprintSpeed` + `PlayerStatus.UseSprintMana()` | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-009 | P0.5 | 구르기 | D-03 §1.4 | `PlayerMovement.PlayerEvade()` + `isEvading` 무적 | COMPLETED | 일치 | ⚠️ QA-PM-006 벽 관통 | Critical |
| PLR-010 | P0.5 | 시야 제한 | D-03 §1.2 | `VisionGizmo.cs` 존재 | PARTIAL | 부분 확인 | 런타임 검증 필요 | Medium |
| PLR-011 | P0.5 | 루시드 낙인 | D-03 §4 | `PlayerLucidMarkController` — 중첩/시간감소/의식누출 | COMPLETED | 일치 | 확인 완료 | Low |
| PLR-012 | P0 | livingState enum | D-02 §1.2 | `PlayerStatus.livingState { idle, escape, gameover }` | COMPLETED | 일치 | 확인 완료 | Low |

### 4.2 에너미 시스템 (ENM)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| ENM-001 | P0 | 적 스폰 | D-02 §3 | `SpawnManager.cs` + `EnemySpawnPoint.cs` + `EnemySpawnZone.cs` | COMPLETED | 일치 | 확인 완료 | Low |
| ENM-002 | P0 | 추적 AI | D-02 §3 | `EnemyBrain.Tick()` → 순찰/조사/복귀/추격/공격 FSM | COMPLETED | 일치 | ⚠️ 무한 추격 | High |
| ENM-003 | P0 | 적 공격 | D-02 §3 | `EnemyCombat.RunCombo()` | COMPLETED | 일치 | ⚠️ 벽 관통 공격 | Critical |
| ENM-004 | P0 | 적 사망 | D-02 §3 | `EnemyStatus.cs` 존재 | COMPLETED | 정적 확인 | 런타임 검증 필요 | Low |
| ENM-005 | P0.5 | 시야각 감지 | D-03 §4 | `EnemyPerception.FindVisibleTarget()` — sightAngle/sightRange + Raycast LOS | COMPLETED | 일치 | ⚠️ 벽 너머 감지 | High |
| ENM-006 | P0.5 | 청각 감지 | D-03 §4 | `EnemyPerception.CanHear()` — hearingRange + requireLineOfHearing + 벽 차단 | COMPLETED | 일치 | 확인 완료 | Low |
| ENM-007 | P0.5 | 소음 조사 | D-03 §4 | `EnemyNoiseListener.Investigate()` | COMPLETED | 일치 | 확인 완료 | Low |
| ENM-008 | P0.5 | 추격 기억/복귀 | D-03 §4 | `EnemyMemory.CaptureReturnAnchor()` + `HandleReturnToPatrol()` | COMPLETED | 일치 | ⚠️ 복귀 불안정 | Medium |
| ENM-009 | P0.5 | 차단 이동 | D-03 §4 | `EnemyInterceptPlanner.TryPlanIntercept()` | COMPLETED | 일치 | 런타임 검증 필요 | Low |
| ENM-010 | P0.5 | 순찰 루트 | D-03 §4 | `EnemyPatrolRoute.cs` + `EnemyMemory.HandlePatrol()` | COMPLETED | 일치 | 확인 완료 | Low |
| ENM-011 | P0.5 | 전진 2연격 | D-03 §4 | `EnemyCombat.RunCombo()` | COMPLETED | 정적 확인 | 런타임 검증 필요 | Low |
| ENM-012 | P0.5 | 어그로 효과 | D-03 §4 | `EnemyBrain.ApplyAggro()` + `PlayerStatus.ApplyAggro()` (무시) | COMPLETED | 일치 | 확인 완료 | Low |

### 4.3 익스트랙션/정산 시스템 (EXT)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| EXT-001 | P0 | 전화부스 탈출 | D-02 §4 | `ExitPoint.cs` — `Interact()` → `StartEscapeTimer()` | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-002 | P0.5 | 탈출 채널링 (3초) | D-03 §1.5 | `ExitPoint.escapeTime = 3.0f` | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-003 | P0.5 | 피격 시 채널링 취소 | D-03 §1.5 | `ExitPoint.EscapeFailure()` → 코루틴 중단 + 상태 복원 | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-004 | P0 | 성공 정산 | D-01 §정산 | `ResultManager.GameResult(true, ...)` | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-005 | P0 | 실패 정산 | D-01 §정산 | `ResultManager.GameResult(false, ...)` → 슬롯 전부 제거 | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-006 | P0 | 기억 파편 자동 소모 | D-01 §정산 | `ResultManager.LinkRateUp()` → `RemoveFromInventory(401)` | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-007 | P0 | 동조율 +1 | D-01 §정산 | `ResultManager.linkRateGain = 1` | COMPLETED | 일치 | ⚠️ 로비 미반영 | High |
| EXT-008 | P0.5 | 시간 제한 | D-03 §1.1 | `TimeLimitController.cs` — `timeLimit=600`, `FixedUpdate` 감소 | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-009 | P0.5 | 타임아웃 → 강제 각성 | D-03 §1.1 | `TimeLimitController.TryFinishByTimeout()` → `OnTimeOver` | COMPLETED | 일치 | 확인 완료 | Low |
| EXT-010 | P0.5 | 루시드 낙인 시간 패널티 | D-03 §4 | `PlayerLucidMarkController.hitTimePenaltySeconds = 5.0f` → `OnTimePenaltyRequested` | COMPLETED | 일치 | 확인 완료 | Low |

### 4.4 인벤토리/아이템 시스템 (INV)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| INV-001 | P0 | 아이템 충돌 획득 | D-02 §2 | `DropItem.cs` + `PlayerInventory.AddItem()` | COMPLETED | 일치 | 확인 완료 | Low |
| INV-002 | P0 | 인벤토리 슬롯 | D-02 §5 | `PlayerInventory.slots` + `InventorySlotData` | COMPLETED | 일치 | 확인 완료 | Low |
| INV-003 | P0 | 퀵슬롯 (소비 기물) | D-02 §5 | `PlayerInventory.quickSlots[0..2]` — 3칸 | DOCUMENT_MISMATCH | 문서 2칸 vs 구현 3칸 | 확인 완료 | Low |
| INV-004 | P0.5 | 각성 보존 슬롯 | D-03 §1.6 | `PlayerInventory.safeSlots` + `ResultManager` 보호 | COMPLETED | 일치 | 확인 완료 | Low |
| INV-005 | P0 | 아이템 드롭 (바닥) | D-02 §2 | `PlayerInventory.TryDropSlotToWorld()` → `DropItem.Initialize()` | COMPLETED | 일치 | ⚠️ 아이콘 과대 | Minor |
| INV-006 | P0 | 창고 저장 | D-02 §6 | `StorageInventoryUI` + `PlayerSaveData.storageSlots` | COMPLETED | 일치 | 확인 완료 | Low |
| INV-007 | P0.5 | 아이템 상자 루트 | D-03 §3 | `ItemBox.cs` + `BoxLootOption.cs` + `LevelBoxSpawner.cs` | COMPLETED | 일치 | ⚠️ 위치 버그 | Medium |
| INV-008 | P0.5 | 아티팩트 장착 | D-03 §1.8 | `ArtifactItemData.cs` + `PlayerArtifactEquipment.WriteToSave()` | COMPLETED | 일치 | 확인 완료 | Low |
| INV-009 | P0 | 아이템 JSON 데이터 | D-04 | `LocalJsonItemRepository.cs` | COMPLETED | 일치 | 확인 완료 | Low |

### 4.5 UI/UX 시스템 (UI)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| UI-001 | P0 | 로비 메인 | D-07 | `LobbyMainUI.cs` + `Canvas-Lobby.prefab` | COMPLETED | 일치 | ⚠️ 동조율 0 고정 | High |
| UI-002 | P0 | 출격 준비 | D-07 | `Canvas-SortiePrepare.prefab` | COMPLETED | 일치 | ⚠️ 퀵슬롯 빈칸 | Medium |
| UI-003 | P0 | 인게임 HUD | D-07 | `GamePlayUI.cs` + `Canvas-GameUI.prefab` | COMPLETED | 일치 | ⚠️ 스태미나 소수점 | Minor |
| UI-004 | P0 | 인벤토리 UI | D-07 | `InventoryUI.cs` + `Canvas-InventoryUI.prefab` | COMPLETED | 일치 | 확인 완료 | Low |
| UI-005 | P0 | 결과 화면 | D-07 | `ResultUI.cs` + `Canvas-ResultPanel.prefab` | COMPLETED | 일치 | ⚠️ 인벤 열림 | High |
| UI-006 | P0 | 다이버/기록 | D-07 | `DiverRecordUI.cs` + `Canvas-DiverRecord.prefab` | COMPLETED | 일치 | 확인 완료 | Low |
| UI-007 | P0 | 심상 기록 팝업 | D-07 | `RecordCardPopUpUI.cs` + `Canvas-RecordCardPopUp.prefab` | COMPLETED | 일치 | 확인 완료 | Low |
| UI-008 | P0 | 창고 | D-07 | `Canvas-StorageInventory.prefab` | COMPLETED | 일치 | 확인 완료 | Low |
| UI-009 | P0.5 | 아이템 툴팁 | D-03 §7 | `ItemTooltipUI.cs` + `Canvas-ItemTooltipUI.prefab` | COMPLETED | 일치 | 확인 완료 | Low |
| UI-010 | P0.5 | 탈출 타이머 | D-03 §1.5 | `EscapeTimer.cs` + `Canvas-timer.prefab` | COMPLETED | 일치 | 확인 완료 | Low |

### 4.6 메타 진행 시스템 (META)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| META-001 | P0 | 동조율 상승 | D-01 §동조율 | `ResultManager.LinkRateUp()` | COMPLETED | 일치 | ⚠️ 로비 미반영 | High |
| META-002 | P0 | 심상 기록 해금 | D-01 §동조율 | `ResultManager.MemoryLogUnlocked` 계산 | COMPLETED | 일치 | ⚠️ 재시작 초기화 | High |
| META-003 | P0 | NEW 레드닷 | D-06 LO-08 | `ResultManager.hasNewMemoryLog` + `GlobalEventBus.RecordDataLoad` | PARTIAL | 저장 미연결 | ⚠️ 영속성 미보장 | Medium |
| META-004 | P0 | 대사 출력 | D-02 §1.6 | `LocalJsonDialogueRepository.cs` + `DialogueType` enum | COMPLETED | 일치 | 확인 완료 | Low |
| META-005 | P0 | 데이터 저장/로드 | D-06 DP-01~03 | `DataManager.cs` + `LocalSaveRepository.cs` + `PlayerSaveData.cs` | COMPLETED | 일치 | ⚠️ 부분 필드 누락 | High |

### 4.7 데이터/저장 시스템 (DAT)

| ID | 단계 | 기능 | 문서 근거 | Unity 근거 | 상태 | 일치도 | QA | 위험도 |
|:---:|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| DAT-001 | P0 | PlayerSaveData | D-06 DP-02 | `PlayerSaveData.cs` — inventorySlots, storageSlots, safeSlots, artifactSlots, quickSlots, myCharacters | COMPLETED | 일치 | 확인 완료 | Low |
| DAT-002 | P0 | JSON 저장/로드 | D-06 DP-02 | `LocalSaveRepository.SaveGameData()` / `LoadGameData()` | COMPLETED | 일치 | 확인 완료 | Low |
| DAT-003 | P0 | SessionManager | D-06 DP-03 | `SessionManager.cs` + `GlobalRuntimeData.cs` | COMPLETED | 일치 | 확인 완료 | Low |
| DAT-004 | P0 | CharacterData SO | D-08 | `CharacterData.cs` (ScriptableObject) + `SOCharacterRepository.cs` | COMPLETED | 일치 | 확인 완료 | Low |

---

## 5. 문서에만 존재하는 기능 (NOT_IMPLEMENTED)

| # | 기능 | 문서 근거 | 상태 | 비고 |
|:---:|:---|:---|:---:|:---|
| NI-01 | 시간 제한 회복 아이템 (`timeLimit_recover_inst`) | D-03 §1.1.2 | UNKNOWN | `EffectType` enum에 해당 값 미확인, 런타임 검증 필요 |
| NI-02 | 소비 기물 채널링 (`useChanneling` 필드) | D-03 §1.7.1 | UNKNOWN | `QuickSlotPresenter.cs` 내부 확인 필요 |
| NI-03 | 소비 기물 쿨타임 (`useCooltime` 딕이너리) | D-03 §1.7.2 | UNKNOWN | `PlayerInventory.cs` 내 `lastUseTime` 딕셔너리 미발견 |
| NI-04 | 시간 가속 구역 Trigger 오브젝트 | D-03 §1.1.1 | PARTIAL | `timeLimitAccel` 필드 존재하나 구역 오브젝트 미확인 |

---

## 6. Unity에만 존재하는 기능 (IMPLEMENTED_NOT_DOCUMENTED)

| # | Unity 구현물 | 경로/클래스 | 문서 반영 | 권장 조치 |
|:---:|:---|:---|:---|:---|
| U-01 | AnyPortrait 2D 애니메이션 | `PlayerMovement.apPort` + `Yuan_Hit_Face/Yuan_AimY/Yuan_B_AimY` 파라미터 | 부분 언급 | 상세 파라미터 목록 문서화 |
| U-02 | 노이즈 시스템 세부 (반경/간격 값) | `PlayerMovement` — `walkNoiseRange=15`, `runNoiseRange=20` | 구조만 언급 | 구현 수치 문서 반영 |
| U-03 | `ResultServiceLocator` 패턴 | `ResultManager` → `IResultService` 인터페이스 | 미언급 | 아키텍처 문서 기록 |
| U-04 | `CameraSetupManager.cs` | 카메라 셋업 전용 매니저 | 미언급 | 카메라 시스템 문서화 |
| U-05 | `Enemy-DarkSpirit.prefab` (2종째 적) | `Assets/03_PreFabs/Characters/` | P0 명세서는 1종만 | P0.5 문서 갱신 |
| U-06 | `GlobalEventBus` 전역 이벤트 | 50개+ 이벤트 선언/구독 | 미언급 | 이벤트 카탈로그 문서 신규 작성 |
| U-07 | `LucidLeakTraceRuntime` 의식누출 흔적 오브젝트 | `PlayerStatus.cs` 하단 정의 | 구조만 언급 | 구현 세부 문서 반영 |

---

## 7. 문서와 구현이 다른 기능 (DOCUMENT_MISMATCH)

| ID | 문서 정의 | 실제 구현 | 어느 쪽 기준 | 조치 |
|:---:|:---|:---|:---:|:---|
| DI-01 | 씬 이름 "GameScene" | `DemoScene` / `LevelDesignScene` 혼재 | 현 구현 기준 문서 갱신 권장 | 문서에 실제 씬 이름 반영 |
| DI-02 | 소지품 슬롯 2칸 (LO-05) | `quickSlots[0~2]` = 3칸 | 현 구현 기준 문서 갱신 권장 | 문서 갱신 |
| DI-03 | `hasNewMemoryLog` 저장 | 런타임 필드만, 직렬화 코드 주석 처리 | 문서 기준 구현 수정 권장 | 저장 로직 복원 |
| DI-04 | 동조율 로비 즉시 반영 | 로비 전환 시 캐시 불일치 | 문서 기준 구현 수정 권장 | 바인딩 타이밍 수정 |
| DI-05 | `UserType.support` = 지원 캐릭터 | 주석에 "적"으로 기재 | 기획 의사결정 필요 | enum 리네이밍 또는 주석 수정 |
| DI-06 | 몬스터 카메라 기준 방향 | 에너미에 isometric 보정 미적용 | 문서 기준 구현 수정 권장 | EnemyAnimator에 보정 적용 |
| DI-07 | FrozenClockwork 아이콘 | 등록됨 | Addressable 키 미등록 | 문서 기준 구현 수정 권장 | 에셋 등록 |
| DI-08 | JSON 이전 완료 | `_Deprecated/` SO 잔존 | 현 구현 기준 정리 | 구 SO 삭제 |

---

## 8. 시스템별 상세 분석

### 8.1 플레이어 시스템

**문서 목표**: P0 — WASD 이동, 마우스 조준, 좌클릭 공격, MP 자원, HP 사망. P0.5 — 달리기, 구르기, 시야 제한, 루시드 낙인.

**실제 구현 구조**: `PlayerMovement.cs`(이동/조준/구르기), `PlayerStatus.cs`(HP/MP/상태/루시드낙인), `PlayerWeapon.cs`(공격), `PlayerInventory.cs`(인벤토리), `PlayerInteraction.cs`(상호작용), `PlayerArtifactEquipment.cs`(아티팩트), `LocalInputReader.cs`(입력)

**일치 사항**: 이동, 조준, 공격, MP, HP, 달리기, 구르기, 탈출 채널링, 루시드 낙인 — 모두 문서 정의와 일치

**불일치 사항**: 시야 제한(PLR-010) 구현 상세 미확인, 퀵슬롯 칸수 불일치(INV-003)

**기술적 위험**: 구르기 벽 관통(QA-PM-006) — `GetSafeMovePosition()` 보강 코드 존재하나 모서리 케이스 잔존

**QA 항목**: 벽 관통 재현 테스트, 구르기 무적 판정 경계값, MP 0에서 달리기 불가→복구 타이밍

---

### 8.2 에너미 시스템

**문서 목표**: P0 — 단순 추적 AI 1종. P0.5 — 모듈형 FSM(순찰→경계→추격→공격→사망), 시야/청각 감지, 차단 이동, 루시드 낙인, 순찰 루트.

**실제 구현 구조**: `EnemyBrain`(의사결정) → `EnemyPerception`(감지) → `EnemyMemory`(기억/복귀) → `EnemyLocomotion`(이동) → `EnemyCombat`(전투) → `EnemyNoiseListener`(청각) → `EnemyInterceptPlanner`(차단) → `EnemyAnimator`(연출) → `EnemyPatrolRoute`(순찰)

**일치 사항**: FSM 구조, 시야각/인지유지 분리, LOS Raycast, 청각 벽 차단, 순찰→복귀 전이, 어그로 시스템

**불일치 사항**: 벽 너머 어그로(QA-PM-001) — `EnemyPerception.IsTargetInSight()`에 Raycast LOS 있으나 일부 조건에서 우회, 에너미 방향 보정(DI-06)

**기술적 위험**: NavMeshAgent + Rigidbody 충돌 → 벽 관통(QA-PM-004), 추격 무한 지속(QA-PM-003), 처치 후 나머지 공격 중단(QA-PM-005)

---

### 8.3 인벤토리/아이템 시스템

**문서 목표**: 인벤토리 슬롯, 퀵슬롯, 각성 보존 슬롯, 아이템 상자 루트, 아티팩트 장착, 창고 저장.

**실제 구현 구조**: `PlayerInventory.cs` — `slots`, `quickSlots`, `safeSlots` 분리, `anySlots` 헬퍼, Addressable 비동기 아이콘 로드, `ItemBox.cs` + `BoxLootOption.cs` 루트 시스템

**일치 사항**: 전반적으로 문서와 높은 일치도. 아이템 데이터 JSON 이전 완료.

**불일치 사항**: 퀵슬롯 3칸(문서 2칸), `_Deprecated/` SO 잔존

**누락 사항**: 소비 기물 쿨타임 딕셔너리(NI-03), Addressable 키 누락(DI-07)

---

### 8.4 탈출/정산 시스템

**문서 목표**: 전화부스 상호작용 → 채널링 → 성공/실패 분기 → ResultPanel → 로비 복귀.

**실제 구현**: `ExitPoint.cs` → `escapeTime=3.0f` 채널링 + `EscapeFailure()` 피격 취소 → `ResultManager.GameResult()` → 인벤토리 동기화 + 동조율 처리 + 결과 UI

**일치 사항**: 채널링/취소/성공/실패 분기, 기억 파편 자동 소모, 동조율 +1, 실패 시 아이템 유실 — 모두 구현

**누락 사항**: `hasNewMemoryLog` 영속성(DI-03)

---

### 8.5 동조율/심상기록 시스템

**문서 목표**: 기억 파편 획득 → 탈출 성공 → 동조율 상승 → 심상 기록 해금 → NEW RED DOT.

**실제 구현**: `ResultManager.LinkRateUp()` → `charData.linkRateLevel += linkRateGain` → `MemoryLogUnlocked` 계산 → `SendLinkRecordData()` → `DiverRecordUI` 표시

**불일치 사항**: 로비 복귀 시 동조율 미반영(QA-CD-005), 앱 재시작 시 Lv.0 초기화(QA-CD-002), `hasNewMemoryLog` 미저장(DI-03)

---

### 8.6 오디오 시스템

**문서 근거**: P0/P0.5 명세서에 BGM/SFX 직접 명세 없음. 별도 오디오 문서 미발견.

**실제 구현**: `AudioManager` 스크립트 미발견. BGM 언급은 P1 컨셉 문서(`검수/P1_컨셉기획/`)에만 존재.

**상태**: NOT_IMPLEMENTED (P0/P0.5 범위 외 추정)

**권장 조치**: P1 진입 시 오디오 시스템 설계 필수

---

### 8.7 프로젝트 구조/코드 품질

**싱글톤**: GameManager, SessionManager, SpawnManager, UIManager, ResultManager, DataManager, NoiseManager — 최소 7개

**하드코딩**: `ResultManager`에서 아이템 TID `301`, `302`, `401` 하드코딩

**FindObjectOfType**: `ResultManager.GameResult()` → `FindObjectOfType<PlayerInventory>()`, `FindObjectOfType<PlayerArtifactEquipment>()`

**이벤트 구독 해제**: `PlayerStatus`, `PlayerMovement`, `ResultManager` 등에서 `OnEnable`/`OnDisable` 쌍으로 관리 — 양호

**데이터 구조**: `PlayerSaveData` 중심 저장 + `GlobalRuntimeData` 런타임 분리 — 적절

---

## 8.8 렌더링/비주얼

**접근 한계**: Flat Kit 셰이더, URP 설정, Post Processing 직접 확인 불가.

**확인된 사항**: 보도블럭 캐릭터 가림(QA-CPTD-011), Z-Fighting(QA-TD-007) — 레벨 디자인/셰이더 튜닝 필요

---

## 9. 기술 부채 및 구조적 위험

| # | 분류 | 내용 | 리스크 | P1 영향 |
|:---:|:---|:---|:---:|:---|
| TD-01 | 레거시 | `_Deprecated/` 4개 SO 잔존 | Low | 혼동 가능 |
| TD-02 | 구조 | 7개 싱글톤 남용 | Medium | P1 멀티플레이어 확장 시 병목 |
| TD-03 | 성능 | FindObjectOfType 런타임 사용 | Medium | 씬 규모 확장 시 GC spike |
| TD-04 | 가독성 | 매직 넘버 (301/302/401) | Medium | 새 아이템 추가 시 누락 위험 |
| TD-05 | 정리 | ResultManager 주석 코드 | Low | 유지보수 혼동 |
| TD-06 | 관리 | 씬 이름 문자열 하드코딩 | Low | 씬 리네이밍 시 빌드 실패 |
| TD-07 | 구조 | MVVM 불완전 (Presenter 5개) | Low | P1 UI 확장 시 결합도 증가 |

---

## 10. QA 및 테스트 갭

### 10.1 현재 QA 기준
[04_P0_QA_체크리스트.md](file:///c:/Project/Document_LucidDiver/LucidDiver_Document/01_SSOT_최종_기준문서/04_P0_QA_체크리스트.md) — F-01~07, I-01~10, A-01~08, B-01~08, C-01~05, D-01~04, P-01~03 정의됨 (미통과 상태)

### 10.2 추가 필요 테스트 케이스

| Test ID | 대상 기능 | 사전 조건 | 절차 | 기대 결과 | 우선순위 |
|:---:|:---|:---|:---|:---|:---:|
| T-NEW-01 | 구르기 벽 관통 | 벽 밀착 상태 | 벽 방향으로 구르기 입력 | 벽 앞에서 정지, 관통 불가 | Critical |
| T-NEW-02 | 적 벽 관통 | 적이 벽 너머 추격 중 | 벽 사이에서 적 관찰 | 벽에서 차단, 관통 불가 | Critical |
| T-NEW-03 | 결과창 중 인벤토리 | 결과창 열린 상태 | Tab/I 키 입력 | 인벤토리 열리지 않음 | High |
| T-NEW-04 | 탈출 채널링 + 피격 | 채널링 시작 후 | 적 공격으로 피격 | 채널링 즉시 취소 + idle 복귀 | High |
| T-NEW-05 | 동조율 5회 연속 저장 | 5회 연속 탈출 성공 | 매 세션 후 로비 복귀 | 동조율 Lv.1→5 순차 상승 확인 | High |
| T-NEW-06 | 앱 재시작 후 데이터 | 동조율 Lv.3 + 창고 아이템 | 앱 종료 → 재실행 | Lv.3 유지 + 창고 아이템 유지 | Critical |
| T-NEW-07 | 시간 타임아웃 | 600초 제한 세션 | 아무 행동 없이 대기 | 0초 도달 시 강제 각성 + 결과창 | High |
| T-NEW-08 | 사망+탈출 동시 | 탈출 채널링 중 | HP 0으로 사망 | 탈출 채널링 취소 + 강제 각성 처리 | Critical |
| T-NEW-09 | 퀵슬롯 수량 동기화 | 인벤토리에 기묘한 사탕 3개 | 퀵슬롯 등록 → 1개 사용 | 퀵슬롯 수량 2 표시 | High |
| T-NEW-10 | 각성 보존 슬롯 보호 | 보존 슬롯에 아이템 배치 | 강제 각성 | 보존 슬롯 아이템 유지 | High |

---

## 11. P1 진입 전 실행 계획

### 즉시 수정 (1~3일)

| 작업 ID | 작업명 | 문제 근거 | 완료 기준 | 예상 담당 |
|:---:|:---|:---|:---|:---:|
| FIX-01 | Addressable 키 등록 | DI-07, QA-CD-004 | FrozenClockwork 아이콘 정상 로드 | TD |
| FIX-02 | hasNewMemoryLog 저장 복원 | DI-03, B-07 | 앱 재시작 후 NEW 레드닷 상태 유지 | TD |
| FIX-03 | 결과창 입력 차단 | B-05, QA-TD-003 | 결과창 상태에서 Tab/I 키 무응답 | TD |
| FIX-04 | 스태미나 소수점 표시 | QA-TD-001 | 정수 또는 소수점 1자리 표시 | TD |

### P1 진입 전 필수 (1~2주)

| 작업 ID | 작업명 | 문제 근거 | 완료 기준 | 선행 작업 |
|:---:|:---|:---|:---|:---|
| PRE-01 | 벽 관통 통합 수정 | B-01 | 적/플레이어/Raycast 벽 관통 0건 | LayerMask 통합 설계 |
| PRE-02 | 피격 판정 수정 | B-02 | 총격→적 HP 감소 100% 재현 3회 | Raycast 레이어 점검 |
| PRE-03 | 동조율 동기화 수정 | B-04 | 로비 복귀 즉시 + 앱 재시작 시 값 유지 | DataManager 로드 타이밍 |
| PRE-04 | 적 LOS/복귀 수정 | B-06 | 벽 너머 미감지 + 추격 타임아웃 복귀 | EnemyPerception/Memory |
| PRE-05 | QA 체크리스트 3회 통과 | D-05 | 시나리오 A~D + P-01~03 전체 3회 연속 | FIX-01~04 + PRE-01~04 |

### P1 병행 가능

| 작업 ID | 작업명 | 비고 |
|:---:|:---|:---|
| PAR-01 | 씬 이름 통일 및 문서 갱신 | DI-01 |
| PAR-02 | 퀵슬롯 칸수 문서 갱신 | DI-02 |
| PAR-03 | _Deprecated/ 정리 | DI-08 |
| PAR-04 | GlobalEventBus 이벤트 카탈로그 작성 | U-06 |

### 후순위

| 작업 ID | 작업명 | 비고 |
|:---:|:---|:---|
| DEF-01 | 싱글톤 리팩토링 | TD-02 |
| DEF-02 | 매직 넘버 상수화 | TD-04 |
| DEF-03 | UserType enum 정리 | DI-05 |

---

## 12. 문서 갱신 권고

| # | 유형 | 대상 문서 | 내용 |
|:---:|:---|:---|:---|
| DOC-01 | 수정 | P0 기능 티켓 목록 | LO-05 소지품 슬롯 2칸→3칸 반영, 체크박스 상태 갱신 |
| DOC-02 | 수정 | P0 시스템 명세서 | 씬 이름 "GameScene" → 실제 씬 이름 반영 |
| DOC-03 | 신규 | GlobalEventBus 이벤트 카탈로그 | 50개+ 이벤트 목록, 발행/구독 클래스 매핑 |
| DOC-04 | 신규 | Unity 프로젝트 아키텍처 문서 | 서비스 로케이터 패턴, 매니저 구조, 데이터 흐름 |
| DOC-05 | 수정 | P0.5 시스템 명세서 | AnyPortrait 파라미터, 노이즈 시스템 수치, DarkSpirit 적 2종 추가 |
| DOC-06 | 폐기 고려 | `_Deprecated/` 하위 SO | JSON 이전 완료 후 잔존 — 삭제 또는 아카이브 |
| DOC-07 | 최신 기준 지정 | 버그 리포트 v2.0.0 | 이전 v1.0.0~v1.2.2는 아카이브 처리 권장 |

---

## 13. 최종 판정

### ✅ 조건부 P1 진입 가능

**근거**: P0 핵심 루프(로비→출격→전투→탈출→정산→로비)는 기능적으로 완성. P0.5 확장 기능 대부분 구현. 에너미 AI 모듈 구조, 이벤트 버스 아키텍처, JSON 데이터 리포지토리 등 P1 확장에 필요한 기반이 양호.

**조건**:
1. **B-01** 벽 관통 문제 전수 해결 (적/플레이어/Raycast)
2. **B-02** 피격 판정 100% 정상 동작 확인
3. **B-03** Addressable 키 누락 해결
4. **B-04** 동조율 저장/로드 정상 동작 (5회 사이클 검증)
5. **B-07** `hasNewMemoryLog` 영속성 복원
6. **PRE-05** QA 체크리스트 시나리오 A~D + P-01~03 **3회 연속 통과**

위 6개 조건 충족 시 P1 개발 착수 가능.

---

## 14. 필수 마감 테이블

### 14.1 P1 Blocker 목록

| # | 블로커 | 관련 버그/불일치 | 심각도 | 해결 기한 |
|:---:|:---|:---|:---:|:---:|
| B-01 | 벽 관통 (적/플레이어/Raycast) | QA-PM-002,004,006,007, QA-CD-007 | Critical | P1 전 필수 |
| B-02 | 피격 판정 누락 | QA-TD-004 | Critical | P1 전 필수 |
| B-03 | Addressable 키 누락 | QA-CD-004, DI-07 | Critical | 즉시 |
| B-04 | 동조율 로비 미반영 + 재시작 초기화 | QA-CD-002,005, QA-TD-005, DI-04 | High | P1 전 필수 |
| B-05 | 결과창 중 인벤토리 열림 | QA-TD-003 | Major | 즉시 |
| B-06 | 적 벽 너머 감지 + 무한 추격 | QA-PM-001,003,005 | Major | P1 전 필수 |
| B-07 | hasNewMemoryLog 영속성 | DI-03 | Medium | 즉시 |

### 14.2 미구현 기능 목록

| # | 기능 | 문서 근거 | 상태 | 비고 |
|:---:|:---|:---|:---:|:---|
| NI-01 | 시간 제한 회복 아이템 | D-03 §1.1.2 | UNKNOWN | EffectType enum 확인 필요 |
| NI-02 | 소비 기물 채널링 | D-03 §1.7.1 | UNKNOWN | QuickSlotPresenter 내부 확인 |
| NI-03 | 소비 기물 쿨타임 | D-03 §1.7.2 | UNKNOWN | lastUseTime 딕셔너리 미발견 |
| NI-04 | 시간 가속 구역 오브젝트 | D-03 §1.1.1 | PARTIAL | timeLimitAccel 필드만 존재 |

### 14.3 문서-구현 불일치 목록

| ID | 항목 | 문서 | 구현 | 권장 조치 |
|:---:|:---|:---|:---|:---|
| DI-01 | 씬 이름 | GameScene | DemoScene/LevelDesignScene | 문서 갱신 |
| DI-02 | 퀵슬롯 칸수 | 2칸 | 3칸 | 문서 갱신 |
| DI-03 | hasNewMemoryLog 저장 | 직렬화 | 주석 처리됨 | 구현 수정 |
| DI-04 | 동조율 로비 반영 | 즉시 | 캐시 불일치 | 구현 수정 |
| DI-05 | UserType.support 주석 | 지원 캐릭터 | "적" | 기획 결정 |
| DI-06 | 몬스터 방향 보정 | 카메라 기준 | isometric 미적용 | 구현 수정 |
| DI-07 | FrozenClockwork 아이콘 | 등록됨 | Addressable 미등록 | 구현 수정 |
| DI-08 | JSON 이전 후 SO | 없음 | _Deprecated/ 잔존 | 정리 |

### 14.4 다음 재검증 체크리스트

- [ ] B-01~B-07 전체 해결 확인
- [ ] QA 체크리스트(D-05) 시나리오 A~D + P-01~03 **3회 연속 통과**
- [ ] NI-01~NI-04 구현 여부 런타임 검증
- [ ] DI-01~DI-08 전체 조치 완료 확인
- [ ] T-NEW-01~10 신규 테스트 케이스 전체 통과
- [ ] U-01~U-07 미문서화 기능 문서 반영 확인
- [ ] TD-01~TD-07 기술 부채 점진적 해결 추적
- [ ] 오디오 시스템 설계 완료 (P1 착수 전)
- [ ] 레벨 디자인 씬(`LevelDesignScene`) Build Settings 등록 확인

---

## 📜 Revision History

| 날짜 | 버전 | 내용 | 작성자 |
|:---:|:---:|:---|:---:|
| 2026-07-13 | v1.0.0 | 초판 — 문서 11건 + Unity MCP 전체 교차검증 (633 스크립트, 1435 프리팹, 99 SO) | Antigravity |
