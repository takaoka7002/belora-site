// Belora 公式サイト 共通スクリプト
// 1. 医療関係者確認モーダル
// 2. 旧ハッシュURL（#products等）の新URLへのリダイレクト

(function () {
  'use strict';

  // ハッシュURL → 新URL マッピング
  var HASH_REDIRECTS = {
    'top': '/',
    'philosophy': '/philosophy/',
    'products': '/products/',
    'product-4x': '/products/4x/',
    'product-6x': '/products/6x/',
    'product-led': '/products/led/',
    'flow': '/flow/',
    'support': '/support/',
    'company': '/company/',
    'contact': '/contact/',
    'privacy': '/privacy/',
    'legal': '/legal/'
  };

  // 旧ハッシュURLへのアクセスを新URLへリダイレクト
  function handleHashRedirect() {
    var hash = window.location.hash;
    if (!hash) return;
    var key = hash.substring(1);
    if (HASH_REDIRECTS[key]) {
      window.location.replace(HASH_REDIRECTS[key]);
    }
  }

  // 医療関係者確認モーダル
  window.acceptDisclaimer = function () {
    var modal = document.getElementById('medical-disclaimer-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    sessionStorage.setItem('medicalDisclaimerAccepted', 'true');
    setTimeout(function () { modal.style.display = 'none'; }, 500);
  };

  window.rejectDisclaimer = function () {
    var rejectMsg = document.getElementById('reject-message');
    if (rejectMsg) rejectMsg.style.display = 'block';
  };

  document.addEventListener('DOMContentLoaded', function () {
    // ハッシュリダイレクト（TOPに来る前提）
    handleHashRedirect();

    // モーダルの初期表示制御
    var modal = document.getElementById('medical-disclaimer-modal');
    if (modal && sessionStorage.getItem('medicalDisclaimerAccepted')) {
      modal.style.display = 'none';
    }

    // 現在のページに応じてナビゲーション項目をアクティブ化
    var path = window.location.pathname;
    var navMap = {
      '/': 'nav-top',
      '/philosophy/': 'nav-philosophy',
      '/products/': 'nav-products',
      '/products/4x/': 'nav-products',
      '/products/6x/': 'nav-products',
      '/products/led/': 'nav-products',
      '/flow/': 'nav-flow',
      '/support/': 'nav-support',
      '/contact/': 'nav-contact'
    };
    // 末尾スラッシュ正規化
    if (path !== '/' && path.charAt(path.length - 1) !== '/') path += '/';
    var navId = navMap[path];
    if (navId) {
      var navEl = document.getElementById(navId);
      if (navEl) navEl.classList.add('active-nav');
    }

    // スマホでは記事目次を初期状態で閉じる
    if (window.matchMedia('(max-width: 768px)').matches) {
      var tocs = document.querySelectorAll('details.article-toc[open]');
      for (var k = 0; k < tocs.length; k++) {
        tocs[k].removeAttribute('open');
      }
    }

    // モバイル：下にスクロール時にナビ＆ロゴを隠す（上にスクロール時に再表示）
    // ※CSSのメディアクエリで効果はモバイルのみ。デスクトップではclass付与しても見た目変わらない
    var lastScroll = 0;
    var ticking = false;
    var threshold = 80;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      window.requestAnimationFrame(function () {
        var current = window.scrollY || window.pageYOffset;
        if (current > lastScroll && current > threshold) {
          document.body.classList.add('nav-hidden');
        } else if (current < lastScroll - 5 || current <= threshold) {
          document.body.classList.remove('nav-hidden');
        }
        lastScroll = current;
        ticking = false;
      });
      ticking = true;
    }, { passive: true });

    // スクロールリビール演出（IntersectionObserver）
    // 各コンテンツブロック / 記事の見出し・パラグラフを順次フェードイン
    var revealSelectors = [
      '.content-block',
      '.feature-card',
      '.philo-item',
      '.flow-step',
      '.faq-item',
      '.article-body h2',
      '.article-body h3',
      '.article-body p',
      '.article-body blockquote',
      '.article-callout',
      '.article-cta',
      '.article-card'
    ];
    var targets = document.querySelectorAll(revealSelectors.join(','));
    if ('IntersectionObserver' in window && targets.length) {
      targets.forEach(function (el) { el.classList.add('reveal'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }

    // Instagram カルーセル（TOPページのみ）
    // 投稿(.ig-slide)を1件ずつ横スクロール。矢印・ドット・スワイプに対応し、件数は動的に判定。
    var igTrack = document.querySelector('.ig-track');
    if (igTrack) {
      var igCarousel = igTrack.closest('.ig-carousel');
      var slides = igTrack.querySelectorAll('.ig-slide');
      var prevBtn = igCarousel.querySelector('.ig-arrow.prev');
      var nextBtn = igCarousel.querySelector('.ig-arrow.next');
      var dotsWrap = igCarousel.querySelector('.ig-dots');
      var current = 0;
      var dots = [];

      // 現在位置に最も近いスライドを求める
      function nearestSlide() {
        var center = igTrack.scrollLeft + igTrack.clientWidth / 2;
        var idx = 0, min = Infinity;
        for (var i = 0; i < slides.length; i++) {
          var c = slides[i].offsetLeft + slides[i].clientWidth / 2;
          var d = Math.abs(c - center);
          if (d < min) { min = d; idx = i; }
        }
        return idx;
      }

      function goTo(idx) {
        if (idx < 0) idx = 0;
        if (idx > slides.length - 1) idx = slides.length - 1;
        igTrack.scrollTo({ left: slides[idx].offsetLeft, behavior: 'smooth' });
      }

      function updateUI() {
        current = nearestSlide();
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('active', i === current);
        }
        if (prevBtn) prevBtn.disabled = (current === 0);
        if (nextBtn) nextBtn.disabled = (current === slides.length - 1);
      }

      // ドット生成
      for (var s = 0; s < slides.length; s++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.className = 'ig-dot' + (idx === 0 ? ' active' : '');
          dot.type = 'button';
          dot.setAttribute('aria-label', (idx + 1) + '件目の投稿へ');
          dot.addEventListener('click', function () { goTo(idx); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        })(s);
      }

      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

      var igTick = false;
      igTrack.addEventListener('scroll', function () {
        if (igTick) return;
        window.requestAnimationFrame(function () { updateUI(); igTick = false; });
        igTick = true;
      }, { passive: true });

      // 投稿が1件だけのときは操作UIを隠す
      if (slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsWrap) dotsWrap.style.display = 'none';
      }

      updateUI();
    }
  });
})();
