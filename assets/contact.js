// Belora 公式サイト お問合せページ用スクリプト
// 1. タブ切替（個人/企業）
// 2. フォーム送信処理（GAS連携）

(function () {
  'use strict';

  // URLパラメータ ?ref=xxx を全フォームの hidden input[name="ref"] に反映
  // 説明会・キャンペーン別流入元の判別に使用（例: aguh2026 = 愛知学院大学歯学部付属病院 研修医説明会）
  try {
    var refParam = new URLSearchParams(window.location.search).get('ref');
    if (refParam && /^[a-zA-Z0-9_-]{1,32}$/.test(refParam)) {
      var refInputs = document.querySelectorAll('input[name="ref"]');
      for (var i = 0; i < refInputs.length; i++) {
        refInputs[i].value = refParam;
      }
    }
  } catch (e) { /* silent */ }

  window.switchContactTab = function (tabName) {
    var forms = document.querySelectorAll('.contact-form-wrapper');
    for (var i = 0; i < forms.length; i++) {
      forms[i].classList.remove('active');
    }
    var btns = document.querySelectorAll('.contact-tab-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.remove('active');
    }
    var form = document.getElementById('form-' + tabName);
    var btn = document.getElementById('btn-tab-' + tabName);
    if (form) form.classList.add('active');
    if (btn) btn.classList.add('active');
  };

  window.handleFormSubmit = function (event) {
    event.preventDefault();
    var form = event.target;
    var submitBtn = form.querySelector('.submit-btn');
    var originalBtnText = submitBtn.innerText;

    submitBtn.disabled = true;
    submitBtn.innerText = '送信中...';

    var data = new URLSearchParams();
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      data.append(key, value);
    });

    // refをmessage先頭に注入してGAS側の改修なしで識別可能にする
    var refVal = data.get('ref');
    if (refVal) {
      var msg = data.get('message') || '';
      var prefix = '【流入元: ' + refVal + '】\n';
      if (msg.indexOf(prefix) === -1) {
        data.set('message', prefix + msg);
      }
    }

    fetch(form.action, {
      method: 'POST',
      body: data,
      mode: 'no-cors'
    }).then(function () {
      window.location.href = '/thank-you.html';
    }).catch(function (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    });
  };
})();
