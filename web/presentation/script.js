window.scenes = [];
  // currentSceneIndex global

    // ══════════════════════════════════════════════════════════
    //  VANILLA JAVASCRIPT LOGIC

    // ══════════════════════════════════════════════════════════
    // scenes declared globally
    let currentIdx = 0;
    let isNotesOpen = false;
    let isMenuOpen = false;
    let isDebugMode = false;
    // 16:9 반응형 자동 스케일링 함수
    function resizeViewport() {
      const viewport = document.getElementById('viewport');
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;
      const scaleX = windowWidth / baseWidth;
      const scaleY = windowHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY);
      viewport.style.transform = `scale(${scale})`;
      viewport.style.left = `${(windowWidth - baseWidth * scale) / 2}px`;
      viewport.style.top = `${(windowHeight - baseHeight * scale) / 2}px`;
    }
    // 초기화 함수
    function initPresentation() {
      scenes = Array.from(document.querySelectorAll('.scene'));
      // 디버그 파라미터 확인 (?debug=1 or debug)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('debug') || window.location.hash === '#debug') {
        toggleDebug(true);
      }
      // 해시값 기준으로 초기 장면 복원
      const hash = window.location.hash;
      let startIdx = 0;
      if (hash && hash.startsWith('#scene-')) {
        const idStr = hash.replace('#scene-', '');
        const targetIdx = scenes.findIndex(s => {
          const ch = s.getAttribute('data-chapter');
          const sc = s.getAttribute('data-scene');
          return `${ch}-${sc}` === idStr;
        });
        if (targetIdx !== -1) {
          startIdx = targetIdx;
        }
      }
      showScene(startIdx);
      buildChapterMenu();
      resizeViewport();
      // 오프닝 첫 슬라이드 터미널 타이핑 작동
      startBootTerminal();
    }
    // 특정 장면 표시 (철통 전환 보장)
    function showScene(index) {
      if (!scenes || scenes.length === 0) return;
      // 범위 이탈 보정
      if (index < 0) index = 0;
      if (index >= scenes.length) index = scenes.length - 1;
      // 포커스 하이재킹 해제 (방향키 조작 락 방지)
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      try {
        // 모든 씬의 active 클래스 강제 클리어 (중복 덮임 및 화면 조작 마비 100% 차단)
        scenes.forEach((s, idx) => {
          if (s) {
            s.classList.remove('active');
            s.querySelectorAll('video').forEach(video => {
              try { video.pause(); } catch (err) {}
            });
          }
        });
        currentIdx = index;
        const nextActive = scenes[currentIdx];
        if (!nextActive) return;
        // 현재 씬 활성화
        nextActive.classList.add('active');
        // 활성화된 장면에 자동 재생 비디오가 있다면 재생
        nextActive.querySelectorAll('video[autoplay]').forEach(video => {
          video.play().catch(() => {});
        });
        // HUD 및 정보 업데이트
        updateHUD(nextActive);
        // 대본 업데이트 (안전 가드)
        const notesBody = document.getElementById('notesBody');
        if (notesBody) {
          const notes = nextActive.getAttribute('data-notes') || '작성된 대본이 없습니다.';
          notesBody.innerHTML = notes.replace(/\n/g, '<br>');
        }
        // 디버그 정보 업데이트
        if (isDebugMode) {
          updateDebugInfo(nextActive);
        }
        // 슬라이드 체인지 애니메이션 트리거 (안전 호출)
        triggerSceneAnimation(nextActive);
        // 해시 업데이트 (스크롤 없이 상태 기록)
        const ch = nextActive.getAttribute('data-chapter') || '00';
        const sc = nextActive.getAttribute('data-scene') || '01';
        history.replaceState(null, '', `#scene-${ch}-${sc}`);
      } catch (e) {
        console.warn('showScene execution recovered gracefully:', e);
      }
    }
    // 미선언 예방용 안전 애니메이션 및 씬 리셋 제어 함수
    function resetSceneState(idx) {
      // 장면 복구용 상태 안전 리셋
    }
    function triggerSceneAnimation(activeScene) {
      if (!activeScene) return;
      const ch = activeScene.getAttribute('data-chapter');
      const sc = activeScene.getAttribute('data-scene');
      if (ch === '01' && sc === '01') {
        triggerOverviewAnimation();
      }
    }
    // 장면 이동 (락 무효화)
    function nextScene() {
      if (isMenuOpen) {
        closeChapterMenu();
      }
      if (currentIdx < scenes.length - 1) {
        showScene(currentIdx + 1);
      }
    }
    function prevScene() {
      if (isMenuOpen) {
        closeChapterMenu();
      }
      if (currentIdx > 0) {
        showScene(currentIdx - 1);
      }
    }
    // HUD 정보 업데이트
    function updateHUD(scene) {
      const ch = scene.getAttribute('data-chapter');
      const sc = scene.getAttribute('data-scene');
      const title = scene.getAttribute('data-title');
      const presenter = scene.getAttribute('data-presenter');
      document.getElementById('hudChapter').textContent = `CH ${ch}`;
      document.getElementById('hudSceneNum').textContent = `SCENE ${sc}`;
      document.getElementById('hudSceneTitle').textContent = title;
      document.getElementById('hudPresenter').textContent = `발표: ${presenter}`;
      // 진행률 퍼센트 계산
      const pct = ((currentIdx + 1) / scenes.length) * 100;
      document.getElementById('progressBar').style.width = `${pct}%`;
    }
    // 대본 노출 토글
    function togglePresenterNotes() {
      const panel = document.getElementById('presenterNotesPanel');
      isNotesOpen = !isNotesOpen;
      if (isNotesOpen) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    }
    // 챕터 점프 메뉴
    function buildChapterMenu() {
      const grid = document.querySelector('.chapter-menu-grid');
      grid.innerHTML = '';
      // 챕터별 그룹화
      const chapters = {};
      scenes.forEach((s, idx) => {
        const ch = s.getAttribute('data-chapter');
        const title = s.getAttribute('data-title');
        if (!chapters[ch]) {
          chapters[ch] = [];
        }
        chapters[ch].push({ idx, title, sc: s.getAttribute('data-scene') });
      });
      // HTML 빌드
      for (const ch in chapters) {
        const group = document.createElement('div');
        group.className = 'chapter-menu-group';
        const chTitle = getChapterName(ch);
        group.innerHTML = `<h3>CH ${ch}. ${chTitle}</h3>`;
        const list = document.createElement('div');
        list.className = 'chapter-menu-list';
        chapters[ch].forEach(scene => {
          const btn = document.createElement('button');
          btn.className = `btn-menu-jump ${scene.idx === currentIdx ? 'active' : ''}`;
          btn.textContent = `Sc ${scene.sc} - ${scene.title}`;
          btn.onclick = () => {
            showScene(scene.idx);
            closeChapterMenu();
          };
          list.appendChild(btn);
        });
        group.appendChild(list);
        grid.appendChild(group);
      }
    }
    function toggleChapterMenu() {
      if (isMenuOpen) {
        closeChapterMenu();
      } else {
        openChapterMenu();
      }
    }
    function openChapterMenu() {
      const overlay = document.getElementById('chapterMenuOverlay');
      // 활성화된 슬라이드에 active 클래스 갱신 적용
      buildChapterMenu();
      overlay.classList.add('active');
      isMenuOpen = true;
    }
    function closeChapterMenu() {
      const overlay = document.getElementById('chapterMenuOverlay');
      overlay.classList.remove('active');
      isMenuOpen = false;
    }
    function getChapterName(ch) {
      const names = {
        '00': 'Opening Cinematic',
        '01': 'Project Overview',
        '02': 'CP 장수영 (세계관 · AnyPortrait · SFX)',
        '03': 'CD 우성혁 (시스템 명세 · FSM AI · 3D오디오)',
        '04': 'PM 송예찬 (일정 WBS · 튜토리얼 · 체스트)',
        '05': 'PD 김남해 (마트 레벨 · 툰 셰이더 · 손전등)',
        '06': 'TD 강다영 (클라이언트 · 인벤토리 · VFX풀링)',
        '07': 'Full Gameplay Demo',
        '08': 'Ending & Q&A'
      };
      return names[ch] || 'Others';
    }
    // 전체 화면 전환
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }
    // 디버그 모드 작동
    function toggleDebug(force = null) {
      isDebugMode = force !== null ? force : !isDebugMode;
      const overlay = document.getElementById('debugOverlay');
      if (isDebugMode) {
        overlay.classList.add('active');
        const activeScene = scenes[currentIdx];
        if (activeScene) updateDebugInfo(activeScene);
      } else {
        overlay.classList.remove('active');
      }
    }
    function updateDebugInfo(scene) {
      document.getElementById('dbgIndex').textContent = `${currentIdx + 1} / ${scenes.length}`;
      document.getElementById('dbgType').textContent = scene.getAttribute('data-type') || 'CORE';
      document.getElementById('dbgPresenter').textContent = scene.getAttribute('data-presenter') || '-';
      document.getElementById('dbgTime').textContent = scene.getAttribute('data-time') || '2분 00초';
      // 마크다운 형태의 TODO 검색 및 경고
      const notes = scene.getAttribute('data-notes') || '';
      const todoMatch = /\[(TODO|INTERVIEW|ASSET)\][^\n]*/g.exec(notes);
      document.getElementById('dbgTodo').textContent = todoMatch ? todoMatch[0] : '대기사항 없음 (CLEAR)';
    }
    // 이미지 로드 실패 처리
    function handleImageError(img, fileName) {
      const parent = img.parentNode;
      img.style.display = 'none';
      const errBox = document.createElement('div');
      errBox.className = 'media-error-box';
      errBox.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
        </svg>
        <span>이미지 로드 오류</span>
        <span class="media-error-filename">assets/images/${fileName}</span>
      `;
      parent.appendChild(errBox);
    }
    // 키보드 바인딩 이벤트 리스너
    window.addEventListener('keydown', (e) => {
      // 텍스트 필드를 입력 중이거나 모달 제어 시 조작 잠금 예방
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextScene();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevScene();
          break;
        case 'Home':
          e.preventDefault();
          showScene(0);
          break;
        case 'End':
          e.preventDefault();
          showScene(scenes.length - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          togglePresenterNotes();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleChapterMenu();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetSceneState(currentIdx);
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          toggleDebug();
          break;
        case 'Escape':
          e.preventDefault();
          if (isMenuOpen) {
            closeChapterMenu();
          } else if (isNotesOpen) {
            togglePresenterNotes();
          } else if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    });
    // 마우스 휠 네비게이션 (쿨다운 디바운스 적용)
    let isWheelThrottled = false;
    window.addEventListener('wheel', (e) => {
      if (isMenuOpen || isWheelThrottled) return;
      if (Math.abs(e.deltaY) < 20) return;
      isWheelThrottled = true;
      if (e.deltaY > 0) {
        nextScene();
      } else {
        prevScene();
      }
      setTimeout(() => {
        isWheelThrottled = false;
      }, 400);
    }, { passive: true });
    // 화면 아무 데나 클릭 시 포커스 회수 (방향키 독점 예방)
    window.addEventListener('click', () => {
      if (document.activeElement && (document.activeElement.tagName === 'IFRAME' || document.activeElement.tagName === 'BUTTON')) {
        document.activeElement.blur();
      }
    });
    // 윈도우 스케일링 이벤트 리스너
    window.addEventListener('resize', resizeViewport);
    window.addEventListener('load', initPresentation);

    // ══════════════════════════════════════════════════════════
    //  장면별 개별 연출 및 인터랙션 스크립트

    // ══════════════════════════════════════════════════════════
    // ── [CH 00 / SC 01] 오프닝 부팅 터미널 연출 ──
    const terminalLines = [
      "ESTABLISHING CONTEXT COGNITIVE BRIDGE...",
      "TARGET DOMAIN: DEEP DREAM SYSTEM [LUCID_DIVER]",
      "CREW ON-DECK: REMnants",
      "CHECKING DIVER INTEGRITY... SUCCESS",
      "CHECKING TACTICAL LINK... SUCCESS",
      "ESTABLISHED MIND LINK STAGE P-0.5",
      "CRITICAL: SLEEP DISEASE DETECTION RATIO 100%",
      "CONNECTING..."
    ];
    function startBootTerminal() {
      const output = document.getElementById('bootTerminalOutput');
      if (!output) return;
      output.innerHTML = '';
      let lineIdx = 0;
      function printLine() {
        if (lineIdx < terminalLines.length) {
          const div = document.createElement('div');
          div.className = 'log-line show';
          div.innerHTML = `<span style="color:#00ffcc">></span> ${terminalLines[lineIdx]}`;
          output.appendChild(div);
          lineIdx++;
          setTimeout(printLine, 350);
        } else {
          // 커서 깜빡임과 버튼 활성화
          const cursorDiv = document.createElement('div');
          cursorDiv.innerHTML = `<span class="terminal-cursor"></span>`;
          output.appendChild(cursorDiv);
          document.getElementById('bootActionContainer').style.opacity = '1';
        }
      }
      setTimeout(printLine, 500);
    }
    // ── [CH 01 / SC 01] 개요 순차 텔레메트리 ──
    function triggerOverviewAnimation() {
      const lines = document.querySelectorAll('#overviewLogTerminal .log-line');
      lines.forEach(line => {
        const delay = parseInt(line.getAttribute('data-delay') || '0', 10);
        setTimeout(() => {
          line.classList.add('show');
        }, delay);
      });
      // 우측 성과 카드 노출 (안전 체크)
      const p1 = document.getElementById('pillar1');
      const p2 = document.getElementById('pillar2');
      if (p1) setTimeout(() => p1.classList.add('show'), 1500);
      if (p2) setTimeout(() => p2.classList.add('show'), 2200);
    }
    // ── [CH 01 / SC 02] 3D Flip 크루 카드 토글 ──
    function toggleCrewFlip(cardElement) {
      cardElement.classList.toggle('flipped');
    }
    // ── [CH 02 / SC 01] 디자인 챌린지 인터랙션 ──
    let challengeMouseHandler = null;
    function triggerChallengeAnimation() {
      const node = document.getElementById('conflictNode');
      const overlay = document.getElementById('resolutionOverlay');
      const bgSub = document.getElementById('bgSubculture');
      const bgExt = document.getElementById('bgExtraction');
      // 발표 중 마우스가 노드에 올 때 연출
      node.style.cursor = 'pointer';
      node.onclick = () => {
        node.textContent = 'SYNC';
        node.classList.add('resolved');
        overlay.classList.add('show');
        // 마우스 트래킹 중단 + 듀얼 배경 페이드아웃 + 키비주얼 페이드인
        if (challengeMouseHandler) {
          document.removeEventListener('mousemove', challengeMouseHandler);
          challengeMouseHandler = null;
        }
        if (bgSub) bgSub.style.opacity = '0';
        if (bgExt) bgExt.style.opacity = '0';
        const bgResolved = document.getElementById('bgResolved');
        if (bgResolved) bgResolved.style.opacity = '0.7';
      };
      // 마우스 X 위치에 따른 듀얼 배경 크로스페이드
      if (challengeMouseHandler) {
        document.removeEventListener('mousemove', challengeMouseHandler);
      }
      challengeMouseHandler = (e) => {
        const viewport = document.getElementById('viewport');
        if (!viewport || !bgSub || !bgExt) return;
        const rect = viewport.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width; // 0(left) ~ 1(right)
        // 0.3~0.7 구간에서 전환이 완료되도록 리매핑 (카드 중반 = 풀 전환)
        const remapped = Math.max(0, Math.min(1, (relX - 0.3) / 0.4));
        const maxOpacity = 0.6;
        bgSub.style.opacity = maxOpacity * (1 - remapped);
        bgExt.style.opacity = maxOpacity * remapped;
      };
      document.addEventListener('mousemove', challengeMouseHandler);
    }
    // ── [CH 03 / SC 01] 핵심 플레이 루프 인터랙티브 & 스크린샷 뷰어 ──
    const loopSteps = [
      {
        title: "01. 출격 준비",
        desc: "소지품 슬롯과 아티팩트를 정비하고 출격을 준비합니다.",
        imgSrc: "assets/[CP]장수영/images/CP_UI_Sortie_Preparation.png"
      },
      {
        title: "02. 세션 진입",
        desc: "인게임 세션 구역에 진입하여 필드 플레이를 시작합니다.",
        imgSrc: "assets/[CP]장수영/images/CP_Session_01_Entry.png"
      },
      {
        title: "03. 아이템 / 파편 탐색",
        desc: "상자를 상호작용하여 아이템과 파편을 루팅하고 파밍합니다.",
        imgSrc: "assets/[CP]장수영/images/CP_Session_02_Looting.png"
      },
      {
        title: "04. 에너미 전투",
        desc: "필드의 몬스터와 마주쳐 사격 및 스킬 전투를 진행합니다.",
        imgSrc: "assets/[CP]장수영/images/CP_Session_03_Combat.png"
      },
      {
        title: "05. 탈출 / 탈출 실패",
        desc: "탈출 구역을 통해 안전하게 탈출하거나, 실패 시 결산을 확인합니다.",
        imgSrc: "assets/[CP]장수영/images/CP_Session_04_Extraction_Success.png"
      },
      {
        title: "06. 서사 보상 확인",
        desc: "탈출 후 획득한 기억 파편으로 다이버의 개인 심상기록이 해금됩니다. 서브컬처 서사 보상이 익스트랙션 루프의 동기를 부여하는 핵심 연결고리입니다.",
        imgSrc: "assets/[CP]장수영/images/CP_Narrative_Reward_Record.png"
      }
    ];
    let currentLoopStep = 0;
    function activateLoopStep(stepIdx) {
      currentLoopStep = stepIdx;
      const rows = document.querySelectorAll('.loop-node-row');
      rows.forEach((r, i) => {
        if (i === stepIdx) r.classList.add('active');
        else r.classList.remove('active');
      });
      const titleEl = document.getElementById('loopStepTitle');
      const descEl = document.getElementById('loopStepDesc');
      const imgEl = document.getElementById('loopImageDisplay');
      const previewBox = document.querySelector('.loop-preview-box');
      const routeToggleBox = document.getElementById('loopRouteToggleContainer');
      if (previewBox) {
        previewBox.classList.add('card-swapping');
        setTimeout(() => {
          if (titleEl) titleEl.textContent = loopSteps[stepIdx].title;
          if (descEl) descEl.textContent = loopSteps[stepIdx].desc;
          if (imgEl) {
            imgEl.src = loopSteps[stepIdx].imgSrc;
            imgEl.alt = loopSteps[stepIdx].title;
            imgEl.classList.remove('loop-card-enter');
            void imgEl.offsetWidth; // trigger reflow
            imgEl.classList.add('loop-card-enter');
          }
          previewBox.classList.remove('card-swapping');
        }, 180);
      } else {
        if (titleEl) titleEl.textContent = loopSteps[stepIdx].title;
        if (descEl) descEl.textContent = loopSteps[stepIdx].desc;
        if (imgEl) {
          imgEl.src = loopSteps[stepIdx].imgSrc;
          imgEl.alt = loopSteps[stepIdx].title;
        }
      }
      if (routeToggleBox) {
        if (stepIdx === 4) {
          routeToggleBox.style.display = 'block';
          routeToggleBox.classList.remove('route-anim-active');
          void routeToggleBox.offsetWidth; // trigger reflow
          routeToggleBox.classList.add('route-anim-active');
        } else {
          routeToggleBox.style.display = 'none';
          routeToggleBox.classList.remove('route-anim-active');
        }
      }
    }
    function toggleLoopRoute(routeType) {
      const successBtn = document.querySelector('.btn-route--success');
      const failureBtn = document.querySelector('.btn-route--failure');
      const resultText = document.getElementById('routeResultText');
      const imgEl = document.getElementById('loopImageDisplay');
      const previewBox = document.querySelector('.loop-preview-box');
      if (previewBox) {
        previewBox.classList.add('card-swapping');
        setTimeout(() => {
          if (routeType === 'success') {
            if (successBtn) successBtn.classList.add('active');
            if (failureBtn) failureBtn.classList.remove('active');
            if (imgEl) {
              imgEl.src = "assets/[CP]장수영/images/CP_Session_04_Extraction_Success.png";
              imgEl.classList.remove('loop-card-enter');
              void imgEl.offsetWidth;
              imgEl.classList.add('loop-card-enter');
            }
            if (resultText) {
              resultText.style.color = 'var(--accent-teal)';
              resultText.innerHTML = '<strong>[탈출 성공]</strong> 탈출 성공! 획득한 파편과 아이템 보존 완료.';
            }
          } else {
            if (failureBtn) failureBtn.classList.add('active');
            if (successBtn) successBtn.classList.remove('active');
            if (imgEl) {
              imgEl.src = "assets/[CP]장수영/images/CP_Session_05_Extraction_Failure.png";
              imgEl.classList.remove('loop-card-enter');
              void imgEl.offsetWidth;
              imgEl.classList.add('loop-card-enter');
            }
            if (resultText) {
              resultText.style.color = 'var(--accent-red)';
              resultText.innerHTML = '<strong>[탈출 실패]</strong> 탈출 실패... 획득 파편 유실 결산.';
            }
          }
          previewBox.classList.remove('card-swapping');
        }, 180);
      }
    }
    // ── [CH 05 / SC 01] UI 비교 슬라이더 연출 ──
    function handleComparisonMove(e) {
      const frame = document.getElementById('compFrame');
      const afterImg = document.getElementById('compAfterImg');
      const slider = document.getElementById('compSlider');
      const rect = frame.getBoundingClientRect();
      let x = (e.clientX || e.touches[0].clientX) - rect.left;
      // 경계 제한
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      const pct = (x / rect.width) * 100;
      afterImg.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      slider.style.left = `${pct}%`;
    }
    // ── [CH 05 / SC 02] UI 시뮬레이터 탭 전환 ──
    function switchSimTab(tabIdx) {
      const tabs = document.querySelectorAll('.btn-sim-tab');
      const panels = document.querySelectorAll('.sim-panel');
      tabs.forEach((tab, i) => {
        if (i === tabIdx) tab.classList.add('active');
        else tab.classList.remove('active');
      });
      panels.forEach((panel, i) => {
        if (i === tabIdx) panel.classList.add('active');
        else panel.classList.remove('active');
      });
    }
    // ── 장면 진입 애니메이션 트리거 ──
    function triggerSceneAnimation(scene) {
      const ch = scene.getAttribute('data-chapter');
      const sc = scene.getAttribute('data-scene');
      if (ch === '01' && sc === '01') {
        triggerOverviewAnimation();
      } else if (ch === '02' && sc === '01') {
        triggerChallengeAnimation();
      }
    }
    // ── 장면 상태 초기화 함수 (R키 또는 장면 이동 시 작동) ──
    function resetSceneState(index) {
      const scene = scenes[index];
      if (!scene) return;
      const ch = scene.getAttribute('data-chapter');
      const sc = scene.getAttribute('data-scene');
      if (ch === '00' && sc === '01') {
        startBootTerminal();
      }
      else if (ch === '01' && sc === '01') {
        const lines = document.querySelectorAll('#overviewLogTerminal .log-line');
        lines.forEach(line => line.classList.remove('show'));
        document.getElementById('pillar1').classList.remove('show');
        document.getElementById('pillar2').classList.remove('show');
      }
      else if (ch === '02' && sc === '01') {
        const node = document.getElementById('conflictNode');
        const overlay = document.getElementById('resolutionOverlay');
        node.textContent = '?';
        node.classList.remove('resolved');
        overlay.classList.remove('show');
        // 듀얼 배경 초기화
        const bgSub = document.getElementById('bgSubculture');
        const bgExt = document.getElementById('bgExtraction');
        if (bgSub) bgSub.style.opacity = '0.35';
        if (bgExt) bgExt.style.opacity = '0';
        const bgResolved = document.getElementById('bgResolved');
        if (bgResolved) bgResolved.style.opacity = '0';
        if (challengeMouseHandler) {
          document.removeEventListener('mousemove', challengeMouseHandler);
          challengeMouseHandler = null;
        }
      }
      else if (ch === '03' && sc === '01') {
        activateLoopStep(0);
        document.querySelector('.btn-route--success').classList.remove('active');
        document.querySelector('.btn-route--failure').classList.remove('active');
        document.getElementById('routeResultText').textContent = '시뮬레이션 경로를 클릭하세요.';
        document.getElementById('routeResultText').style.color = 'var(--text-muted)';
      }
      else if (ch === '03' && sc === '02') {
        currentSync = 15;
        document.getElementById('syncMeterFill').style.width = '15%';
        document.getElementById('syncMeterText').textContent = '현재 동조율: 15%';
        document.getElementById('syncFeedback').textContent = '기억 조각을 눌러서 흡수하십시오.';
        document.querySelectorAll('.memory-fragment-item').forEach(item => {
          item.style.opacity = '1';
          item.style.pointerEvents = 'auto';
          item.style.transform = 'none';
        });
      }
      else if (ch === '05' && sc === '01') {
        document.getElementById('compAfterImg').style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
        document.getElementById('compSlider').style.left = '50%';
      }
      else if (ch === '05' && sc === '02') {
        switchSimTab(0);
      }
    }
