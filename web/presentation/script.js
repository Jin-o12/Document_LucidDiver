window.scenes = [];
  // currentSceneIndex global

    // ══════════════════════════════════════════════════════════
    //  VANILLA JAVASCRIPT LOGIC

    // ══════════════════════════════════════════════════════════
    // scenes declared globally
    let currentIdx = 0;
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
      scenes = Array.from(document.querySelectorAll('.scene:not([data-exclude-presentation="true"])'));
      buildPresenterSequenceBadges();
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
      setupCdVersionDrag();
      setupFullGameplayDemo();
    }
    // 발표자별 파트 안에서 현재 씬 번호와 총 장수를 자동 표기
    function buildPresenterSequenceBadges() {
      const presenterBlocks = [
        { role: 'CP', chapters: ['00', '01', '02', '03', '04', '05'] },
        { role: 'CD', chapters: ['06'] },
        { role: 'PM', chapters: ['07'] },
        { role: 'TD', chapters: ['09'] },
        { role: 'DEMO', chapters: ['10'] }
      ];

      document.querySelectorAll('.section-scene-index').forEach(badge => badge.remove());
      presenterBlocks.forEach(block => {
        const blockScenes = scenes.filter(scene => block.chapters.includes(scene.getAttribute('data-chapter')));
        blockScenes.forEach((scene, index) => {
          const badge = document.createElement('span');
          badge.className = `section-scene-index section-scene-index--${block.role.toLowerCase()}`;
          badge.textContent = `${block.role} ${String(index + 1).padStart(2, '0')} / ${String(blockScenes.length).padStart(2, '0')}`;
          const header = scene.querySelector('.scene-header');
          if (header) {
            header.appendChild(badge);
          } else {
            badge.classList.add('section-scene-index--floating');
            scene.appendChild(badge);
          }
        });
      });
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
        closePdImage();
        // 모든 씬의 active 클래스 강제 클리어 (중복 덮임 및 화면 조작 마비 100% 차단)
        scenes.forEach((s, idx) => {
          if (s) {
            s.classList.remove('active');
            s.querySelectorAll('video').forEach(video => {
              try { video.pause(); } catch (err) {}
            });
            s.querySelectorAll('iframe[data-youtube-player]').forEach(player => {
              try {
                player.contentWindow.postMessage(
                  JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                  'https://www.youtube.com'
                );
              } catch (err) {}
            });
          }
        });
        resetSceneState(currentIdx);
        currentIdx = index;
        const nextActive = scenes[currentIdx];
        if (!nextActive) return;
        // 씬이 화면에 나타나기 전에 진입 요소를 먼저 숨겨 첫 프레임 플래시를 방지
        prepareStaggerEntrance(nextActive);
        // 현재 씬 활성화
        nextActive.classList.add('active');
        if (nextActive.querySelector('#pmFinalVideo')) {
          resetPmAiPlayer();
        }
        // 활성화된 장면에 자동 재생 비디오가 있다면 재생
        nextActive.querySelectorAll('video[autoplay]').forEach(video => {
          video.play().catch(() => {});
        });
        // HUD 및 정보 업데이트
        updateHUD(nextActive);
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
    // 전역 순차 등장 대상 준비 — 반드시 씬 활성화 전에 호출
    function prepareStaggerEntrance(scene) {
      if (scene._staggerTimers) {
        scene._staggerTimers.forEach(timer => clearTimeout(timer));
      }
      scene._staggerTimers = [];
      scene._staggerTargets = [];

      scene.querySelectorAll('.stagger-target, .stagger-visible').forEach(el => {
        el.classList.remove('stagger-target', 'stagger-visible');
      });

      const targets = [];
      const addTarget = el => {
        if (el && !targets.includes(el)) targets.push(el);
      };
      const h1 = scene.querySelector('.scene-header h1');
      const sub = scene.querySelector('.scene-header .subtitle');
      addTarget(h1);
      addTarget(sub);

      const cardSelector = [
        '.glass-card',
        '.pv-card',
        '.pv-item',
        '.crew-card-wrapper',
        '.overview-intent-card',
        '.overview-evolution-card',
        '.char-reveal-panel',
        '.cd-flow-card',
        '.fsm-side-panel',
        '.qa-topic-card',
        '.milestone-step-item',
        '.ending-crew-mini-card',
        '.ending-link-item',
        '.pm-anim'
      ].join(', ');

      scene.querySelectorAll(cardSelector).forEach(el => {
        const isNestedCard = el.parentElement && el.parentElement.closest(cardSelector);
        if (!isNestedCard && !el.hasAttribute('data-no-stagger')) {
          addTarget(el);
        }
      });

      scene.querySelectorAll('.cd-wf-hint, .cd-wf-step.visible').forEach(el => {
        addTarget(el);
      });

      targets.forEach(el => el.classList.add('stagger-target'));
      scene._staggerTargets = targets;
    }

    // 준비된 요소를 씬 활성화 후 순차적으로 노출
    function playStaggerEntrance(scene) {
      const targets = scene._staggerTargets || [];
      targets.forEach((el, i) => {
        const entranceDelay = 80 + Math.min(i * 80, 960);
        const showTimer = setTimeout(() => el.classList.add('stagger-visible'), entranceDelay);
        const cleanupTimer = setTimeout(() => {
          el.classList.remove('stagger-target', 'stagger-visible');
        }, entranceDelay + 650);
        scene._staggerTimers.push(showTimer, cleanupTimer);
      });
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
      document.getElementById('hudChapter').textContent = `CH ${ch}`;
      document.getElementById('hudSceneNum').textContent = `SCENE ${sc}`;
      document.getElementById('hudSceneTitle').textContent = title;
      // 진행률 퍼센트 계산
      const pct = ((currentIdx + 1) / scenes.length) * 100;
      document.getElementById('progressBar').style.width = `${pct}%`;
    }
    // 챕터 점프 메뉴
    function buildChapterMenu() {
      const grid = document.querySelector('.chapter-menu-grid');
      grid.innerHTML = '';
      // 챕터별 그룹화
      const chapters = new Map();
      scenes.forEach((s, idx) => {
        const ch = s.getAttribute('data-chapter');
        const title = s.getAttribute('data-title');
        if (!chapters.has(ch)) {
          chapters.set(ch, []);
        }
        chapters.get(ch).push({ idx, title, sc: s.getAttribute('data-scene') });
      });
      // 실제 슬라이드 DOM 순서대로 HTML 빌드
      chapters.forEach((chapterScenes, ch) => {
        const group = document.createElement('div');
        group.className = 'chapter-menu-group';
        const chTitle = getChapterName(ch);
        group.innerHTML = `<h3>CH ${ch}. ${chTitle}</h3>`;
        const list = document.createElement('div');
        list.className = 'chapter-menu-list';
        chapterScenes.forEach(scene => {
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
      });
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
        '02': 'CP 장수영 — 장르 모순과 해법',
        '03': 'CP 장수영 — 인터랙티브 플레이 루프',
        '04': 'CP 장수영 — 세계관과 내러티브',
        '05': 'CP 장수영 — UI · AnyPortrait · Audio · Prototyping',
        '06': 'CD 우성혁 — 기획 명세 · AudioManager',
        '07': 'PM 송예찬 — 꿈식자 AI · 튜토리얼',
        '08': 'PD 김남해 — 아트 레벨 · 셰이더 · 손전등',
        '09': 'TD 강다영 — 클라이언트 구조 · UI 모듈화',
        '10': 'Full Gameplay Demonstration',
        '12': 'Ending & Q&A'
      };
      return names[ch] || 'Others';
    }

    function setupFullGameplayDemo() {
      const player = document.getElementById('fullGameplayDemo');
      const shell = document.getElementById('gameplayDemoShell');
      const status = document.getElementById('gameplayDemoStatusText');
      if (!player || !shell) return;

      const markReady = () => {
        shell.classList.add('has-video');
        shell.classList.remove('has-video-error');
        if (status) status.textContent = 'YOUTUBE · READY TO PLAY';
      };
      const markError = () => {
        shell.classList.remove('has-video');
        shell.classList.add('has-video-error');
        if (status) status.textContent = 'YOUTUBE · CONNECTION ERROR';
      };

      player.addEventListener('load', markReady);
      player.addEventListener('error', markError);

      // window.load 이전에 임베드 로드가 끝난 경우에도 준비 상태를 복구한다.
      if (player.dataset.loaded === 'true') markReady();
    }

    function setCdMacroTab(event, deckName, panelName) {
      event.stopPropagation();
      const deck = event.currentTarget.closest('.cd-macro-deck');
      if (!deck) return;
      deck.querySelectorAll('.cd-macro-tabs button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      deck.querySelectorAll(`.cd-macro-panel[data-cd-deck="${deckName}"]`).forEach(panel => {
        panel.classList.toggle('active', panel.dataset.cdPanel === panelName);
      });
      const activePanel = deck.querySelector(`.cd-macro-panel[data-cd-deck="${deckName}"][data-cd-panel="${panelName}"]`);
      if (activePanel && activePanel.classList.contains('cd-macro-panel--architecture')) {
        activePanel.querySelectorAll('.audio-arch-wire').forEach(wire => {
          wire.style.animation = 'none';
        });
        void activePanel.offsetWidth;
        activePanel.querySelectorAll('.audio-arch-wire').forEach(wire => {
          wire.style.removeProperty('animation');
        });
      }
    }

    function toggleCdLoopDemo(button) {
      const video = button.querySelector('video');
      if (!video) return;
      if (button.classList.contains('playing')) {
        resetCdLoopDemo(button);
        return;
      }
      button.classList.add('playing');
      video.currentTime = 0;
      video.play().catch(() => resetCdLoopDemo(button));
    }

    function resetCdLoopDemo(button) {
      if (!button) return;
      const video = button.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      button.classList.remove('playing');
    }

    function setupCdVersionDrag() {
      document.querySelectorAll('.cd-version-window').forEach(scroller => {
        if (scroller.dataset.dragReady === 'true') return;
        scroller.dataset.dragReady = 'true';
        let isDragging = false;
        let startY = 0;
        let startScroll = 0;
        scroller.addEventListener('pointerdown', event => {
          isDragging = true;
          startY = event.clientY;
          startScroll = scroller.scrollTop;
          scroller.setPointerCapture(event.pointerId);
          scroller.classList.add('dragging');
        });
        scroller.addEventListener('pointermove', event => {
          if (!isDragging) return;
          scroller.scrollTop = startScroll - (event.clientY - startY);
        });
        const stopDragging = event => {
          if (!isDragging) return;
          isDragging = false;
          scroller.classList.remove('dragging');
          if (scroller.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
        };
        scroller.addEventListener('pointerup', stopDragging);
        scroller.addEventListener('pointercancel', stopDragging);
      });
    }

    function resetCdMacroDeck(scene) {
      scene.querySelectorAll('.cd-macro-deck').forEach(deck => {
        const buttons = deck.querySelectorAll('.cd-macro-tabs button');
        buttons.forEach((button, index) => button.classList.toggle('active', index === 0));
        deck.querySelectorAll('.cd-macro-panel').forEach((panel, index) => panel.classList.toggle('active', index === 0));
      });
      scene.querySelectorAll('.unified-comparison-frame').forEach(resetUnifiedComparison);
      scene.querySelectorAll('.cd-loop-demo').forEach(resetCdLoopDemo);
    }

    function setCdFinaleStage(event, stage) {
      event.stopPropagation();
      const finale = event.currentTarget.closest('.cd-finale-interactive');
      if (!finale) return;
      finale.dataset.stage = String(stage);
      finale.querySelectorAll('.cd-finale-node').forEach((node, index) => {
        node.setAttribute('aria-pressed', String(index + 1 === stage));
      });
    }

    function resetCdFinale(scene) {
      const finale = scene.querySelector('.cd-finale-interactive');
      if (!finale) return;
      finale.dataset.stage = '1';
      finale.querySelectorAll('.cd-finale-node').forEach((node, index) => {
        node.setAttribute('aria-pressed', String(index === 0));
      });
    }

    // ── [CH 09] TD 최종 발표 인터랙션 ──
    function setTdLayer(event, layerName) {
      event.stopPropagation();
      const explorer = event.currentTarget.closest('.tdf-layer-explorer');
      if (!explorer) return;
      explorer.querySelectorAll('.tdf-layer-nav button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      explorer.querySelectorAll('.tdf-layer-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tdLayer === layerName);
      });
    }

    function setTdDataMode(event, modeName) {
      event.stopPropagation();
      const deck = event.currentTarget.closest('.tdf-data-deck');
      if (!deck) return;
      deck.querySelectorAll('.tdf-data-modes button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      deck.querySelectorAll('.tdf-data-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tdDataMode === modeName);
      });
    }

    function setTdDataStage(event, stageName) {
      event.stopPropagation();
      const panel = event.currentTarget.closest('.tdf-data-panel');
      if (!panel) return;
      panel.querySelectorAll('.tdf-data-steps button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      panel.querySelectorAll('.tdf-data-preview figure').forEach(figure => {
        figure.classList.toggle('active', figure.dataset.tdDataStage === stageName);
      });
    }

    function setTdBranchStage(event, stageName) {
      event.stopPropagation();
      const control = event.currentTarget.closest('.tdf-branch-control');
      if (!control) return;
      control.dataset.stage = stageName;
      control.querySelectorAll('.tdf-branch-flow button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      control.querySelectorAll('.tdf-branch-detail > div').forEach(detail => {
        detail.classList.toggle('active', detail.dataset.tdBranch === stageName);
      });
    }

    function setTdFinalStage(event, stageName) {
      event.stopPropagation();
      const map = event.currentTarget.closest('.tdf-final-map');
      if (!map) return;
      map.dataset.stage = stageName;
      map.querySelectorAll('.tdf-final-source button, .tdf-final-version button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });
      map.querySelectorAll('.tdf-final-detail p').forEach(detail => {
        detail.classList.toggle('active', detail.dataset.tdFinal === stageName);
      });
    }

    function resetTdScene(scene) {
      const explorer = scene.querySelector('.tdf-layer-explorer');
      if (explorer) {
        explorer.querySelectorAll('.tdf-layer-nav button').forEach((button, index) => button.classList.toggle('active', index === 0));
        explorer.querySelectorAll('.tdf-layer-panel').forEach((panel, index) => panel.classList.toggle('active', index === 0));
      }

      const dataDeck = scene.querySelector('.tdf-data-deck');
      if (dataDeck) {
        dataDeck.querySelectorAll('.tdf-data-modes button').forEach((button, index) => button.classList.toggle('active', index === 0));
        dataDeck.querySelectorAll('.tdf-data-panel').forEach((panel, panelIndex) => {
          panel.classList.toggle('active', panelIndex === 0);
          panel.querySelectorAll('.tdf-data-steps button').forEach((button, index) => button.classList.toggle('active', index === 0));
          panel.querySelectorAll('.tdf-data-preview figure').forEach((figure, index) => figure.classList.toggle('active', index === 0));
        });
      }

      const branch = scene.querySelector('.tdf-branch-control');
      if (branch) {
        branch.dataset.stage = 'feature';
        branch.querySelectorAll('.tdf-branch-flow button').forEach((button, index) => button.classList.toggle('active', index === 0));
        branch.querySelectorAll('.tdf-branch-detail > div').forEach((detail, index) => detail.classList.toggle('active', index === 0));
      }

      const finalMap = scene.querySelector('.tdf-final-map');
      if (finalMap) {
        finalMap.dataset.stage = 'data';
        finalMap.querySelectorAll('.tdf-final-source button, .tdf-final-version button').forEach((button, index) => button.classList.toggle('active', index === 0));
        finalMap.querySelectorAll('.tdf-final-detail p').forEach((detail, index) => detail.classList.toggle('active', index === 0));
      }
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
          const pdLightbox = document.getElementById('pdImageLightbox');
          if (pdLightbox && pdLightbox.classList.contains('open')) {
            closePdImage();
          } else if (isMenuOpen) {
            closeChapterMenu();
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
    // ── 공통 Before/After 비교 슬라이더 ──
    function handleUnifiedComparisonMove(e) {
      const frame = e.currentTarget;
      if (!frame) return;
      if (e.cancelable) e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      const rect = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, point.clientX - rect.left));
      frame._comparisonPct = (x / rect.width) * 100;
      if (frame._comparisonRaf) return;
      frame._comparisonRaf = requestAnimationFrame(() => {
        frame.style.setProperty('--comparison-position', `${frame._comparisonPct}%`);
        frame._comparisonRaf = 0;
      });
    }
    function resetUnifiedComparison(target) {
      const frame = typeof target === 'string' ? document.getElementById(target) : target;
      if (!frame) return;
      if (frame._comparisonRaf) {
        cancelAnimationFrame(frame._comparisonRaf);
        frame._comparisonRaf = 0;
      }
      frame._comparisonPct = 50;
      frame.style.setProperty('--comparison-position', '50%');
    }
    function resetComparisonSlider() {
      resetUnifiedComparison('cpUiFrame');
    }
    // ── [CH 08] PD 이미지 확대 ──
    function openPdImage(image) {
      if (!image) return;
      const lightbox = document.getElementById('pdImageLightbox');
      const lightboxImage = document.getElementById('pdLightboxImage');
      const caption = document.getElementById('pdLightboxCaption');
      if (!lightbox || !lightboxImage || !caption) return;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '확대 이미지';
      caption.textContent = image.dataset.caption || image.alt || '';
      lightbox.classList.add('open');
    }
    function closePdImage(e) {
      const lightbox = document.getElementById('pdImageLightbox');
      if (!lightbox) return;
      if (e && e.target !== lightbox) return;
      lightbox.classList.remove('open');
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
    // ── [CH 05 / SC 02] 캐릭터 비주얼 크로스페이드 ──
    function revealCharPanel(panelId) {
      const panel = document.getElementById(panelId);
      if (!panel) return;
      panel.classList.toggle('revealed');
      // 비디오 자동 재생/정지
      const video = panel.querySelector('video');
      if (video) {
        if (panel.classList.contains('revealed')) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    }


    // ── [CH 07 / SC 01] 꿈식자 FSM 원형 다이어그램 ──
    const fsmStates = {
      spawn: { index:"01 / 08 · SPAWN", title:"랜덤 스폰과 순찰 준비",
        summary:"스폰 존의 후보 중 하나를 선택한 뒤 그 지점에 연결된 패트롤 루트와 가장 가까운 시작 포인트를 기억하고 순찰을 시작합니다.",
        logic:["스폰 존 안의 후보 지점 중 하나를 무작위로 선택합니다.","선택한 스폰 지점에 에너미 개체를 생성합니다.","스폰 지점에 연결된 패트롤 루트를 활동 구역으로 저장합니다.","루트에서 가장 가까운 시작 포인트를 선택해 순찰 상태로 전환합니다."],
        implementation:"<code>SpawnManager</code>가 스폰 포인트를 선택하고 연결된 패트롤 루트와 시작 인덱스를 개체에 전달합니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_SpawnPatrol.gif"
      },
      patrol: { index:"02 / 08 · PATROL", title:"통제된 랜덤 순찰",
        summary:"패트롤 포인트는 고정 좌표가 아니라 랜덤 목적지를 생성하는 기준점입니다. 루트로 활동 범위를 통제하면서 각 포인트 반경의 NavMesh에서 도달 가능한 목적지를 선택해, 같은 루트에서도 순찰 궤적이 반복되지 않도록 설계했습니다.",
        logic:["배정된 루트의 현재 패트롤 포인트를 기준점으로 사용합니다.","포인트 반경 안에서 임의 좌표를 만들고 NavMesh 위의 이동 가능한 지점으로 보정합니다.","완전한 경로를 계산할 수 있는 후보만 목적지로 채택하고, 실패하면 다시 추첨합니다.","정해진 횟수만큼 배회한 뒤 가까운 다음 포인트 중 하나를 무작위로 골라 순찰을 이어갑니다."],
        implementation:"<code>Random.insideUnitCircle</code>로 반경 안의 후보를 만들고 <code>NavMesh.SamplePosition</code>과 <code>NavMeshPathStatus.PathComplete</code>를 모두 통과한 좌표만 사용합니다. 그래서 루트는 통제되지만 실제 이동선은 매번 달라집니다.",
        design:"assets/[PM]송예찬/images/PM_EnemyAI_RandomPatrolDiagram.png",
        designNote:"패트롤 포인트 반경 안에서 NavMesh 도달 가능 지점을 다시 뽑아, 루트는 유지하면서 이동 궤적은 반복되지 않게 합니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Patrol.gif"
      },
      detect: { index:"03 / 08 · PERCEPTION", title:"시야·소리 감지",
        summary:"꿈식자는 직접 시야, 근접 인지 반경, 소리 인식 반경을 서로 다른 감지 입력으로 판정하고, 조건을 충족하면 추적 또는 조사 상태로 전환합니다.",
        logic:["시야 범위와 각도 안에 대상이 있는지 확인합니다.","Raycast로 벽이나 장애물에 가려졌는지 검사합니다.","가까운 대상은 근접 인지 반경으로 인식을 보정합니다.","소리는 청각 반경과 장애물 차단 여부를 판정해 다음 상태의 근거로 사용합니다."],
        implementation:"<code>EnemyPerception</code>이 시야·근접·청각 입력을 각각 판정하고, 유효한 감지 결과를 FSM에 전달해 추적 또는 조사 전환의 기반을 만듭니다.",
        design:"assets/[PM]송예찬/images/PM_EnemyAI_DetectionDesign_v4.png",
        designNote:"보라색 부채꼴은 직접 시야(5.5m·100°), 청록색 안쪽 원은 근접 인지(~10m), 금색 점선 바깥 원은 소리 인식 반경(~20m)입니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Detect.gif"
      },
      investigate: { index:"04 / 08 · INVESTIGATE", title:"소리 발생 위치 조사",
        summary:"플레이어가 걷거나 달리면 이동 경로의 각 발소리 위치에 소리 앵커가 연속 생성됩니다. 꿈식자는 플레이어 좌표를 직접 추적하지 않고, 청각 범위와 소음 반경이 겹치며 차폐되지 않은 앵커를 감지해 조사 목표를 갱신합니다.",
        logic:["걷기·달리기 소음 좌표마다 소리 앵커와 개별 소음 반경을 생성합니다.","각 앵커의 소음 반경이 꿈식자의 청각 범위와 겹치는지, 벽에 막혔는지 검사합니다.","감지된 앵커 중 최신/우선순위 높은 좌표를 NavMesh에 보정해 조사 목표로 갱신합니다.","앵커 위치들을 따라 이동하며, 현재 플레이어 위치까지 직접 추적하지는 않습니다."],
        implementation:"<code>NoiseStimulus</code>가 발소리마다 위치·소음 반경·우선순위를 전달하고, <code>EnemyNoiseListener</code>가 반경 중첩과 차폐 검사를 통과한 앵커를 조사 목적지로 기억합니다.",
        design:"assets/[PM]송예찬/images/PM_EnemyAI_InvestigateDesign_v2.png",
        designNote:"큰 청록색 원은 꿈식자의 청각 감지 반경이고, 작은 금색 원들은 발소리마다 생성된 앵커의 개별 소음 반경입니다. 두 반경이 겹친 앵커가 밝게 표시됩니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Investigate.gif"
      },
      chase: { index:"05 / 08 · CHASE", title:"이동 방향 예측과 길목 압박",
        summary:"현재 위치만 뒤따르지 않고 이동 방향 앞쪽을 예상해 플레이어의 길목을 압박합니다. 여러 개체가 같은 좌표에 겹치지 않도록 접근 위치를 나눕니다.",
        logic:["플레이어를 전투 타겟으로 등록하고 어그로를 채웁니다.","현재 위치와 이동 방향을 이용해 앞쪽의 예상 추격 지점을 정합니다.","개체별 접근 위치를 나눠 한 점에 뭉치지 않고 도주 길목을 압박합니다.","시야가 끊기면 마지막 확인 위치와 어그로를 이용해 추격을 잠시 유지합니다."],
        implementation:"<code>currentTarget</code>, 마지막 확인 위치, 이동 방향 기반 목표 지점, <code>currentAggro</code>를 분리해 관리합니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Chase.gif"
      },
      attack: { index:"06 / 08 · ATTACK", title:"2단 돌진 공격",
        summary:"공격 사거리와 시야를 확인한 뒤 두 번의 연속 돌진으로 회피 타이밍을 압박합니다. 공격이 끝나면 후딜레이를 거쳐 다시 판단합니다.",
        logic:["공격 사거리와 쿨다운을 확인합니다.","플레이어 사이에 벽이 없는지 Line of Sight로 다시 검사합니다.","1차 돌진 공격에 이어 2차 돌진 공격을 연결합니다.","공격 후 후딜레이가 끝나면 감지 결과에 따라 추격 또는 재탐색으로 전환합니다."],
        implementation:"공격 판정 전 Line of Sight를 다시 확인해 벽을 관통하는 공격을 막았습니다. 돌진, 타격 판정, 애니메이션 이벤트와 후딜레이를 하나의 공격 순서로 연결합니다.",
        design:"assets/[PM]송예찬/images/PM_EnemyAI_AttackDesign.jpg",
        designNote:"바닥 전조 → 1타 돌진 → 짧은 재조준 → 2타 돌진 → 후딜레이 순서입니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Attack.gif"
      },
      search: { index:"07 / 08 · SEARCH", title:"공격 후 재탐색과 마지막 단서",
        summary:"공격이 끝나거나 플레이어를 놓치면 즉시 순찰로 돌아가지 않고 주변과 마지막 확인 위치를 다시 탐색합니다.",
        logic:["공격 후 후딜레이가 끝나면 시야와 감지 범위를 다시 확인합니다.","플레이어가 보이면 추격 또는 공격 상태로 다시 전환합니다.","보이지 않으면 마지막 확인 위치로 이동해 주변을 재탐색합니다.","단서를 찾지 못하면 어그로를 감소시키고 순찰 복귀를 준비합니다."],
        implementation:"공격 종료, 마지막 확인 위치, 시야 상실 시각을 별도로 관리해 공격 뒤 판단이 끊기지 않도록 했습니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Search.gif"
      },
      return: { index:"08 / 08 · RETURN", title:"개별 순찰 루트 복귀",
        summary:"어그로가 소진되거나 활동 반경을 벗어나면 각 개체가 자신의 패트롤 루트로 돌아갑니다. 공통 지점에 몰리지 않도록 개별 루트와 복귀 기준을 기억합니다.",
        logic:["어그로 소진 또는 하드 리턴 거리 초과를 확인합니다.","전투 타겟·추격 계획·임시 조사 상태를 정리합니다.","현 위치에서 자기 루트의 적절한 복귀 포인트를 선택합니다.","복귀 후 랜덤 배회 상태를 새로 만들고 순찰을 재개합니다."],
        implementation:"<code>EnemyMemory</code>가 루트·순찰 인덱스·복귀 앵커를 개체별로 보관합니다. 루트에서 지나치게 멀어지면 시야와 관계없이 즉시 복귀합니다.",
        gif:"assets/[PM]송예찬/gifs/PM_EnemyAI_Return.gif"
      }
    };
    const fsmKeyOrder = ['spawn','patrol','detect','investigate','chase','attack','search','return'];
    let currentFsmKey = null;

    function syncPmAiFullLoop(player, options = {}) {
      if (!player || player.dataset.clip !== 'all') return false;
      const video = player.querySelector('#pmFinalVideo');
      const placeholder = player.querySelector('#pmVideoPlaceholder');
      if (!video) return false;

      const isReady = video.readyState >= 1;
      video.style.display = isReady ? 'block' : 'none';
      if (placeholder) placeholder.style.display = isReady ? 'none' : 'flex';

      if (!isReady) {
        if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          video.load();
        }
        return false;
      }

      if (options.restart) {
        try { video.currentTime = 0; } catch (err) {}
      }
      if (options.play) {
        video.play().catch(() => {});
      }
      return true;
    }

    function showPmAiClip(event, key) {
      event.stopPropagation();
      const player = event.currentTarget.closest('.pm-ai-demo');
      if (!player) return;
      const video = player.querySelector('#pmFinalVideo');
      const gif = player.querySelector('#pmStateGif');
      const placeholder = player.querySelector('#pmVideoPlaceholder');
      const label = player.querySelector('#pmAiMediaLabel');

      player.dataset.clip = key;
      player.querySelectorAll('.pm-ai-clip-nav button').forEach(button => {
        button.classList.toggle('active', button === event.currentTarget);
      });

      if (key === 'all') {
        if (gif) {
          gif.style.display = 'none';
          gif.removeAttribute('src');
        }
        if (label) label.textContent = 'FULL LOOP · 전체 행동 순환';
        syncPmAiFullLoop(player, { restart: true, play: true });
        return;
      }

      const state = fsmStates[key];
      if (!state || !gif) return;
      if (video) {
        video.pause();
        video.style.display = 'none';
      }
      if (placeholder) placeholder.style.display = 'none';
      gif.style.display = 'block';
      gif.alt = `${state.title} 실행 GIF`;
      gif.removeAttribute('src');
      requestAnimationFrame(() => { gif.src = state.gif; });
      if (label) label.textContent = `${state.index} · ${state.title}`;
    }

    function resetPmAiPlayer() {
      const player = document.querySelector('.pm-ai-demo');
      if (!player) return;
      player.dataset.clip = 'all';
      player.querySelectorAll('.pm-ai-clip-nav button').forEach((button, index) => button.classList.toggle('active', index === 0));
      const gif = player.querySelector('#pmStateGif');
      if (gif) {
        gif.style.display = 'none';
        gif.removeAttribute('src');
      }
      const video = player.querySelector('#pmFinalVideo');
      const placeholder = player.querySelector('#pmVideoPlaceholder');
      if (video) {
        video.pause();
        try { video.currentTime = 0; } catch (err) {}
      }
      syncPmAiFullLoop(player);
      const label = player.querySelector('#pmAiMediaLabel');
      if (label) label.textContent = 'FULL LOOP · 전체 행동 순환';
    }

    function openFsmModal(key) {
      const s = fsmStates[key];
      if (!s) return;
      currentFsmKey = key;
      // 핫스팟 활성화
      document.querySelectorAll('.fsm-hotspot').forEach(b => b.classList.toggle('active', b.getAttribute('data-fsm-key') === key));
      // 모달 내용 채우기
      document.getElementById('fsmModalIndex').textContent = s.index;
      document.getElementById('fsmModalTitle').textContent = s.title;
      document.getElementById('fsmModalSummary').textContent = s.summary;
      // 로직
      document.getElementById('fsmModalLogic').innerHTML = s.logic.map(l => '<li>' + l + '</li>').join('');
      document.getElementById('fsmModalImpl').innerHTML = s.implementation;
      // 설계 이미지
      const dImg = document.getElementById('fsmModalDesign');
      const dFb = document.getElementById('fsmDesignFallback');
      const dNote = document.getElementById('fsmModalDesignNote');
      if (s.design) {
        dImg.src = s.design;
        dImg.style.display = 'block';
        dFb.style.display = 'none';
        dNote.textContent = s.designNote || '';
      } else {
        dImg.style.display = 'none';
        dFb.style.display = 'flex';
        dNote.textContent = '';
      }
      // GIF
      const gImg = document.getElementById('fsmModalGif');
      const gFb = document.getElementById('fsmGifFallback');
      const gPath = document.getElementById('fsmGifPath');
      if (s.gif) {
        gPath.textContent = s.gif;
        const testImg = new Image();
        testImg.onload = () => { gImg.src = s.gif; gImg.style.display = 'block'; gFb.style.display = 'none'; };
        testImg.onerror = () => { gImg.style.display = 'none'; gFb.style.display = 'flex'; };
        testImg.src = s.gif;
      }
      // 하단 네비
      const nav = document.getElementById('fsmModalNav');
      nav.innerHTML = fsmKeyOrder.map(k => {
        const st = fsmStates[k];
        return `<button class="${k===key?'active':''}" onclick="openFsmModal('${k}')">${st.index.split(' · ')[1]} ${st.title.split(/[과와·]/)[0]}</button>`;
      }).join('');
      // 모달 열기
      document.getElementById('fsmModalLayer').classList.add('open');
    }
    function closeFsmModal(e) {
      if (e && e.target !== document.getElementById('fsmModalLayer')) return;
      const layer = document.getElementById('fsmModalLayer');
      layer.classList.add('closing');
      setTimeout(() => {
        layer.classList.remove('open', 'closing');
        document.querySelectorAll('.fsm-hotspot').forEach(b => b.classList.remove('active'));
        currentFsmKey = null;
      }, 250);
    }
    // 턴테이블
    (function() {
      const tt = document.getElementById('fsmTurntable');
      const img = document.getElementById('fsmTurntableImg');
      const label = document.getElementById('fsmTurntableAngle');
      if (!tt) return;
      const frames = ["00","07","06","03","04","05","02","01"].map(id => `assets/[PM]송예찬/images/PM_DreamEater_360/dream_eater_v6_${id}.png`);
      const labels = ["정면 (0°)","좌전면 (45°)","좌측면 (90°)","좌후면 (135°)","후면 (180°)","우후면 (135°)","우측면 (90°)","우전면 (45°)"];
      let idx = 0, dragX = null, dragIdx = 0;
      tt.addEventListener('pointerdown', e => { dragX = e.clientX; dragIdx = idx; tt.setPointerCapture(e.pointerId); });
      tt.addEventListener('pointermove', e => {
        if (dragX === null) return;
        const dx = e.clientX - dragX;
        const step = Math.round(dx / 40);
        idx = ((dragIdx - step) % 8 + 8) % 8;
        img.src = frames[idx];
        label.textContent = '관람자 시점 · ' + labels[idx];
      });
      tt.addEventListener('pointerup', () => { dragX = null; });
      tt.addEventListener('pointercancel', () => { dragX = null; });
    })();
    // PM Scene 1 비디오 자동 감지
    (function() {
      const video = document.getElementById('pmFinalVideo');
      if (!video) return;
      const syncWhenReady = () => syncPmAiFullLoop(video.closest('.pm-ai-demo'));
      video.addEventListener('loadedmetadata', syncWhenReady);
      video.addEventListener('loadeddata', syncWhenReady);
      video.addEventListener('canplay', syncWhenReady);
      video.load();
    })();

    // ── [CH 06] CD 우성혁 인터랙션 ──
    // Scene 1: 기획→개발 플로우 카드 쌍 하이라이트
    document.querySelectorAll('.cd-flow-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const pair = card.dataset.cdPair;
        document.querySelectorAll(`.cd-flow-card[data-cd-pair="${pair}"]`).forEach(c => c.classList.add('highlight'));
        const arrows = document.querySelectorAll('.cd-arrow-svg');
        const idx = parseInt(pair) - 1;
        arrows.forEach((a, i) => { a.style.opacity = i === idx ? '1' : '0.2'; });
      });
      card.addEventListener('mouseleave', () => {
        document.querySelectorAll('.cd-flow-card').forEach(c => c.classList.remove('highlight'));
        document.querySelectorAll('.cd-arrow-svg').forEach(a => { a.style.opacity = '0.6'; });
      });
    });

    // Scene 2: 워크플로우 순차 등장
    let cdWfStep = 1; // 2-1은 기본 표시
    const CD_WF_MAX = 4;
    // 2-1 기본 표시
    (function() {
      const s1 = document.querySelector('.cd-wf-step[data-wf-step="1"]');
      if (s1) s1.classList.add('visible');
    })();
    window.advanceCdWorkflow = function() {
      if (cdWfStep >= CD_WF_MAX) return;
      cdWfStep++;
      const step = document.querySelector(`.cd-wf-step[data-wf-step="${cdWfStep}"]`);
      if (step) step.classList.add('visible');
      const arrow = document.querySelector(`.cd-wf-arrow[data-wf-step="${cdWfStep}"]`);
      if (arrow) arrow.classList.add('visible');
      const hint = document.querySelector('.cd-wf-hint');
      if (hint && cdWfStep >= CD_WF_MAX) hint.style.opacity = '0';
    };
    function resetCdWorkflow() {
      cdWfStep = 1;
      document.querySelectorAll('.cd-wf-step, .cd-wf-arrow').forEach(el => el.classList.remove('visible'));
      const s1 = document.querySelector('.cd-wf-step[data-wf-step="1"]');
      if (s1) s1.classList.add('visible');
      const hint = document.querySelector('.cd-wf-hint');
      if (hint) { hint.style.opacity = '1'; }
    }

    // Scene 3-4: 영상 오버레이 토글
    window.toggleCdVideo = function(trigger) {
      const video = trigger.querySelector('.cd-overlay-video');
      const label = trigger.querySelector('.cd-video-label');
      if (!video) return;
      if (video.style.display === 'none' || !video.style.display) {
        video.style.display = 'block';
        if (label) label.style.display = 'none';
        video.currentTime = 0;
        video.play();
      } else {
        video.pause();
        video.style.display = 'none';
        if (label) label.style.display = 'flex';
      }
    };

    // ── [CH 04] 세계관 관계도 빌드업 ──
    let loreBuildStep = 0;
    const LORE_MAX_STEP = 5;
    const loreDescriptions = [
      '화면을 클릭하여 세계관 구조를 탐색하세요.',
      '침몽도시에 출격하여 기억 파편을 회수하고 세션을 정화하는 청소년 요원. 탈출 실패 시 본래 기억을 떨구고 돌아온다.',
      '꿈과 현실의 경계가 붕괴되어 발현한 심상 세계. 학원 밀집 구역을 중심으로 최초 침식이 발생했다.',
      '다이버의 의식과 현실을 연결하고 귀환 좌표를 유지하는 생명선. 링크가 끊어지면 강제 각성이 불가능해지며 다이버는 꿈식자로 변질된다.',
      '강제 각성(탈출 실패) 시, 다이버의 본래 기억 — 이름, 관계, 자아 — 이 파편화되어 침몽도시에 남겨진다. 반복될수록 기억 총량이 줄어든다.',
      '관제 기록(객관적 데이터)과 기억 파편(감정·자아)이 결합하면 다이버가 자신의 것으로 받아들일 수 있는 심상기록이 복구된다. 동조율이 이 과정의 안정성을 결정한다.'
    ];
    function advanceLoreBuild() {
      if (loreBuildStep >= LORE_MAX_STEP) return;
      loreBuildStep++;
      // 노드 표시
      document.querySelectorAll(`.lore-node[data-lore-step="${loreBuildStep}"]`).forEach(n => n.classList.add('visible'));
      // SVG 라인 표시
      document.querySelectorAll(`.lore-line[data-lore-step="${loreBuildStep}"]`).forEach(l => l.classList.add('visible'));
      document.querySelectorAll(`.lore-line-label[data-lore-step="${loreBuildStep}"]`).forEach(l => l.classList.add('visible'));
      // 설명 업데이트
      const descEl = document.getElementById('loreDescText');
      if (descEl) {
        descEl.style.opacity = '0';
        setTimeout(() => {
          descEl.textContent = loreDescriptions[loreBuildStep];
          descEl.style.opacity = '1';
        }, 300);
      }
      // 스텝 인디케이터
      document.querySelectorAll('.lore-dot').forEach(dot => {
        const dotStep = parseInt(dot.getAttribute('data-lore-dot'));
        dot.classList.remove('active', 'done');
        if (dotStep === loreBuildStep) dot.classList.add('active');
        else if (dotStep < loreBuildStep) dot.classList.add('done');
      });
      // Step 5: 동조율 게이지 애니메이션
      if (loreBuildStep === 5) {
        setTimeout(() => {
          const fill = document.getElementById('loreSyncFill');
          if (fill) fill.style.width = '72%';
        }, 600);
      }
    }
    function resetLoreBuild() {
      loreBuildStep = 0;
      document.querySelectorAll('.lore-node').forEach(n => n.classList.remove('visible'));
      document.querySelectorAll('.lore-line, .lore-line-label').forEach(l => l.classList.remove('visible'));
      document.querySelectorAll('.lore-dot').forEach(d => d.classList.remove('active', 'done'));
      const descEl = document.getElementById('loreDescText');
      if (descEl) descEl.textContent = loreDescriptions[0];
      const fill = document.getElementById('loreSyncFill');
      if (fill) fill.style.width = '0%';
    }
    // ── 장면 진입 애니메이션 트리거 ──
    function triggerSceneAnimation(scene) {
      if (!scene) return;
      const ch = scene.getAttribute('data-chapter');
      const sc = scene.getAttribute('data-scene');
      // 전역 순차 등장 애니메이션 (모든 씬에 적용)
      playStaggerEntrance(scene);
      if (ch === '01' && sc === '01') {
        triggerOverviewAnimation();
      } else if (ch === '02' && sc === '01') {
        triggerChallengeAnimation();
      } else if (ch === '04' && sc === '01') {
        resetLoreBuild();
        setTimeout(() => advanceLoreBuild(), 600);
        const diagram = document.getElementById('loreDiagram');
        if (diagram && !diagram._loreClickBound) {
          diagram.addEventListener('click', (e) => {
            e.stopPropagation();
            advanceLoreBuild();
          });
          diagram._loreClickBound = true;
        }
      }
    }
    // ── 장면 상태 초기화 함수 (R키 또는 장면 이동 시 작동) ──
    function resetSceneState(index) {
      const scene = scenes[index];
      if (!scene) return;
      if (scene._staggerTimers) {
        scene._staggerTimers.forEach(timer => clearTimeout(timer));
        scene._staggerTimers = [];
      }
      scene._staggerTargets = [];
      // stagger 클래스 제거
      scene.querySelectorAll('.stagger-target, .stagger-visible').forEach(el => {
        el.classList.remove('stagger-target', 'stagger-visible');
      });
      // CD 워크플로우 리셋
      if (typeof resetCdWorkflow === 'function') resetCdWorkflow();
      resetCdMacroDeck(scene);
      resetCdFinale(scene);
      const ch = scene.getAttribute('data-chapter');
      const sc = scene.getAttribute('data-scene');
      if (ch === '01' && sc === '01') {
        const lines = document.querySelectorAll('#overviewLogTerminal .log-line');
        lines.forEach(line => line.classList.remove('show'));
        const p1 = document.getElementById('pillar1');
        const p2 = document.getElementById('pillar2');
        if (p1) p1.classList.remove('show');
        if (p2) p2.classList.remove('show');
      }
      else if (ch === '02' && sc === '01') {
        const node = document.getElementById('conflictNode');
        const overlay = document.getElementById('resolutionOverlay');
        if (node) { node.textContent = '?'; node.classList.remove('resolved'); }
        if (overlay) overlay.classList.remove('show');
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
      else if (ch === '04' && sc === '01') {
        resetLoreBuild();
      }
      else if (ch === '03' && sc === '01') {
        if (typeof activateLoopStep === 'function') activateLoopStep(0);
        const btnS = document.querySelector('.btn-route--success');
        const btnF = document.querySelector('.btn-route--failure');
        const rtxt = document.getElementById('routeResultText');
        if (btnS) btnS.classList.remove('active');
        if (btnF) btnF.classList.remove('active');
        if (rtxt) { rtxt.textContent = '시뮬레이션 경로를 클릭하세요.'; rtxt.style.color = 'var(--text-muted)'; }
      }
      else if (ch === '03' && sc === '02') {
        currentSync = 15;
        const smf = document.getElementById('syncMeterFill');
        const smt = document.getElementById('syncMeterText');
        const sfb = document.getElementById('syncFeedback');
        if (smf) smf.style.width = '15%';
        if (smt) smt.textContent = '현재 동조율: 15%';
        if (sfb) sfb.textContent = '기억 조각을 눌러서 흡수하십시오.';
        document.querySelectorAll('.memory-fragment-item').forEach(item => {
          item.style.opacity = '1';
          item.style.pointerEvents = 'auto';
          item.style.transform = 'none';
        });
      }
      else if (ch === '05' && sc === '01') {
        resetComparisonSlider();
      }
      else if (ch === '07' && sc === '01') {
        resetPmAiPlayer();
      }
      else if (ch === '08' && sc === '04') {
        resetUnifiedComparison('pdVfxFrame');
      }
      else if (ch === '08' && sc === '05') {
        resetUnifiedComparison('pdShaderFrame');
      }
      else if (ch === '09') {
        resetTdScene(scene);
      }

    }
