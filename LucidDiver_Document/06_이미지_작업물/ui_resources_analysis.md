# 유니티 UI 이미지 리소스 요구 분석서 (DemoScene & LobbyScene)

본 문서는 유니티 프로젝트 내의 `DemoScene` 및 `LobbyScene`에서 호출되는 모든 UI 프리팹을 정밀 분석하여, 향후 실무 작업 및 제작이 필요한 UI 이미지 그래픽 리소스 목록을 분류별로 상세히 도출한 결과입니다.

---

## 1. 캐릭터 일러스트 및 초상화 리소스 (Character Art)

로비 화면, 출격 준비 화면, 다이버 기록 창 및 인게임 좌상단 UI에서 캐릭터의 비주얼 정체성을 나타내기 위해 가장 우선적으로 작업이 필요한 핵심 그래픽 자산입니다.

| 필요 리소스명 | 프리팹 내 위치 및 게임오브젝트 경로 | 현재 상태 (Placeholder) | 디자인 작업 요구사항 |
| :--- | :--- | :--- | :--- |
| **유안 전신 스탠딩 일러스트**<br>(Yuan Standing) | - `Canvas-Lobby`의 `Image-DiverStanding`<br>- `Canvas-SortiePrepare`의 `Image-DiverPortrait`<br>- `Canvas-DiverRecord`의 `Image-DiverPortrait` | `Chaerin_Standing_v2.1.png`<br>(채린 이미지 임시 할당됨) | 채린의 임시 이미지를 제거하고, 기획서 기준 캐릭터인 **'유안(Yuan)'**의 전신 스탠딩 고해상도 투명 배경 일러스트(PNG)로 교체 및 통일해야 합니다. |
| **유안 인게임 UI 초상화**<br>(Yuan Status Portrait) | - `Canvas-GameUI`의 `Image-player` | `None`<br>(공란 및 흰색 이미지) | 인게임 전투 중 좌상단 HP/MP 게이지 바 왼쪽에 작게 들어갈 **유안의 페이스/버스트 컷 초상화(둥근 원형 혹은 사각 프레임에 어울리는 구도)**가 필요합니다. |
| **유안 결과창 스탠딩**<br>(Yuan Result Standing) | - `Canvas-ResultPanel`의 `Image-PlayerStanding` | `None`<br>(공란 및 흰색 이미지) | 스테이지 클리어/실패 결과가 출력될 때 화면 우측 혹은 좌측 영역에 나타날 **유안의 결과 화면 연출용 스탠딩 일러스트**가 필요합니다. (성공 시 자신만만한 연출, 실패 시 부상/지친 연출 등으로 변형 작업 시 퀄리티 상승) |

---

## 2. 아이템 및 장비 아이콘 리소스 (Item & Weapon Icons)

인게임 퀵슬롯, 가방 인벤토리, 창고 보관함 및 결과창 획득 목록에서 사용되는 개별 아이템의 고유 직관성을 높이기 위한 아이콘 세트입니다.

| 필요 리소스명 | 프리팹 내 위치 및 게임오브젝트 경로 | 현재 상태 (Placeholder) | 디자인 작업 요구사항 |
| :--- | :--- | :--- | :--- |
| **기묘한 사탕 아이콘**<br>(Strange Candy Icon) | - `Canvas-GameUI`의 퀵슬롯 `Image-Consumable`<br>- `Canvas-SortiePrepare`의 장착 슬롯 아이콘<br>- `Canvas-StorageInventory`의 가방/창고 슬롯 아이콘<br>- `Canvas-ResultPanel`의 `Image-ManaStoneIcon` | `img_ManaPiece.png`<br>또는 `None` | 기존 '마나석'의 임시 아이콘을 대체하는 **기괴하면서도 몽환적인 캔디(Strange Candy)** 형태의 고유 아이템 아이콘이 필요합니다. |
| **변질된 붕대 아이콘**<br>(Altered Bandage Icon) | - `Canvas-GameUI`의 퀵슬롯 `Image-Consumable`<br>- `Canvas-SortiePrepare`의 장착 슬롯 아이콘<br>- `Canvas-StorageInventory`의 가방/창고 슬롯 아이콘<br>- `Canvas-ResultPanel`의 `Image-PotionIcon` | `img_HealMedicine.png`<br>또는 `None` | 기존 '회복약/포션'의 임시 아이콘을 대체하는 **헤어지거나 변색된 피 묻은 붕대(Altered Bandage)** 느낌의 아이콘이 필요합니다. |
| **기억 파편 아이콘**<br>(Memory Fragment Icon) | - `Canvas-ResultPanel`의 `Image-MemoryFragmentIcon`<br>- 가방 인벤토리 내 전용 아이콘 슬롯 | `Img_MemoryPiece.png`<br>또는 `None` | 파랑/금색 톤의 깨진 유리 조각이나 빛나는 결정체 형태의 **기억 파편(Memory Fragment)** 아이콘 제작이 필요합니다. |
| **플레이어 주무기 아이콘**<br>(Weapon Icon) | - `Canvas-GameUI`의 `Image-WeaponImage` (퀵슬롯 좌측) | `img_testGun.png`<br>또는 `None` | 플레이어가 장착하고 사용하는 총기류 또는 근접 무기의 실루엣이 드러나는 **무기 장착 아이콘**이 필요합니다. |

