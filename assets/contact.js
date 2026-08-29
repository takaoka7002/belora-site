// Belora 公式サイト お問合せページ用スクリプト
// 1. タブ切替（個人/企業）
// 2. フォーム送信処理（GAS連携）

(function () {
  'use strict';

  // ページを開いた時刻。入力にかかった時間の測定に使う（同じ端末の時計どうしで比較する）
  var beloraPageLoadedAt = Date.now();

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
      var tag = '[ref:' + refVal + ']';
      if (msg.indexOf(tag) === -1) {
        data.set('message', tag + '\n' + msg);
      }
    }

    // ボット対策
    // (1) ハニーポットに入力があれば送信しない（人には見えない欄のため）
    if ((data.get('company_website') || '').trim() !== '') {
      window.location.href = '/thank-you.html';
      return;
    }
    // (2) 送信時刻とトークンを添える。
    //     静的HTMLだけを読んでGASへ直接POSTするボットはこの値を作れない。
    //     GAS側で form_token が base64('belora:' + form_ts) と一致するかを検証する。
    var nowTs = Date.now();
    data.set('form_ts', String(nowTs));
    try {
      data.set('form_token', btoa('belora:' + nowTs));
    } catch (e) { /* silent */ }
    // (3) ページを開いてから送信するまでの秒数。必ずこちら側で測る。
    //     GAS側がサーバ時計と form_ts を引き算すると常に0秒になり、
    //     正規のお問合せまで「速すぎる＝自動入力」と誤判定される（2026-08-29の不具合）。
    data.set('form_elapsed', String(nowTs - beloraPageLoadedAt));

    // diagnostic: 開発者ツールConsoleで実送信内容を確認できる
    try { console.log('[Belora contact] payload:', Object.fromEntries(data)); } catch (e) {}

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
