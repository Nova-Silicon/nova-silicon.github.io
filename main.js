(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  let language = 'en';
  let refreshShowcase = () => {};
  try { language = localStorage.getItem('nova-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en'); } catch (_) {}
  const applyLanguage = (lang) => {
    language = lang === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(el => { el.textContent = el.dataset[language].replace(/\\n/g, '\n'); });
    $('#language-toggle').textContent = language === 'en' ? '中文' : 'EN';
    $('#language-toggle').setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
    document.title = language === 'en' ? 'NovaSilicon — Intelligence, by design.' : 'NovaSilicon 芯星元 — 让智能走进芯片设计';
    try { localStorage.setItem('nova-language', language); } catch (_) {}
    refreshShowcase();
  };
  applyLanguage(language);
  $('#language-toggle').addEventListener('click', () => applyLanguage(language === 'en' ? 'zh' : 'en'));
  const menu = $('#menu-toggle');
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); $('#main-nav').classList.remove('is-open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    $('#main-nav').classList.toggle('is-open', open);
  });
  $('#main-nav').querySelectorAll('a').forEach(el => el.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const slides = window.NOVA_SHOWCASE || [];
  const showcase = $('#design-showcase');
  const heroTrigger = $('#layout-image-wrap');
  const dialog = $('#layout-dialog');
  const viewport = $('#dialog-viewport');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const localized = (value) => typeof value === 'string' ? value : (value[language] || value.en);
  const words = (en, zh) => language === 'zh' ? zh : en;
  let activeSlide = 0;
  let hovering = false;
  let focused = false;
  let timer;
  let skipOpenUntil = 0;
  let pan;
  let detailMode = false;
  let ownedFullscreen = false;
  let priorFullscreenElement = null;
  let fullscreenPending = false;
  let internalCloseEvents = 0;
  const updatePlayback = () => {
    clearTimeout(timer);
    if (!motionPreference.matches && slides.length > 1 && !hovering && !focused && !document.hidden && !dialog.open) {
      timer = setTimeout(() => changeSlide(activeSlide + 1), 8000);
    }
  };
  const updateViewport = () => {
    const canPan = detailMode && (viewport.scrollWidth > viewport.clientWidth + 1 || viewport.scrollHeight > viewport.clientHeight + 1);
    viewport.classList.toggle('is-pannable', canPan);
    viewport.setAttribute('aria-label', canPan
      ? words('Layout details. Drag, scroll, or use arrow keys to inspect.', '版图细节，可拖动、滚动或使用方向键查看。')
      : words('Complete layout view.', '完整版图。'));
    $('#dialog-hint').textContent = canPan
      ? words('Drag or scroll to inspect · 拖动或滚动查看细节', '拖动或滚动查看细节 · Drag or scroll to inspect')
      : words('Full layout view · 完整版图', '完整版图 · Full layout view');
    $('#dialog-detail').textContent = detailMode ? words('Fit layout', '完整显示') : words('Details', '查看细节');
    $('#dialog-detail').setAttribute('aria-pressed', String(detailMode));
    $('#dialog-detail').setAttribute('aria-label', detailMode ? words('Show the complete layout', '显示完整版图') : words('Inspect original-resolution details', '查看原始分辨率细节'));
    const fullscreenButton = $('#dialog-fullscreen');
    fullscreenButton.hidden = !document.fullscreenEnabled || !!priorFullscreenElement;
    const isOwnedFullscreen = ownedFullscreen && document.fullscreenElement === document.documentElement;
    fullscreenButton.textContent = isOwnedFullscreen ? words('Exit full screen', '退出全屏') : words('Full screen', '全屏');
    fullscreenButton.setAttribute('aria-label', isOwnedFullscreen ? words('Exit full screen', '退出全屏') : words('Enter full screen', '进入全屏'));
  };
  const enterFullscreen = async () => {
    if (!dialog.open || !document.fullscreenEnabled || priorFullscreenElement || document.fullscreenElement || fullscreenPending) return;
    fullscreenPending = true;
    try {
      await document.documentElement.requestFullscreen();
      ownedFullscreen = document.fullscreenElement === document.documentElement;
      if (!dialog.open && ownedFullscreen) {
        ownedFullscreen = false;
        await document.exitFullscreen();
      } else if (dialog.open && ownedFullscreen) {
        // Put the modal above the fullscreen root in the top-layer stack.
        internalCloseEvents += 1;
        dialog.close();
        dialog.showModal();
        viewport.focus({preventScroll:true});
      }
    } catch (_) {
      // The CSS viewport-filling dialog remains available if the browser declines.
    } finally {
      fullscreenPending = false;
      if (dialog.open) updateViewport();
    }
  };
  const renderActiveSlide = () => {
    if (!slides.length) return;
    const slide = slides[activeSlide];
    [$('#hero-layout'), $('#dialog-layout')].forEach(el => {
      if (el.getAttribute('src') !== slide.src) el.src = slide.src;
      el.width = slide.width;
      el.height = slide.height;
      el.alt = localized(slide.alt);
    });
    $('#showcase-artifact').textContent = words('NOVARA / ANALOG LAYOUT', 'NOVARA / 模拟版图');
    $('#showcase-kind').textContent = slide.kind === 'floorplan' ? words('Actual floorplan', '真实布图结果') : words('Actual GDS', '真实 GDS 版图');
    const title = $('#showcase-title');
    title.dataset.en = slide.title.en;
    title.dataset.zh = slide.title.zh;
    title.textContent = localized(slide.title);
    $('#showcase-title-secondary').textContent = language === 'zh' ? slide.title.en : slide.title.zh;
    $('#showcase-title-secondary').lang = language === 'zh' ? 'en' : 'zh-CN';
    showcase.classList.toggle('is-floorplan', slide.kind === 'floorplan');
    showcase.setAttribute('aria-label', words('Design showcase', '版图设计展示'));
    heroTrigger.setAttribute('aria-label', words('Open layout details: ', '查看版图细节：') + localized(slide.title));
    $('#dialog-owner').textContent = slide.owner;
    $('#layout-dialog-title').textContent = localized(slide.title);
    $('#dialog-note').textContent = localized(slide.note);
    $('#showcase-previous').setAttribute('aria-label', words('Previous design', '上一个设计'));
    $('#showcase-next').setAttribute('aria-label', words('Next design', '下一个设计'));
    $('#dialog-close').setAttribute('aria-label', words('Close layout details', '关闭版图细节'));
    if (dialog.open) updateViewport();
    updatePlayback();
  };
  function changeSlide(index, manual = false) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    heroTrigger.classList.add('is-changing');
    renderActiveSlide();
    setTimeout(() => heroTrigger.classList.remove('is-changing'), 200);
    if (manual) $('#showcase-announcement').textContent = localized(slides[activeSlide].title);
  }
  const syncFocus = () => {
    focused = showcase.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    updatePlayback();
  };
  refreshShowcase = renderActiveSlide;
  $('#showcase-previous').addEventListener('click', () => changeSlide(activeSlide - 1, true));
  $('#showcase-next').addEventListener('click', () => changeSlide(activeSlide + 1, true));
  showcase.addEventListener('mouseenter', () => { hovering = true; updatePlayback(); });
  showcase.addEventListener('mouseleave', () => { hovering = false; syncFocus(); });
  showcase.addEventListener('focusin', syncFocus);
  showcase.addEventListener('focusout', () => queueMicrotask(syncFocus));
  document.addEventListener('visibilitychange', updatePlayback);
  motionPreference.addEventListener('change', updatePlayback);
  let touchStart;
  $('#layout-canvas').addEventListener('touchstart', event => {
    if (event.touches.length === 1 && !event.target.closest('.showcase-buttons')) touchStart = {x:event.touches[0].clientX, y:event.touches[0].clientY};
  }, {passive:true});
  $('#layout-canvas').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      skipOpenUntil = performance.now() + 500;
      changeSlide(activeSlide + (dx < 0 ? 1 : -1), true);
    }
    touchStart = undefined;
  }, {passive:true});
  const openDetails = () => {
    if (performance.now() < skipOpenUntil || dialog.open) return;
    detailMode = false;
    ownedFullscreen = false;
    priorFullscreenElement = document.fullscreenElement;
    viewport.classList.remove('is-detail', 'is-pannable', 'is-dragging');
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    updatePlayback();
    updateViewport();
    requestAnimationFrame(() => {
      viewport.focus({preventScroll:true});
      updateViewport();
    });
  };
  heroTrigger.addEventListener('click', openDetails);
  heroTrigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetails(); }
  });
  const finishPan = () => {
    if (!pan) return;
    const pointerId = pan.id;
    pan = undefined;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
  };
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.classList.contains('is-pannable')) return;
    pan = {id:event.pointerId, x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    viewport.focus({preventScroll:true});
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!pan || event.pointerId !== pan.id) return;
    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => viewport.addEventListener(type, finishPan));
  $('#dialog-detail').addEventListener('click', () => {
    finishPan();
    detailMode = !detailMode;
    viewport.classList.toggle('is-detail', detailMode);
    requestAnimationFrame(() => {
      viewport.scrollLeft = detailMode ? Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2) : 0;
      viewport.scrollTop = detailMode ? Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2) : 0;
      viewport.focus({preventScroll:true});
      updateViewport();
    });
  });
  $('#dialog-fullscreen').addEventListener('click', async () => {
    if (ownedFullscreen && document.fullscreenElement === document.documentElement) {
      try { await document.exitFullscreen(); } catch (_) {}
    } else {
      enterFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (ownedFullscreen && document.fullscreenElement !== document.documentElement) ownedFullscreen = false;
    if (dialog.open) requestAnimationFrame(updateViewport);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) { event.preventDefault(); dialog.close(); }
  });
  $('#dialog-layout').addEventListener('load', () => { if (dialog.open) updateViewport(); });
  window.addEventListener('resize', () => { if (dialog.open) updateViewport(); });
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (internalCloseEvents) { internalCloseEvents -= 1; return; }
    finishPan();
    detailMode = false;
    viewport.classList.remove('is-detail', 'is-pannable');
    if (ownedFullscreen && document.fullscreenElement === document.documentElement) {
      ownedFullscreen = false;
      document.exitFullscreen().catch(() => {});
    }
    priorFullscreenElement = null;
    document.body.classList.remove('dialog-open');
    heroTrigger.focus({preventScroll:true});
    syncFocus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  renderActiveSlide();
  window.addEventListener('load', () => slides.slice(1).forEach(slide => { const image = new Image(); image.src = slide.src; }), {once:true});
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }), {threshold:.06});
    document.querySelectorAll('.system,.research-row,.team-title,.team-description').forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }
})();
