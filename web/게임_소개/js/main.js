/* ============================================================
   main.js — 침몽도시: 루시드 다이버 Portfolio GDD
   ============================================================ */

"use strict";

/* ── Scroll Spy ─────────────────────────────────────────────── */
function initScrollSpy() {
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute("href").replace("#", "");
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const found = sections.find(s => s.id === entry.target.id);
        if (!found) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove("active"));
          found.link.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
  );

  sections.forEach(({ el }) => observer.observe(el));
}

/* ── Mobile Navigation ───────────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const sideNav = document.getElementById("side-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const overlay = document.getElementById("nav-overlay");

  if (!hamburger || !sideNav) return;

  function openNav() {
    sideNav.classList.add("open");
    hamburger.classList.add("open");
    if (overlay) overlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    sideNav.classList.remove("open");
    hamburger.classList.remove("open");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", () => {
    if (sideNav.classList.contains("open")) closeNav();
    else openNav();
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeNav();
    });
  });

  if (overlay) overlay.addEventListener("click", closeNav);
}

/* ── Scroll-to-top ───────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) btn.classList.add("visible");
    else btn.classList.remove("visible");
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ── Lightbox ─────────────────────────────────────────────────── */
function initLightbox() {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbVideo = document.getElementById("lightbox-video");
  const lbClose = document.getElementById("lightbox-close");
  const triggers = document.querySelectorAll(".screen-card img, [data-lightbox]");

  if (!lb) return;

  function openLb(src, alt, isVideo) {
    const detectVideo = isVideo !== undefined ? isVideo : (src.endsWith(".webm") || src.endsWith(".mp4") || src.includes("video"));

    if (detectVideo) {
      if (lbImg) {
        lbImg.style.display = "none";
        lbImg.src = "";
      }
      if (lbVideo) {
        lbVideo.src = src;
        lbVideo.style.display = "block";
      }
    } else {
      if (lbVideo) {
        lbVideo.style.display = "none";
        lbVideo.src = "";
      }
      if (lbImg) {
        lbImg.src = src;
        lbImg.alt = alt || "";
        lbImg.style.display = "block";
      }
    }
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  window.openLightbox = openLb;

  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (lbImg) {
      lbImg.src = "";
      lbImg.style.display = "none";
    }
    if (lbVideo) {
      lbVideo.src = "";
      lbVideo.style.display = "none";
    }
  }

  triggers.forEach(el => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", () => {
      const isVideo = el.tagName === "VIDEO" || (el.src && (el.src.endsWith(".webm") || el.src.endsWith(".mp4")));
      openLb(el.src || el.currentSrc, el.alt || "", isVideo);
    });
  });

  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target === lbVideo) closeLb();
  });

  if (lbClose) lbClose.addEventListener("click", closeLb);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLb();
  });
}

/* ── Smooth Nav link highlight on scroll ─────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  let ticking = false;

  function highlight() {
    const scrollY = window.scrollY;
    const navLinks = document.querySelectorAll(".nav-link[href^='#']");

    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === `#${current}`) {
        link.classList.add("active");
        // auto-scroll nav to show active item
        const nav = document.getElementById("side-nav");
        if (nav) {
          const linkRect = link.getBoundingClientRect();
          const navRect = nav.getBoundingClientRect();
          if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
            link.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      }
    });
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(highlight);
      ticking = true;
    }
  });

  // Initial call
  highlight();
}

/* ── Fade-in on scroll ───────────────────────────────────────── */
function initFadeIn() {
  const elements = document.querySelectorAll(
    ".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card"
  );

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  elements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });

  document.querySelectorAll(".fade-visible").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
}

// Apply fade-visible class
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to allow layout
  requestAnimationFrame(() => {
    document.querySelectorAll(".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card").forEach(el => {
      if (el.classList.contains("fade-visible")) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });
  });
});

// Override: add style when element becomes visible
const _observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        _observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);