---

## 3. UI 프레임 및 컨테이너 리소스 (UI Borders & Backgrounds)

텍스트와 아이콘을 감싸고, 화면의 전반적인 분위기(다크 테마, SF 몽환)를 형성하는 구조성 이미지 자산들입니다. 현재 대다수가 유니티 기본 흰색 사각형(`FillImage` 또는 `UISprite`)을 스케일 조절하여 임시로 색칠해 놓은 상태입니다.

| 필요 리소스명 | 프리팹 내 위치 및 게임오브젝트 경로 | 현재 상태 (Placeholder) | 디자인 작업 요구사항 |
| :--- | :--- | :--- | :--- |
| **로비 창 배경 아트**<br>(Lobby Room BG) | - `Canvas-Lobby`의 `Image-Background`<br>- `Canvas-StorageInventory`의 `Image-BG` | `Lobby_Controller_Concept_v2.1.png`<br>(컨셉 스케치 수준 임시 백그라운드) | 실제 관제실(Control Room) 테마에 어울리는 **최종 완성형 백그라운드 일러스트 및 모니터 패널 광원 배경** 그래픽 작업이 필요합니다. |
| **대화창 박스 프레임**<br>(Dialogue Box Frame) | - `Canvas-Lobby`의 `Image-DialogueBoxBG`<br>- `Canvas-ResultPanel`의 `Panel-PlayerDialogue` | 유니티 기본 `UISprite`<br>(단색 검은색 오버레이 처리) | 캐릭터 대사 출력 시 가독성을 높이고 게임의 사이버네틱/다크 비주얼을 살릴 수 있는 **세련된 네온 라인 테두리가 들어간 반투명 대사창 프레임**이 필요합니다. |
| **UI 슬롯 테두리 프레임**<br>(Item Slot Border) | - 인벤토리 슬롯 `UI-InventorySlot`<br>- 퀵슬롯 `Consumable/Image-Background`<br>- 출격 준비 `Button-ItemSlot` | `FillImage.jpg`<br>(일반 흰색 사각형에 짙은 회색 필터) | 장착되거나 보관된 아이템 등급/종류에 맞게 사용할 수 있는 **슬롯 외곽 테두리 프레임(빈 슬롯용 점선 프레임 포함)** 제작이 필요합니다. |
| **HP/MP 게이지 슬라이더**<br>(HP/MP Fill Textures) | - `Canvas-GameUI`의 `HpBar`<br>- `Canvas-GameUI`의 `MpBar` | `FillImage.jpg`<br>(기본 사각형 스프라이트 채우기) | 단순한 단색 막대가 아닌, 체력(빨강)과 마나(파랑)가 차오르는 느낌을 주는 **그라데이션 및 빗금 무늬 텍스처가 적용된 게이지 충전 바 바디와 배경 테두리**가 필요합니다. |
| **다이버 정보창 카드 배경**<br>(Diver Info Card Frame) | - `Canvas-Lobby`의 `Image-DiverInfoBoxBG`<br>- `Canvas-SortiePrepare`의 `Panel-DiverInfoCard`<br>- `Canvas-DiverRecord`의 `Panel-DiverInfoCard` | 유니티 기본 `Background`<br>(단색 검은색 처리) | 캐릭터 스탯, 이름, 동조율 정보 등이 가독성 있게 올라갈 **SF 테마의 정보 카드 플레이트 프레임**이 필요합니다. |
| **아이템 정보 툴팁 팝업**<br>(Item Tooltip Plate) | - `Canvas-StorageInventory`의 `Panel-ItemDescription` | 유니티 기본 `Background` | 아이템 선택 시 나타나는 설명문 공간의 **우아한 사이드 팝업창용 스킨 플레이트**가 필요합니다. |
| **상자 파밍 전용 패널 배경**<br>(Chest UI Frame) | - `Canvas-ChestUI`의 `Image-Background` 및 `Image-ChestSpace` | `FillImage.jpg` | 필드 상자 상호작용 시 열리는 인게임 전용 루팅 팝업창을 위한 **기계식 금속 잠금 또는 스팀펑크 느낌의 루팅 박스 테두리**가 필요합니다. |

