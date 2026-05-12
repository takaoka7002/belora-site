// Belora 公式サイト お問合せページ用スクリプト
// 1. タブ切替（個人/企業）
// 2. フォーム送信処理（GAS連携）

(function () {
  'use strict';

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
