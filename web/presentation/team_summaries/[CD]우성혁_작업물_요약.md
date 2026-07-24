# 📝 개인 작업물 요약 보고서 — 우성혁 (CD - Content Designer / 시스템 명세화 & 오디오·AI 구현)

> **전수 조사 완료**: 개인 개발일지 총 32개 파일 (2026.06.12 ~ 2026.07.20) 및 기획/명세 문서 전수 대조 완료.

**작성일**: 2026-07-21  
**담당 챕터**: Ch 03 (시스템 명세), Ch 05 (동조율 대사 필터), Ch 06 (오디오 아키텍처 & 전투 판정), Ch 07 (에너미 FSM & 시야/그림자 리팩토링), Ch 09 (AudioManager & 서비스 로케이터), Ch 10 (ResultUI & QA 버그 픽스)

---

## 1. 발표 웹페이지 수록용 주요 텍스트 (Title & Highlights)

### 📌 기획 시스템 명세화 및 마스터 문서 작성 (Ch 03, Ch 07)
- **크리에이티브 원안의 시스템 명세화**:
  - 장수영 CP의 정의 및 원안을 바탕으로 개발 구현이 가능한 마스터 명세서를 수립 및 구체적 명세화:
    - [01_P0_시스템_명세서.md](../../../LucidDiver_Document/01_SSOT_최종_기준문서/01_P0_시스템_명세서.md)
    - [P0.5_플레이어 캐릭터_기획서_시스템 명세_v1.0.3.md](../../../LucidDiver_Document/02_개발_전달용/P0.5_기획_명세서/플레이어_캐릭터_시스템_명세/P0.5_플레이어%20캐릭터_기획서_시스템%20명세_v1.0.3.md)
    - [P0.5_플레이어 캐릭터_기획서_스킬 기능 명세_v1.0.0.md](../../../LucidDiver_Document/02_개발_전달용/P0.5_기획_명세서/플레이어_캐릭터_시스템_명세/P0.5_플레이어%20캐릭터_기획서_스킬%20기능%20명세_v1.0.0.md)
    - [P1_오디오 매니저_기획서_v1.0.0.md](../../../LucidDiver_Document/검수/P1_오디오%20매니저_기획서_v1.0.0.md)
    - [P1_튜토리얼_기획서_v1.0.1.md](../../../LucidDiver_Document/검수/P1_컨셉기획/튜토리얼_기획서.md)
    - [P1_인트로 신 기획서_v1.0.0.md](../../../LucidDiver_Document/검수/P1_인트로%20신%20기획서_v1.0.0/P1_인트로%20신%20기획서_v1.0.0.md)
  - P0.5 알파 버그 리포트(QA-CD-001 ~ QA-CD-010) 작성 및 P1 베타 QA 검증 시트 문서 설계.

### 🔊 중앙 집중식 오디오 아키텍처 & 3D 공간 연출 (Ch 09, Ch 06)
- **AudioManager 및 IAudioRepository 아키텍처**:
  - 장수영 CP가 제공한 58종 SFX 및 BGM 리소스를 관리하는 [AudioManager.cs](../../../../UnityProject_LucidDiver/Assets/02_Scripts/Manager/Manager/AudioManager.cs) 및 `IAudioRepository` 인터페이스 설계 및 구현.
  - 3D 위치 기반 SFX 거리 감쇄 및 수명 관리 연출 시스템 개발.
  - FMOD Studio 및 내장 `AudioSource` Single-BGM Fallback **Dual Fallback 안전망** 구축.
  - **AudioMixer 통합 제어**: 환경음(`"AmbVolume"`), BGM, SFX, 마스터 볼륨 조절 및 비동기 씬 전환 시 BGM 클립 무한 재시작 방지 로직 연동.
- **UI 및 전투 사운드 피드백 정규화**:
  - 버튼 상호작용 상태(가능/불가능/로비 캐릭터 터치 전용 SFX/메뉴 사이드바) 구분 사운드 규격화 지정.
  - 적 피격 시 즉시 격발되는 전용 타격 피격음 SFX 매핑.

### 👾 에너미 AI (FSM) & 시야/그림자 가시성 리팩토링 (Ch 07)
- **적 FSM 알고리즘**: `EnemyBrain`, `EnemyLocomotion`, `EnemyAttack` 시스템의 기반이 되는 Idle ➡️ Chase ➡️ Attack ➡️ Dead 상태 체크 및 천이 로직 초안 구성.
- **시야 감지 및 그림자 동기화 버그 리팩토링**:
  - 시야 재진입 시 몬스터 포트레이트의 그림자(Shadow) 잔상이 애니메이션 없이 박제되던 결함을 분석.
    - `portrait.enabled = false` 방식 대신 `SetMeshAlphaAll` 및 `MoveToward` 기반의 **투명도(Alpha) 부드러운 페이드 아웃/인 트랜지션** 알고리즘으로 리팩토링하여 그림자 잔상 겹침 해결.
  - 한계 가시거리 벗어남 시 강제 렌더러 비활성화 처리.
- **전투 판정 보정**: 1차 조준선(`aimOrigin`)과 2차 발사점(`muzzleOrigin`) 오차로 인한 피격 유실 보정(`BoxCollider` 내 `targetPoint` 보정).

