/* ============================================================
   ad.js - 自転車ルールチェッカー 広告制御
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     広告エリアにHTMLを挿入し、表示制御する
     ============================================================ */
  function init() {
    var config   = window.CONFIG || {};
    var adCode   = config.adCode   || '';
    var position = config.adPosition || 'bottom';

    if (!adCode) {
      /* 広告なし：エリアを非表示のまま */
      return;
    }

    /* 挿入対象エリアを決定 */
    var titleAdEl  = document.getElementById('ad-title');
    var resultAdEl = document.getElementById('ad-result');

    var showTop    = (position === 'top'    || position === 'both');
    var showBottom = (position === 'bottom' || position === 'both');

    if (showTop && titleAdEl) {
      titleAdEl.innerHTML = adCode;
      titleAdEl.hidden    = false;
    }

    if (showBottom && resultAdEl) {
      resultAdEl.innerHTML = adCode;
      resultAdEl.hidden    = false;
    }
  }

  /* ============================================================
     公開API
     ============================================================ */
  window.Ad = {
    init: init
  };

}());
