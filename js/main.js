/* ============================================================
   main.js - 自転車ルールチェッカー 初期化・イベントバインド
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     DOMContentLoaded 後に初期化
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    /* --- 問題数をタイトル画面に反映 --- */
    var config = window.CONFIG || {};
    var totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
      totalCountEl.textContent = config.questionCount || 25;
    }

    /* --- 広告初期化 --- */
    if (window.Ad) {
      window.Ad.init();
    }

    /* ============================================================
       ゲームスタートボタン
       ============================================================ */
    var btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', function () {
        window.Game.initGame();
        window.UI.showScreen('game');
        window.UI.renderQuestion(window.Game.getCurrentQuestion(), window.Game.getScore());
      });
    }

    /* ============================================================
       「次の問題へ」ボタン
       ============================================================ */
    var btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', function () {
        var hasNext = window.Game.nextQuestion();
        if (hasNext) {
          window.UI.renderQuestion(window.Game.getCurrentQuestion(), window.Game.getScore());
        } else {
          /* ゲーム終了 → 結果画面へ */
          var score      = window.Game.getScore();
          var resultType = window.Game.getResultType();
          window.UI.showScreen('result');
          window.UI.renderResult(score, resultType);

          /* シェアボタン制御 */
          if (window.Share) {
            window.Share.setupShareButton(score, resultType);
          }
        }
      });
    }

    /* ============================================================
       選択肢クリック（イベント委譲）
       ============================================================ */
    var choicesArea = document.getElementById('choices-area');
    if (choicesArea) {
      choicesArea.addEventListener('click', function (e) {
        var btn = e.target.closest('.choice-btn');
        if (!btn || btn.disabled) return;

        var choiceId = btn.dataset.id;
        var result   = window.Game.answer(choiceId);

        window.UI.showFeedback(result.correct, result.question, choiceId);
      });
    }

    /* ============================================================
       リプレイボタン
       ============================================================ */
    var btnReplay = document.getElementById('btn-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', function () {
        window.Game.resetToTitle();
        window.UI.showScreen('title');
      });
    }

  });

}());
