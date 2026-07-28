import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const unityRoot = process.argv[2];

if (!unityRoot) {
  throw new Error("UnityProject_LucidDiver 경로를 첫 번째 인수로 전달해 주세요.");
}

const definitions = [
  {
    id: "EnemyBrain",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyBrain.cs",
    responsibility: "상황 판단, 행동 우선순위, 어그로와 상태 전환을 총괄합니다."
  },
  {
    id: "EnemyMovement",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyMovement.cs",
    responsibility: "Unity 생명주기에서 AI 모듈을 초기화하고 EnemyBrain의 Tick을 실행합니다."
  },
  {
    id: "EnemyStatus",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyStatus.cs",
    responsibility: "현재 FSM 상태와 공격·체력 정보를 보관하고 상태 전환 연출을 호출합니다."
  },
  {
    id: "EnemyMemory",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyMemory.cs",
    responsibility: "패트롤 루트, 마지막 인지 위치, 랜덤 목적지와 개별 복귀 정보를 기억합니다."
  },
  {
    id: "EnemyPerception",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyPerception.cs",
    responsibility: "시야각·거리·차폐와 소리 반경·장애물 조건을 판정합니다."
  },
  {
    id: "EnemyNoiseListener",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyNoiseListener.cs",
    responsibility: "소음 자극을 등록하고 유효한 조사 위치와 조사 유지 시간을 관리합니다."
  },
  {
    id: "EnemyCombat",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyCombat.cs",
    responsibility: "공격 가능 조건, 전조, 연속 돌진, 타격 판정과 후딜레이를 실행합니다."
  },
  {
    id: "EnemyLocomotion",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyLocomotion.cs",
    responsibility: "NavMesh 이동·정지·회전과 돌진 목적지 보정을 담당합니다."
  },
  {
    id: "EnemyPatrolRoute",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyPatrolRoute.cs",
    responsibility: "패트롤 포인트 반경에서 완전 경로로 도달 가능한 랜덤 목적지를 계산합니다."
  },
  {
    id: "EnemyPatrolPoint",
    sourcePath: "Assets/02_Scripts/System/Enemy/EnemyPatrolPoint.cs",
    responsibility: "패트롤 포인트별 배회 반경, 횟수와 대기 시간 설정을 제공합니다."
  },
  {
    id: "SpawnManager",
    sourcePath: "Assets/02_Scripts/Manager/GameSystem/SpawnManager.cs",
    responsibility: "스폰 지점을 선택하고 개체에 패트롤 루트와 시작 인덱스를 전달합니다."
  }
];

const files = Object.fromEntries(definitions.map(definition => {
  const absolutePath = path.join(unityRoot, ...definition.sourcePath.split("/"));
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`원본 스크립트를 찾을 수 없습니다: ${absolutePath}`);
  }

  return [definition.id, {
    ...definition,
    code: fs.readFileSync(absolutePath, "utf8").replace(/\r\n/g, "\n")
  }];
}));

const output = [
  "/* Unity 원본에서 생성한 발표·포트폴리오용 읽기 전용 코드 스냅샷입니다. */",
  `window.ENEMY_CODE_FILES = ${JSON.stringify(files, null, 2)};`,
  ""
].join("\n");

fs.writeFileSync(path.join(here, "enemy-code-data.js"), output, "utf8");
console.log(`Generated ${Object.keys(files).length} code snapshots.`);
