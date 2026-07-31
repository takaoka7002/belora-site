// Belora 公式サイト SUPPORTページ 修理・メンテナンス申込フォーム用スクリプト
// メンバーシップ非会員向け。会員は care.belora.jp/repair から申し込む。
//
// GAS側（お問合せフォームと共用のエンドポイント）は name / email / phone / message /
// form-name / inquiry_type の6項目を前提に組まれているため、修理固有の項目
// （対象製品・依頼内容・シリアル番号など）は message に整形して詰めて送る。
// これによりGAS側の改修なしで全項目がメール本文に載る。

(function () {
  'use strict';

  window.handleRepairFormSubmit = function (event) {
    event.preventDefault();

    var form = event.target;
    var submitBtn = form.querySelector('.submit-btn');
    var originalBtnText = submitBtn.innerText;

    submitBtn.disabled = true;
    submitBtn.innerText = '送信中...';

    var formData = new FormData(form);
    var one = function (key) {
      var v = formData.get(key);
      return v ? String(v).trim() : '';
    };
    var many = function (key) {
      return formData.getAll(key).join('／');
    };

    var body = [
      '【修理・メンテナンスのお申し込み（メンバーシップ非会員）】',
      '',
      '対象製品：' + (one('product') || '未選択'),
      'ご依頼内容：' + (many('repair_type') || '未選択'),
      'シリアル番号：' + (one('serial') || '未記入'),
      'ご購入時期：' + (one('purchased_at') || '未記入'),
      '医療機関名・ご所属：' + (one('clinic') || '未記入'),
      '',
      '■ 症状・ご希望内容',
      one('detail')
    ].join('\n');

    var data = new URLSearchParams();
    data.append('form-name', 'support-repair-nonmember');
    data.append('inquiry_type', '修理・メンテナンスのお申し込み（非会員）');
    data.append('name', one('name'));
    data.append('email', one('email'));
    data.append('phone', one('phone'));
    data.append('message', body);

    try { console.log('[Belora repair] payload:', Object.fromEntries(data)); } catch (e) {}

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
