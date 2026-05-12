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
  });
})();
