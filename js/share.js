/* ============================================================
   share.js - 自転車ルールチェッカー SNSシェア機能
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     シェアテキストを生成
     ============================================================ */
  function buildShareText(score, resultType) {
    var config   = window.CONFIG || {};
    var template = config.shareTextTemplate ||
      "2026年4月施行の自転車反則通告制度チェッカーで{total}問中{score}問正解！ミス{miss}回。診断結果：{type}";

    return template
      .replace('{total}', score.total)
      .replace('{score}', score.correctCount)
      .replace('{miss}',  score.missCount)
      .replace('{type}',  resultType.emoji + resultType.name);
  }

  /* ============================================================
     Xシェア用URLを生成
     ============================================================ */
  function buildXShareUrl(score, resultType) {
    var config   = window.CONFIG || {};
    var text     = buildShareText(score, resultType);
    var hashtags = (config.shareHashtags || []).join(',');
    var url      = config.shareUrl || '';

    var params = new URLSearchParams({
      text: text + (url ? '\n' + url : ''),
      hashtags: hashtags
    });

    return 'https://twitter.com/intent/tweet?' + params.toString();
  }

  /* ============================================================
     シェアボタンの表示制御と設定
     ============================================================ */
  function setupShareButton(score, resultType) {
    var config    = window.CONFIG || {};
    var shareArea = document.getElementById('share-area');
    var btnShare  = document.getElementById('btn-share');

    if (!shareArea || !btnShare) return;

    if (!config.shareUrl) {
      shareArea.hidden = true;
      return;
    }

    shareArea.hidden = false;

    /* 既存のリスナーを除去するためにクローンで置き換え */
    var newBtn = btnShare.cloneNode(true);
    btnShare.parentNode.replaceChild(newBtn, btnShare);

    newBtn.addEventListener('click', function () {
      var xUrl = buildXShareUrl(score, resultType);
      window.open(xUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    });
  }

  /* ============================================================
     公開API
     ============================================================ */
  window.Share = {
    setupShareButton: setupShareButton
  };

}());