### 🏆 플레이 루프, 정산 (ResultUI) & 동조율 대사 필터링 (Ch 03, Ch 05, Ch 10)
- **핵심 플레이 루프 재조립**: (진입 ➡️ 탐색 ➡️ 탈출/사망 ➡️ 결과 정산 ➡️ 로비 복귀) 세션 루프 재조립 및 `DataManager`, `GameManager`, `ResultManager` 데이터 책임 분리.
- **결과 창 정산 및 탈출 처리 체계**:
  - `IResultService` 및 `ResultServiceLocator` 기반 서비스 로케이터 분리 (UtilsAD 어셈블리 결합 보정).
  - `ExitPoint` / `PlayerStatus` ➡️ `GameManager` 간 `OnEscapeRequest<bool>` 이벤트 연동.
  - 정산 시 Addressables 기반 아이콘 동적 로드 및 동조율(`LinkRateUp`) 상승 연산
  - 현재 세션 한정 실시간 킬 카운터 구현.
- **로비 대사 동조율 레벨 필터링**:
  - 누적 동조율 레벨 데이터를 역참조하여 해금된 대사만 로드하는 대사 필터 연동 ([LobbyMainUI.cs](../../../../UnityProject_LucidDiver/Assets/02_Scripts/UI/Lobby/LobbyMainUI.cs), [LocalJsonDialogueRepository.cs](../../../../UnityProject_LucidDiver/Assets/02_Scripts/System/Repository/LocalJsonDialogueRepository.cs)).
- **비주얼 노벨 스타일 심상 기록 UI**: 비주얼 노벨 연출 방식으로 UI 변경 및 대사/이미지 뷰어 연동.
- **설정 UI (SettingUI)**: 음량 조절 슬라이더 및 풀스크린/창 모드 동적 전환(`Screen.fullScreen`) 연동.

---

## 2. 미디어 에셋 첨부 (Video / Image / Audio)

| 구분 | 파일 경로 (relative to presentation/) | 에셋 설명 / 연출 포인트 |
|:---:|:---|:---|
| **오디오** | `assets/audio/SFX_Footstep_Concrete.mp3` | `AudioManager` 3D 위치 감쇄 및 오디오 소스 연동 샘플 |
| **오디오** | `assets/audio/BGM_Mart_Theme.mp3` | BGM 무한 재시작 방지 로직 연동 오디오 |
| **GIF** | `assets/images/CD_Enemy_FSM_Visibility.gif` | `SetMeshAlphaAll` 알파 페이드 처리된 다크 스피릿 FSM 시야 반응 |
| **이미지** | `assets/images/CD_ResultUI_System.png` | `ResultUI` 정산 패널 및 동조율/Addressables 로드 캡처 |
| **비디오** | `assets/[CD]우성혁/videos/Grenade_Play3DSoundAndReturn.mp4` | 스킬 사용 → 3D 사운드 재생 → 지속시간 경과 후 소멸까지의 전 과정 시연 |
| **이미지** | `assets/[CD]우성혁/images/GameDesign_Workflow.png` | 시스템 명세서 작성 워크플로우 구조도 |
| **이미지** | `assets/[CD]우성혁/images/GameDesign_SkillData_01.png`<br>`assets/[CD]우성혁/images/GameDesign_SkillData_01.png` | 스킬 명세서의 변수/함수 단위 기술 정리 캡처 |

---

## 3. 핵심 코드 스니펫 (Ch 07 & Ch 09)

```csharp
// 1. 시야 재진입 시 그림자 잔상 겹침 해결 (EnemyVisible.cs & AnimatorShadowSync.cs)
public void UpdateVisibility(float targetAlpha, float fadeSpeed)
{
    // portrait.enabled = false 대입으로 인한 Animator 중단 및 잔상 박제 방지
    // SetMeshAlphaAll을 이용해 Render Alpha 성분만 부드럽게 트랜지션
    currentAlpha = Mathf.MoveTowards(currentAlpha, targetAlpha, Time.deltaTime * fadeSpeed);
    shadowSync.ApplyShadowAlpha(currentAlpha);
}

// 2. 오디오 아키텍처 및 Dual Fallback 구조 (AudioManager.cs)
// 2D 사운드 재생 요청 처리
private void Play2DSound(int audioID)
{
    FindAudio(audioID, out AudioData _data, out AudioClip _clip);
    if (_clip == null) return;

    AudioSource _source = GetAudioSource(_data.AudioType);
    _source.volume = CalculateVolume(_data);

    // 이미 재생 중인 소스라면 무시 (무한 재시작 방지)
    if (_source.clip == _clip) return;

    if (_data.Loop)
    {
        _source.clip = _clip;
        _source.loop = _data.Loop;
        _source.Play();
    }
    else
    {
        _source.PlayOneShot(_clip, CalculateVolume(_data));
    }
}

// 3D 루프 사운드 재생 요청 처리 (루프 종료를 위해 GameObject를 out으로 리턴)
private GameObject Play3DSoundAndReturn(int audioID, Vector3 sourcePosition)
{
    FindAudio(audioID, out AudioData _data, out AudioClip _clip);
    if (_clip == null) return null;

    GameObject tempObj = new($"Temp3DSound_{audioID}");
    tempObj.transform.position = sourcePosition;

    AudioSource src = tempObj.AddComponent<AudioSource>();
    src.clip = _clip;
    src.spatialBlend = 1.0f; // 3D
    src.rolloffMode = AudioRolloffMode.Logarithmic;
    src.minDistance = 1f;
    src.maxDistance = Mathf.Max(10f, _data.Volume * 50f);
    src.volume = _data.Volume;
    src.outputAudioMixerGroup = _data.AudioType switch
    {
        AudioType.BGM     => BGMMixerGroup,
        AudioType.SFX     => SFXMixerGroup,
        AudioType.UI      => UIMixerGroup,
        AudioType.AMBIENT => AmbMixerGroup,
        _ => SFXMixerGroup
    };
    src.loop = _data.Loop;
    src.Play();

    if (!_data.Loop) Destroy(tempObj, _clip.length);
    return tempObj;
```