/* ── Detail Modal (플로팅 상세 정보 창) ────────────────────────── */
const detailModalData = {
  "extraction": {
    category: "Genre Deep Dive",
    title: "PvE 익스트랙션 장르의 정의",
    images: [
      { src: "./assets/images/ref_tarkov.jpg", alt: "Escape from Tarkov 대표 키 비주얼 레퍼런스" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 익스트랙션 장르란 무엇인가?</h4>
        <p class="modal-quote">"살아서 돌아오지 못하면, 그 어떤 노력도 의미가 없다."</p>
        <p class="modal-desc">
          익스트랙션 장르는 특정 위험 구역에 진입하여 전투와 탐색을 수행하고, 전리품을 파밍한 뒤 지정된 탈출구를 통해 생존하여 복귀하는 것을 극단적인 최종 목표로 삼는 게임 장르입니다.
        </p>
        <p class="modal-desc">
          대표작인 이스케이프 프롬 타르코프(Escape from Tarkov)를 기점으로 전 세계적인 대세 장르로 자리 잡았으며, 적을 많이 처치하는 것보다 가져온 전리품을 안전하게 밖으로 반출하는 것에 집중되어 비교할 수 없는 긴장감을 선사합니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 익스트랙션의 핵심 3대 문법</h4>
        <ul class="modal-bullets">
          <li><strong>생존 시 전리품 보존 (High Return):</strong> 세션에서 획득한 모든 아이템은 무사히 탈출에 성공해야만 플레이어의 아웃게임 창고 및 자산으로 귀속됩니다.</li>
          <li><strong>사망 시 전원 유실 (High Risk):</strong> 세션 도중 사망(HP 0)하거나 탈출에 실패할 경우, 해당 세션에서 획득한 모든 전리품을 현장에 잃어버린 채 복귀하게 됩니다.</li>
          <li><strong>탐욕과 생존의 저울질:</strong> 더 깊은 구역을 탐색하여 대박을 노릴 것인가, 혹은 위험을 감지하고 현재 손에 든 전리품에 만족하여 탈출구로 향할 것인가에 대한 매 순간의 심리전이 핵심 재미입니다.</li>
        </ul>
      </div>
    `
  },
  "salvation": {
    category: "Core Pitch — Salvation",
    title: "캐릭터 구원 서사와 플레이어의 역할",
    images: [
      { src: "./assets/images/ref_bluearchive.png", alt: "블루 아카이브의 선생님과 학생의 유대관계 레퍼런스" },
      { src: "./assets/images/ref_nikke.jpg", alt: "승리의 여신: 니케의 지휘관과 니케의 구원 서사 레퍼런스" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 서브컬처 게임에서의 애착과 구원 (Reference)</h4>
        <p class="modal-desc">
          <strong>블루 아카이브 (Blue Archive):</strong> 플레이어는 상처받거나 문제를 안고 있는 학생들을 올바르게 이끌고 보듬어주는 선생님의 역할을 수행하며 강력한 교감과 애착을 형성합니다.
        </p>
        <p class="modal-desc">
          <strong>승리의 여신: 니케 (NIKKE):</strong> 플레이어는 도구로 다뤄지며 기억을 지우는 뇌 이식 수술을 거친 니케들을 하나의 인격체로 존중하고 구해주는 지휘관의 역할을 수행합니다.
        </p>
        <p class="modal-quote">인기 서브컬처 게임들은 공통적으로 플레이어를 단순 조작자가 아닌, 캐릭터가 의지하고 구원받을 수 있는 특별한 존재로 상정하여 몰입감을 극대화합니다.</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 침몽도시: 루시드 다이버만의 구원 서사 룰</h4>
        <ul class="modal-bullets">
          <li><strong>기억 상실의 재난, 침몽도시:</strong> 다이버들은 꿈속 도시로 진입할 때마다 정신적 외상을 입고 기억을 잃어갑니다. 반복 출격 도중 구조받지 못한 다이버는 자아를 완전히 잃고 끝내 적(괴이)으로 변질되는 비극적인 운명을 가지고 있습니다.</li>
          <li><strong>유일한 기록자, 관제사 (플레이어):</strong> 다이버는 실패의 순간들을 잊어버리지만, 플레이어(관제사)는 다이버의 링크를 붙들고 모든 실패 로그를 기억하는 유일한 목격자입니다. 플레이어가 위험 지역에서 회수해오는 기억 파편은 단순한 랭킹용 재화가 아니라, 다이버의 깨져버린 자아를 다시 맞추어 파멸(괴이화)을 막는 열쇠가 됩니다.</li>
        </ul>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">3. 서사적 경험이 아웃게임 시스템으로 피드백되는 방식</h4>
        <ul class="modal-bullets">
          <li><strong>재화 파밍의 서사화:</strong> 세션에서 살아서 복귀해 파편을 정산하면 다이버와의 동조율(Link Rate)이 자동으로 복구됩니다.</li>
          <li><strong>체감되는 대사의 변화:</strong> 동조율이 복구될수록 로비 화면에서 다이버가 출력하는 대사가 "관제사, 널 어떻게 믿지?"라는 경계에서 "어째서 네 목소리가 이렇게 그리운 거지?"라는 기시감을 거쳐 깊은 유대로 연결되는 감정적 변화를 연출합니다.</li>
        </ul>
      </div>
    `
  },
  "affinity": {
    category: "Core Pitch — Recall Affinity Loop",
    title: "기억 회수형 애착 보상 메커니즘",
    images: [
      { src: "./assets/images/ref_genshin.png", alt: "원신의 친밀도 상승 및 스토리 해금 레퍼런스" },
      { src: "./assets/images/ref_fgo.jpg", alt: "페이트 그랜드 오더의 인연 등급 대사 변화 레퍼런스" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 단순한 성장 재화를 넘어서는 감정 피드백 (Reference)</h4>
        <p class="modal-desc">
          <strong>원신 (Genshin Impact):</strong> 캐릭터의 친밀도 레벨이 오를 때마다 단순 스탯 성장이 아니라 캐릭터의 상세 프로필, 숨겨진 개인 비화, 특별한 전용 음성 보이스들이 순차적으로 해금되며 애착을 형성합니다.
        </p>
        <p class="modal-desc">
          <strong>페이트/그랜드 오더 (FGO):</strong> 인연 등급(Bond Level) 시스템을 통해 캐릭터의 마이룸 대사가 점차 다정하고 친밀하게 변화하며, 특정 등급 달성 시 캐릭터 고유의 사연이 담긴 전용 인연 예장을 획득합니다.
        </p>
        <p class="modal-quote">서브컬처 유저들이 가장 몰입하는 보상은 단순히 숫자가 오르는 스탯이 아니라, 캐릭터와 플레이어 단둘만의 유대감과 숨겨진 사연(스토리)이 깊어지는 감정적 피드백입니다.</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 침몽도시: 루시드 다이버의 애착 보상 흐름</h4>
        <ul class="modal-bullets">
          <li><strong>기억 조각의 가치 전환:</strong> 인게임 세션에서 어렵게 살려 나온 기억 파편은 아웃게임 상점에서 무기를 사고파는 일반적인 화폐가 아닙니다. 이 파편들은 다이버와의 결합 상태를 증명하는 동조율(Link Rate) 상승에 즉시 소비되어 동조율 단계를 복구합니다.</li>
          <li><strong>자물쇠가 열리는 개인 심상 기록:</strong> 동조율 단계가 1에 도달하면 개인 심상 기록 01(시나리오 텍스트)의 잠금이 해제되며, 다이버의 조각난 과거 기억을 로비의 다이버/기록 메뉴에서 소설처럼 감상할 수 있습니다.</li>
          <li><strong>동적 로비 반응 및 귀환 대사:</strong> 동조율 등급이 상승하면 로비 메인 화면에 알림 마크가 활성화되며, 다이버가 플레이어를 바라보는 표정이나 귀환 대사(TID 매핑)가 실시간으로 갱신되어 관계의 진전을 눈으로 확인시켜 줍니다.</li>
        </ul>
      </div>
    `
  },
  "world-erosion": {
    category: "World Setting — Dream Erosion",
    title: "꿈의 침식과 심상무장",
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 재난 현상: 꿈의 침식</h4>
        <p class="modal-desc">
          침몽도시는 현실과 꿈이 강하게 중첩되며 물리 법칙이 무너진 특수 재난 구역입니다. 현실에서 동작하는 재래식 화기는 실체가 없는 꿈속 괴이(꿈식자)들에게 어떠한 손상도 주지 못합니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 오직 정신으로 제어하는 심상무장</h4>
        <p class="modal-desc">
          오직 꿈의 에너지와 정신적으로 공명할 수 있는 다이버만이 심상무장(Mind Armament)을 실체화하여 사용할 수 있습니다.
        </p>
        <ul class="modal-bullets">
          <li><strong>심상무장 구현 범위 (에너지 권총):</strong> 다이버 유안이 기본 탑재하는 에너지 권총(Pistol) 1종만 최종 구현하여 루프를 검증합니다.</li>
          <li><strong>추가 무기 구현 계획 없음:</strong> 현재 돌격소총(AR)을 포함한 추가 무장의 구현 계획은 존재하지 않으며, 이번 P0 빌드에서는 기본 에너지 권총만 구현하고 추후 개발 로드맵에 따라 추가 무장 구현을 검토할 예정입니다.</li>
        </ul>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">3. 자원 연동 (MP)</h4>
        <p class="modal-desc">
          심상무장은 물리적인 탄환 대신 다이버의 정신력(playerMP)을 소모하여 발사됩니다. 사격당 MP 소모량은 무장 사양에 따르며, 기묘한 사탕을 활용하여 인게임에서 MP를 즉시 보충할 수 있습니다.
        </p>
      </div>
    `
  },
  "world-loss": {
    category: "World Setting — Iteration & Loss",
    title: "반복되는 강제 각성과 영구적 자아 유실",
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 강제 각성 (sessionState = RESULT)</h4>
        <p class="modal-desc">
          인게임 세션 도중 체력(playerHP)이 0 이하로 떨어지면 사망 판정과 함께 강제 각성(Failed) 처리가 수행됩니다. 이때 플레이어는 해당 세션에서 획득했던 모든 기억 파편과 기물(기묘한 사탕/변질된 붕대)을 잃은 채 빈손으로 관제실로 돌아오게 됩니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 정신적 외상과 기억 유실</h4>
        <p class="modal-desc">
          각성 시 발생하는 강한 정신적 충격은 다이버의 영구적인 정신 손상을 야기합니다. 다이버는 매번 각성할 때마다 방금 전 세션에서 있었던 사건들과 심지어 자신과 연결되었던 관제사(플레이어)에 대한 유대감마저 잊어버리게 됩니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">3. 괴이 변질 경고 (Out of P0 Scope)</h4>
        <p class="modal-quote">"기억과 자아를 완전히 빼앗긴 적합자는 더 이상 인간으로 머물 수 없다."</p>
        <p class="modal-desc">
          구출 및 링크 접속이 완전히 해제된 상태로 방치되어 자아 유실도가 한계치에 달한 다이버는 최종적으로 인간의 마음을 완전히 잃고, 침몽도시를 배회하며 플레이어를 위협하는 끔찍한 폭주 괴이(꿈식자)로 변질됩니다.
        </p>
      </div>
    `
  },
  "world-signal": {
    category: "World Setting — Return Signal",
    title: "귀환 신호 분석과 공중전화부스",
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 공중전화부스 (탈출 Collider)</h4>
        <p class="modal-desc">
          침몽도시 내부에서 유실 없이 온전하게 귀환할 수 있는 유일한 통로는 현장의 불안정한 주파수를 잡아내는 특정 공중전화부스입니다. 다이버는 이 구역(Collider Trigger)에 진입하여 채널링을 완수해야만 탈출 성공(SUCCESS) 판정을 얻습니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 전리품 복구와 보존</h4>
        <p class="modal-desc">
          성공적으로 귀환할 경우 세션에서 획득한 회수품(기묘한 사탕/변질된 붕대)은 창고 변수(storedManaStoneCount / storedPotionCount)에 누적 귀속되어 다음 출격을 위한 출격 소지품 슬롯 장착 용도로 안전하게 저장됩니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">3. 관제 동조와 데이터 분석</h4>
        <p class="modal-desc">
          귀환 시 획득한 기억 파편은 다이버의 동조율 등급(linkRateLevel) 상승에 자동으로 소비되며, 결합이 안정화될 때 다이버의 해독 불가능했던 개인 심상 기록을 온전히 복원하여 열람할 수 있는 뷰어가 개방됩니다.
        </p>
      </div>
    `
  },
  "diver-yuan": {
    layout: "split",
    category: "Diver Profile",
    title: "다이버 - 유안 (Yuan)",
    images: [
      { src: "./assets/images/Yuan_ConceptArt.png", alt: "유안 캐릭터 컨셉 아트 원화" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 캐릭터 개요 및 성격</h4>
        <p class="modal-desc">
          <strong>"너를 믿으라고? 내가 기억도 못 하는 사람을?"</strong>
        </p>
        <p class="modal-desc">
          성격 태그: <strong>방어적 불신, 외강내유, 냉소적</strong>
        </p>
        <p class="modal-desc">
          최초로 침몽도시에서 불완전 귀환에 성공한 다이버입니다. 반복되는 강제 각성 속에서 다른 다이버들이 자아를 잃고 쓰러져 갈 때, 관제사(플레이어)와의 미세한 연결 링크를 통해 기적적으로 생환했습니다. 각성으로 인해 기억의 상당 부분을 잃어 관제사를 경계하지만, 무의식적으로 관제사의 신호에 동조하고 있습니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 전투 스타일 및 심상무장</h4>
        <ul class="modal-bullets">
          <li><strong>심상무장:</strong> 꿈을 물들이는 포성 (돌격소총형 하이브리드 무장)</li>
          <li><strong>설명:</strong> 외관상 돌격소총 실루엣을 띠고 있으나 총기 하단에 고체화된 프리즘 렌즈 장치와 언더배럴 형태의 유탄발사기가 융합되어 있습니다. 휘어지거나 굴절되는 궤적의 투사체 사격에 특화되어 있습니다. (※ P0 빌드에서는 기본 권총 '희미한 잔상'으로 대체 운용됩니다.)</li>
        </ul>
      </div>
    `
  },
  "diver-ethan": {
    layout: "split",
    category: "Diver Profile",
    title: "다이버 - 에단 (Ethan)",
    images: [
      { src: "./assets/images/Ethan_ConceptArt.png", alt: "에단 캐릭터 컨셉 아트 원화" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 캐릭터 개요 및 성격</h4>
        <p class="modal-desc">
          <strong>"전투 같은 건 귀찮은데… 대충 끝내고 쉬자고."</strong>
        </p>
        <p class="modal-desc">
          성격 태그: <strong>귀차니즘, 전술적 게으름, 돌파형</strong>
        </p>
        <p class="modal-desc">
          평소에는 만사가 다 귀찮은 듯 행동하며 빈둥거리지만, 실전 상황에 들어가면 강력한 뇌파 출력을 바탕으로 전장의 최전선에서 적을 돌파해 나가는 전투 요원입니다. 무겁고 둔한 타격 무기를 다루며, 침식 영역의 장벽을 직접 깨부수는 돌파 능력이 뛰어납니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 전투 스타일 및 심상무장</h4>
        <ul class="modal-bullets">
          <li><strong>심상무장:</strong> 몽마의 종식 (양손 해머형 중무장)</li>
          <li><strong>설명:</strong> 꿈의 충격파를 응축하여 적의 물리 공격 방벽과 몽막(Dream Barrier) 게이지를 빠르게 타격하고 부수어 무력화하는 무기입니다. 막강한 광역 파괴력과 적들을 물리치는 넉백 판정을 탑재하고 있습니다.</li>
        </ul>
      </div>
    `
  },
  "diver-haseon": {
    layout: "split",
    category: "Diver Profile",
    title: "다이버 - 하선 (Haseon)",
    images: [
      { src: "./assets/images/Haseon_ConceptArt.png", alt: "하선 캐릭터 컨셉 아트 원화" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 캐릭터 개요 및 성격</h4>
        <p class="modal-desc">
          <strong>"타겟 포착. 제 시야에서 벗어날 순 없습니다."</strong>
        </p>
        <p class="modal-desc">
          성격 태그: <strong>침착함, 정밀함, 차분함</strong>
        </p>
        <p class="modal-desc">
          매사 침착하고 감정의 기복이 적은 다이버로, 전투 상황 속에서도 뇌파의 캘리브레이션 안정성이 극도로 높습니다. 관제사의 지시를 최우선으로 따르며, MP 소모 효율을 극한으로 계산하여 아군 다이버 중에서 가장 적은 자원 소모율로 임무를 완수해 냅니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 전투 스타일 및 심상무장</h4>
        <ul class="modal-bullets">
          <li><strong>심상무장:</strong> 거울의 파편 (지정사수 소총형 무장)</li>
          <li><strong>설명:</strong> 깨진 유리 조각들이 접합된 외형을 띤 장거리 소총입니다. 사격 시 적의 방어율을 관통하는 크랙 미러 탄피를 발사하며, 단 한 발의 헤드샷으로 치명적인 보너스(Core Hit)를 극대화할 수 있도록 정밀하게 조정되어 있습니다.</li>
        </ul>
      </div>
    `
  },
  "diver-helena": {
    layout: "split",
    category: "Diver Profile",
    title: "다이버 - 헬레나 (Helena)",
    images: [
      { src: "./assets/images/Helena_ConceptArt.png", alt: "헬레나 캐릭터 컨셉 아트 원화" }
    ],
    content: `
      <div class="modal-section">
        <h4 class="modal-section-title">1. 캐릭터 개요 및 성격</h4>
        <p class="modal-desc">
          <strong>"괴이의 신체 구조는 참 특이하네요. 해부해 봐도 될까요?"</strong>
        </p>
        <p class="modal-desc">
          성격 태그: <strong>맑은 눈의 광기, 차분한 광기, 해부/정밀분석 연구원</strong>
        </p>
        <p class="modal-desc">
          차분하고 상냥한 존댓말 미소 뒤에, 적의 사체를 낱낱이 파헤치고 사후 성분을 정밀 분석하고 싶어 하는 섬뜩한 집착을 품은 연구원 타입의 다이버입니다. 다소 괴짜 같은 성격이지만, 정밀한 임상 분석력을 바탕으로 전장에서 아군의 상처를 소독하고 정신 붕괴(자아 유실)를 막아내는 데 탁월합니다.
        </p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">2. 전투 스타일 및 심상무장</h4>
        <ul class="modal-bullets">
          <li><strong>심상무장:</strong> 드림 메스 (의료 광선 및 렌즈형 무장)</li>
          <li><strong>설명:</strong> 특화 소총 및 치료 광선 방출 장치입니다. 아군 호출 지원 공격(20 MP 소모) 시, 침식체들을 타격함과 동시에 아군 다이버의 체력(HP)을 15% 복구하는 동조 케어 광선을 투사합니다.</li>
        </ul>
      </div>
    `
  }
};

function initDetailModal() {
  const modal = document.getElementById("detail-modal");
  const modalBody = document.getElementById("modal-body-container");
  const closeBtn = document.getElementById("modal-close-btn");
  const triggers = document.querySelectorAll("[data-modal-target]");

  if (!modal || !modalBody) return;

  function openModal(targetKey) {
    const data = detailModalData[targetKey];
    if (!data) return;

    const modalContent = modal.querySelector(".modal-content");

    if (data.layout === "split") {
      modalContent.classList.add("modal-layout-split");
      const imgSrc = data.images && data.images[0] ? data.images[0].src : '';
      const imgAlt = data.images && data.images[0] ? data.images[0].alt : '';

      modalBody.innerHTML = `
        <div class="modal-split-left">
          <img src="${imgSrc}" alt="${imgAlt}" style="cursor: zoom-in;" onclick="if(window.openLightbox) window.openLightbox(this.src, this.alt)">
        </div>
        <div class="modal-split-right">
          <div class="modal-header">
            <span class="modal-category">${data.category}</span>
            <h3 class="modal-title">${data.title}</h3>
          </div>
          <div class="modal-body-content">
            ${data.content}
          </div>
        </div>
      `;
    } else {
      modalContent.classList.remove("modal-layout-split");
      let imagesMarkup = '';
      if (data.images && data.images.length > 0) {
        if (data.images.length === 1) {
          imagesMarkup = `
            <div class="modal-img-wrap">
              <img src="${data.images[0].src}" alt="${data.images[0].alt || ''}" class="modal-featured-img" style="cursor: zoom-in;" onclick="if(window.openLightbox) window.openLightbox(this.src, this.alt)">
            </div>
          `;
        } else {
          imagesMarkup = `
            <div class="modal-img-grid">
              ${data.images.map(img => `
                <div class="modal-img-wrap">
                  <img src="${img.src}" alt="${img.alt || ''}" class="modal-featured-img" style="cursor: zoom-in;" onclick="if(window.openLightbox) window.openLightbox(this.src, this.alt)">
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      modalBody.innerHTML = `
        <div class="modal-header">
          <span class="modal-category">${data.category}</span>
          <h3 class="modal-title">${data.title}</h3>
        </div>
        ${imagesMarkup}
        <div class="modal-body-content">
          ${data.content}
        </div>
      `;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Wait for fadeout animation before clearing innerHTML
    setTimeout(() => {
      if (!modal.classList.contains("open")) {
        modalBody.innerHTML = "";
        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.classList.remove("modal-layout-split");
      }
    }, 220);
  }

  triggers.forEach(el => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-modal-target");
      openModal(target);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop") || e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("lightbox");
    const isLbOpen = lb && lb.classList.contains("open");
    if (e.key === "Escape" && modal.classList.contains("open") && !isLbOpen) {
      closeModal();
    }
  });
}

/* ── Bootstrap All ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initScrollSpy();
  initMobileNav();
  initScrollTop();
  initLightbox();
  initNavHighlight();
  initFadeIn();
  initDetailModal();
  initVNTerminal();
  initScenarioAccordion();

  // Hook fade-in observer
  document.querySelectorAll(
    ".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card"
  ).forEach(el => _observer.observe(el));
});

/* ══════════════════════════════════════════════════════════════
   VN TERMINAL SYNOPSIS MODULE
══════════════════════════════════════════════════════════════ */

function initVNTerminal() {
  const wrapper = document.getElementById("vnTerminal");
  if (!wrapper) return;

  const bgImg = document.getElementById("vnBgImg");
  const sysTag = document.getElementById("vnSysTag");
  const linkFill = document.getElementById("vnLinkFill");
  const linkPct = document.getElementById("vnLinkPct");
  const linkStatus = document.getElementById("vnLinkStatus");
  const alarm = document.getElementById("vnAlarm");
  const flash = document.getElementById("vnFlash");
  const speaker = document.getElementById("vnSpeaker");
  const textEl = document.getElementById("vnText");
  const cursor = document.getElementById("vnCursor");
  const prevBtn = document.getElementById("vnPrevBtn");
  const nextBtn = document.getElementById("vnNextBtn");
  const skipBtn = document.getElementById("vnSkipBtn");
  const stepNum = document.getElementById("vnStepNum");
  const dots = wrapper.querySelectorAll(".vn-step-dot");

  /* ── 씬 데이터 ─────────────────────────────────────────── */
  const scenes = [
    {
      bg: "./assets/images/vn_scene_01.png",
      linkRate: 0, linkClass: "", linkStatusText: "OFFLINE",
      sysTag: "[SYSTEM: ACCESSING NDMA ARCHIVE...]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: [],
      text:
        `인간의 꿈을 물리적인 형상으로 투사하는 입자, 루시드.
그 기술은 처음엔 기적이라 불렸다.
잠든 사람이 본 풍경을 현실 위에 펼쳐 보이는, 새로운 오락 산업의 시작이라고 믿었다.

하지만 루시드 캡슐이 정식 출시된 날, 동시에 수면에 빠진 1,000명의 꿈은 하나의 대기층에서 공명했다.
기억, 공포, 욕망, 후회. 서로 다른 무의식이 하나의 거대한 악몽 네트워크로 얽혔다.

그날 이후, 도시의 일부는 더 이상 현실도, 꿈도 아닌 구역이 되었다.
침몽도시.
실패한 귀환과 잃어버린 기억을 재료로 매번 다시 재구성되는 꿈의 재난 구역.`
    },
    {
      bg: "./assets/images/vn_scene_02.png",
      linkRate: 0, linkClass: "", linkStatusText: "OFFLINE",
      sysTag: "[SYSTEM: LOADING P0_WORLD_DIVE_LOG...]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: [],
      text:
        `현실의 총은 침몽도시의 괴이를 멈추지 못했다.
그곳의 적들은 꿈과 같은 매질로 이루어져 있었고, 현실의 탄환은 그 몸을 안개처럼 통과했다.

살아남기 위해서는 꿈속에서 태어난 무장, 드림 포지드가 필요했다.
그리고 그 무장을 다룰 수 있는 사람들만이 침몽도시 안으로 들어갈 수 있었다.
우리는 그들을 다이버라 불렀다.

하지만 다이버는 선택받은 전투원이 아니다.
그들은 이미 침몽도시와 깊게 연결된 사람들.
꿈에 들어갈 수 있다는 것은, 그만큼 꿈에게 잡아먹히기 쉽다는 뜻이기도 했다.`
    },
    {
      bg: "./assets/images/vn_scene_03.png",
      linkRate: 82, linkClass: "", linkStatusText: "ACTIVE",
      sysTag: "[SYSTEM: LOADING P0_DIVE_FAILURE_LOG...]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: [],
      text:
        `침몽도시의 진짜 잔인함은 죽음이 아니다.
다이버는 쓰러질 때마다 현실로 강제로 끌어올려진다.

육체는 돌아온다. 호흡도 돌아온다.
하지만 기억은 돌아오지 않는다.
그들이 어디서 무너졌는지, 무엇을 붙잡으려 했는지, 마지막 순간 누구의 목소리를 들었는지.
대부분은 꿈속에 남는다.

그리고 그 잃어버린 기억은 다음 세션의 어딘가에서 작은 파편이 되어 떠돈다.
기억 파편. 다이버가 잃어버린 자아의 조각.
관제 로그만이 그것이 누구의 것인지 기록한다.`
    },
    {
      bg: "./assets/images/vn_scene_04.png",
      linkRate: 15, linkClass: "danger", linkStatusText: "DANGER",
      sysTag: "[WARNING: SUBJECT INTEGRITY CRITICAL]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: ["alarm", "shake", "glitch"],
      text:
        `실패가 반복되면, 침몽도시는 다이버의 이름을 지운다.
처음엔 기억이 사라진다. 다음엔 감정이 흐려진다.
마지막엔 자신이 누구였는지조차 잊는다.

그 순간, 다이버는 더 이상 현실로 돌아올 길을 찾지 못한다.
꿈은 그 사람의 형태만 남긴다.
어제까지 함께 싸우던 동료가, 오늘은 침몽도시의 괴이가 되어 나타난다.

그들은 우리를 기억하지 못한다.
하지만 관제 로그에는 남아 있다.
그들이 몇 번 실패했는지. 어디서 무너졌는지. 마지막으로 누구의 목소리에 반응했는지.`
    },
    {
      bg: "./assets/images/vn_scene_05.png",
      linkRate: 100, linkClass: "full", linkStatusText: "RE-ESTABLISHED",
      sysTag: "[SYSTEM: LINK RE-ESTABLISHED // CONTROLLER ONLINE]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: [],
      text:
        `나의 뇌파가 다이버들과 엮일 때마다, 안개 너머의 공포와 고통이 내 신경망으로 역류한다. 
그들은 실패를 잊는다. 하지만 관제 로그는 남는다. 

누가 어디서 무너졌는지. 마지막 순간, 누구의 목소리에 반응했는지. 

직접 총을 들고 그 꿈속을 걸을 수는 없다. 

하지만 나는 안과 밖을 동시에 잇고, 끊어지는 귀환 신호를 붙잡는 관제사.
내 목소리를 따라 사선을 헤매는 다이버들을, 단 한 명도 그 악몽 속에 홀로 버려두지 않을 것이다.`
    },
    {
      bg: "./assets/images/vn_scene_06.png",
      linkRate: 100, linkClass: "full", linkStatusText: "DIVE INITIATED",
      sysTag: "[SYSTEM: STARTING LINK WITH SUBJECT 'YUAN'...]",
      speakerText: "나레이션 — 관제사",
      isSystem: false,
      effects: ["flash"],
      text:
        `다이버는 잊는다. 관제사는 기록한다.


침몽도시에 남겨진 귀환 신호를 추적한다.
잃어버린 기억 파편을 회수한다.
그들이 괴이로 변질되기 전에, 다시 현실로 되돌린다.

모두가 나를 기억하지 못하더라도, 나는 절망과 실패들을 기억한다.
그리고 같은 운명에 놓인 다른 다이버들이 아직 그 안에 남아 있다.

그러니 다시 링크를 연다. 다시 기록한다. 

<span class="vn-highlight-final">다시, 구하러 들어간다.</span>`
    },
  ];

  let currentStep = 0;
  let typeTimer = null;
  let isTyping = false;
  let alarmActive = false;

  /* ── 헬퍼: 링크 게이지 업데이트 ── */
  function updateLinkBar(scene) {
    linkFill.style.width = scene.linkRate + "%";
    linkFill.className = "vn-link-fill" + (scene.linkClass ? " " + scene.linkClass : "");
    linkPct.textContent = scene.linkRate > 0 ? scene.linkRate + "%" : "--";
    linkPct.className = "vn-link-pct" + (scene.linkClass ? " " + scene.linkClass : "");
    linkStatus.textContent = scene.linkStatusText;
  }

  /* ── 헬퍼: 경보 오버레이 ── */
  function setAlarm(on) {
    alarmActive = on;
    if (on) {
      alarm.classList.add("active");
      wrapper.classList.add("step-alarm");
    } else {
      alarm.classList.remove("active");
      wrapper.classList.remove("step-alarm");
    }
  }

  /* ── 헬퍼: 화면 흔들림 ── */
  function triggerShake() {
    wrapper.classList.remove("shake");
    void wrapper.offsetWidth; // reflow
    wrapper.classList.add("shake");
    wrapper.addEventListener("animationend", () => wrapper.classList.remove("shake"), { once: true });
  }

  /* ── 헬퍼: 백색 플래시 ── */
  function triggerFlash() {
    flash.classList.remove("active");
    void flash.offsetWidth;
    flash.classList.add("active");
    flash.addEventListener("animationend", () => flash.classList.remove("active"), { once: true });
  }

  /* ── 헬퍼: 도트 업데이트 ── */
  function updateDots(idx) {
    dots.forEach((d, i) => {
      d.classList.remove("active", "done");
      if (i < idx) d.classList.add("done");
      else if (i === idx) d.classList.add("active");
    });
    stepNum.textContent = String(idx + 1).padStart(2, "0");
  }

  /* ── 타이핑 엔진 ── */
  function typeText(text, onDone) {
    clearTimeout(typeTimer);
    textEl.innerHTML = "";
    cursor.classList.add("visible");
    isTyping = true;
    const speed = 28; // ms per char

    // 텍스트를 HTML 태그와 일반 글자 토큰으로 분리
    const tokens = [];
    let idx = 0;
    while (idx < text.length) {
      if (text[idx] === '<') {
        const endIdx = text.indexOf('>', idx);
        if (endIdx !== -1) {
          tokens.push({ type: 'tag', content: text.substring(idx, endIdx + 1) });
          idx = endIdx + 1;
          continue;
        }
      }
      tokens.push({ type: 'text', content: text[idx] });
      idx++;
    }

    let tokenIdx = 0;
    let currentHTML = "";

    function tick() {
      if (tokenIdx < tokens.length) {
        // 태그 토큰들은 딜레이 없이 한 번에 다 붙임
        while (tokenIdx < tokens.length && tokens[tokenIdx].type === 'tag') {
          currentHTML += tokens[tokenIdx].content;
          tokenIdx++;
        }
        
        // 일반 텍스트 토큰이 있다면 한 글자 추가하고 렌더링 후 다음 tick 스케줄링
        if (tokenIdx < tokens.length && tokens[tokenIdx].type === 'text') {
          currentHTML += tokens[tokenIdx].content;
          tokenIdx++;
          textEl.innerHTML = currentHTML;
          typeTimer = setTimeout(tick, speed);
        } else {
          // 남은 태그가 있을 수 있으므로 최종 반영
          textEl.innerHTML = currentHTML;
          typeTimer = setTimeout(tick, 0);
        }
      } else {
        isTyping = false;
        cursor.classList.remove("visible");
        if (onDone) onDone();
      }
    }
    tick();
  }

  /* ── 씬 로드 ── */
  function loadScene(idx, skipType) {
    const scene = scenes[idx];

    // 마스크 및 노이즈 불투명도 계산 (관제사 의지 반영: Step 1~6을 진행하며 점차 걷힘)
    const maskOpacity = Math.max(0, 1 - (idx * 0.2));
    const noiseOpacity = Math.max(0, 0.3 * (1 - idx * 0.2));
    wrapper.style.setProperty("--vn-mask-opacity", maskOpacity.toFixed(2));
    wrapper.style.setProperty("--vn-noise-opacity", noiseOpacity.toFixed(2));

    // 배경 전환
    bgImg.style.transition = "opacity 0.8s ease";
    bgImg.style.opacity = "0";
    setTimeout(() => {
      bgImg.src = scene.bg;
      bgImg.style.opacity = scene.effects.includes("alarm") ? "0.35" : "0.75";
    }, 400);

    // 시스템 태그
    sysTag.textContent = scene.sysTag;

    // 링크 게이지
    updateLinkBar(scene);

    // 스피커
    speaker.textContent = scene.speakerText;

    // 텍스트 스타일
    textEl.className = "vn-text" + (scene.isSystem ? " system-text" : "");

    // 이펙트 적용
    setAlarm(scene.effects.includes("alarm"));
    wrapper.classList.toggle("step-final", idx === scenes.length - 1);

    if (scene.effects.includes("flash")) {
      setTimeout(() => triggerFlash(), 100);
    }
    if (scene.effects.includes("shake")) {
      setTimeout(() => triggerShake(), 200);
    }
    if (scene.effects.includes("glitch")) {
      textEl.classList.remove("glitch");
      void textEl.offsetWidth;
      setTimeout(() => textEl.classList.add("glitch"), 300);
    }

    // 텍스트 출력
    if (skipType) {
      clearTimeout(typeTimer);
      textEl.innerHTML = scene.text;
      isTyping = false;
      cursor.classList.remove("visible");
    } else {
      typeText(scene.text);
    }

    // 도트 & 버튼 상태
    updateDots(idx);
    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === scenes.length - 1 ? "▶ 완료" : "NEXT ▶";
    nextBtn.className = "vn-nav-btn primary";
  }

  /* ── 클릭: 타이핑 중이면 스킵 ── */
  wrapper.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    if (isTyping) {
      clearTimeout(typeTimer);
      textEl.innerHTML = scenes[currentStep].text;
      isTyping = false;
      cursor.classList.remove("visible");
    }
  });

  /* ── NEXT ── */
  nextBtn.addEventListener("click", () => {
    if (isTyping) {
      clearTimeout(typeTimer);
      textEl.innerHTML = scenes[currentStep].text;
      isTyping = false;
      cursor.classList.remove("visible");
      return;
    }
    if (currentStep < scenes.length - 1) {
      currentStep++;
      loadScene(currentStep);
    } else {
      // 완료 — 아코디언 열기
      const body = document.getElementById("scenarioAccordionBody");
      const btn = document.getElementById("scenarioAccordionBtn");
      if (body && !body.classList.contains("open")) {
        body.classList.add("open");
        btn && (btn.ariaExpanded = "true");
        body.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });

  /* ── PREV ── */
  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      loadScene(currentStep);
    }
  });

  /* ── SKIP ── */
  skipBtn.addEventListener("click", () => {
    clearTimeout(typeTimer);
    setAlarm(false);
    currentStep = scenes.length - 1;
    loadScene(currentStep, true);
  });

  // 초기 씬 로드
  loadScene(0);
}

/* ── 시나리오 아코디언 ─────────────────────────────────────── */
function initScenarioAccordion() {
  const btn = document.getElementById("scenarioAccordionBtn");
  const body = document.getElementById("scenarioAccordionBody");
  if (!btn || !body) return;

  btn.addEventListener("click", () => {
    const open = body.classList.toggle("open");
    btn.ariaExpanded = String(open);
  });
}