---

## 4. 연출용 아이콘 및 엠블럼 리소스 (Emblems & Banners)

게임의 주요 성공/실패 연출 및 소속감, 정보 시각화를 돕는 상징성 그래픽 요소입니다.

| 필요 리소스명 | 프리팹 내 위치 및 게임오브젝트 경로 | 현재 상태 (Placeholder) | 디자인 작업 요구사항 |
| :--- | :--- | :--- | :--- |
| **결과창 성공/실패 배너**<br>(Result Banner Graphic) | - `Canvas-ResultPanel`의 `Image-Banner` | `None`<br>(공란) | 스테이지 종료 후 인게임 중앙에 극적으로 연출될 **"MISSION COMPLETE" / "CONNECTION LOST"** 텍스트 그래픽 로고 배너가 필요합니다. |
| **다이버 소속 엠블럼**<br>(Diver Emblem Icon) | - `Canvas-Lobby`의 `Image-DiverEmblem`<br>- `Canvas-SortiePrepare`의 `Image-DiverEmblem` | `Knob` / `FillImage`<br>(임시 원형 모양) | 유안이 속한 다이버 부서 또는 관제 조직의 독창적인 디자인이 가미된 **엠블럼 심볼 마크**가 필요합니다. |
| **메모리 로그 썸네일**<br>(Memory Log Thumbnails) | - `Canvas-DiverRecord` 내 로그 버튼들의 `Image-Thumbnail` | `None`<br>(공란) | 다이버의 과거 및 대외 경계 기록을 보여주는 각각의 로그 카드 내에 삽입될 **추상적인 기억 노이즈 패턴, 기밀 서류 폴더 디자인, 혹은 스케치풍의 썸네일 일러스트 2~3종**이 필요합니다. |
| **아이템 드롭/손실 경고 오버레이**<br>(Item Lost overlay icon) | - `Canvas-ResultPanel`의 `Image-ManaStoneLost`<br>- `Canvas-ResultPanel`의 `Image-PotionLost` | `Knob`<br>(기본 빨간색 원형 임시 배치) | 스테이지 실패 시 아이템을 잃어버렸음을 명확하게 보여줄 수 있는 **직관적인 경고 아이콘(예: 붉은색 해골, 사선 경고 슬래시, X 마크 등)**이 필요합니다. |
| **화면 탭 전환 화살표**<br>(Transfer Arrow Icon) | - `Canvas-StorageInventory`의 `Image-Arrow` | `None`<br>(공란) | 창고와 인벤토리 사이에서 아이템이 이동할 수 있음을 나타내는 **좌/우 방향 지시 화살표 디자인**이 필요합니다. |

---

## 5. UI 폰트 애셋 (Font Asset)
- 현재 씬 내부의 모든 텍스트 메쉬 프로(TMP) 요소들이 유니티의 기본 번들 폰트인 **`LiberationSans SDF`**를 참조하고 있어, 기획서의 어둡고 몽환적인 SF 분위기를 전혀 살리지 못하고 있으며 특히 한국어 폰트가 깨질 우려가 큽니다.
- **조치 요구사항**: SF 테마에 어울리는 세련된 고딕/산세리프 계열의 **커스텀 한글 폰트(예: 프리텐다드 Pretendard, 본고딕 Noto Sans KR, 혹은 Orbit 등)**를 준비하여 텍스트 메쉬 프로 폰트 애셋(Font Asset)으로 변환 후 적용해야 합니다.
