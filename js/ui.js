/* ============================================================
   ui.js - 自転車ルールチェッカー UI描画・DOM操作
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     シーンタイプ → CSSクラス のマッピング
     ============================================================ */
  var SCENE_CLASS_MAP = {
    'road_daytime':  'scene-road-daytime',
    'road_night':    'scene-road-night',
    'road_rain':     'scene-road-rain',
    'intersection':  'scene-intersection',
    'sidewalk':      'scene-sidewalk',
    'slope':         'scene-slope',
    'station_area':  'scene-station-area'
  };

  /* シーンクラスを全て除去 */
  var ALL_SCENE_CLASSES = Object.values
    ? Object.values(SCENE_CLASS_MAP)
    : Object.keys(SCENE_CLASS_MAP).map(function (k) { return SCENE_CLASS_MAP[k]; });

  /* ============================================================
     画面切替
     @param {'title'|'game'|'result'} screenName
     ============================================================ */
  function showScreen(screenName) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function (s) {
      s.classList.remove('active');
    });

    var target = document.getElementById('screen-' + screenName);
    if (target) {
      target.classList.add('active');
    }
  }

  /* ============================================================
     問題を描画する
     @param {object} question - QUESTIONS の1要素
     @param {object} score    - { currentIndex, total, ... }
     ============================================================ */
  function renderQuestion(question, score) {
    if (!question) return;

    /* 進捗 */
    var idx       = score.currentIndex;      // 0-based
    var total     = score.total;
    var displayed = idx + 1;                 // 1-based
    var percent   = Math.round((idx / total) * 100);

    var progressText    = document.getElementById('progress-text');
    var progressPercent = document.getElementById('progress-percent');
    var progressFill    = document.getElementById('progress-fill');
    var progressBar     = document.querySelector('.progress-bar');

    if (progressText)    progressText.textContent    = '問題 ' + displayed + ' / ' + total;
    if (progressPercent) progressPercent.textContent = percent + '%';
    if (progressFill)    progressFill.style.width    = percent + '%';
    if (progressBar)     progressBar.setAttribute('aria-valuenow', percent);

    /* シーン */
    var sceneArea = document.getElementById('scene-area');
    if (sceneArea) {
      /* 既存シーンクラスをすべて除去して新しいクラスを付与 */
      ALL_SCENE_CLASSES.forEach(function (cls) { sceneArea.classList.remove(cls); });
      var sceneClass = SCENE_CLASS_MAP[question.scene.type] || 'scene-road-daytime';
      sceneArea.classList.add(sceneClass);

      /* アニメーション再実行のためにクラスを除去してから付与 */
      sceneArea.classList.remove('anim-scene-enter');
      void sceneArea.offsetWidth; /* reflow */
      sceneArea.classList.add('anim-scene-enter');
    }

    var sceneEmoji = document.getElementById('scene-emoji');
    if (sceneEmoji) sceneEmoji.textContent = question.scene.emoji;

    var sceneDesc = document.getElementById('scene-description');
    if (sceneDesc) sceneDesc.textContent = question.scene.description;

    /* 問題文 */
    var questionText = document.getElementById('question-text');
    if (questionText) {
      questionText.textContent = question.question;
      questionText.classList.remove('anim-question-up');
      void questionText.offsetWidth;
      questionText.classList.add('anim-question-up');
    }

    /* フィードバック非表示 */
    var feedbackArea = document.getElementById('feedback-area');
    if (feedbackArea) {
      feedbackArea.hidden = true;
      feedbackArea.classList.remove('is-correct', 'is-wrong', 'anim-feedback-enter');
    }

    /* 選択肢を動的生成 */
    renderChoices(question.choices);

    /* 次の問題へボタンを非表示 */
    var btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.hidden = true;
  }

  /* ============================================================
     選択肢を動的生成
     @param {Array} choices - question.choices
     ============================================================ */
  function renderChoices(choices) {
    var area = document.getElementById('choices-area');
    if (!area) return;

    area.innerHTML = '';

    choices.forEach(function (choice) {
      var btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.dataset.id  = choice.id;
      btn.type        = 'button';

      var label = document.createElement('span');
      label.className     = 'choice-label';
      label.textContent   = choice.id;
      label.setAttribute('aria-hidden', 'true');

      var text = document.createElement('span');
      text.className   = 'choice-text';
      text.textContent = choice.text;

      btn.appendChild(label);
      btn.appendChild(text);
      area.appendChild(btn);
    });
  }

  /* ============================================================
     フィードバックを表示
     @param {boolean} isCorrect
     @param {object}  question
     @param {string}  choiceId - ユーザーが選んだ選択肢ID
     ============================================================ */
  function showFeedback(isCorrect, question, choiceId) {
    /* 選択肢ボタンを全て無効化し、正解・不正解を色分け */
    var allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach(function (btn) {
      btn.disabled = true;
      var correctChoice = question.choices.find(function (c) { return c.correct; });
      if (btn.dataset.id === correctChoice.id) {
        btn.classList.add('is-correct');
      } else if (btn.dataset.id === choiceId && !isCorrect) {
        btn.classList.add('is-wrong');
      }
    });

    /* フィードバックエリアの内容を更新 */
    var feedbackArea    = document.getElementById('feedback-area');
    var feedbackMark    = document.getElementById('feedback-mark');
    var feedbackTitle   = document.getElementById('feedback-title');
    var feedbackText    = document.getElementById('feedback-text');
    var feedbackDetail  = document.getElementById('feedback-detail');
    var feedbackPenalty = document.getElementById('feedback-penalty');
    var retryMessage    = document.getElementById('retry-message');

    if (!feedbackArea) return;

    feedbackArea.classList.remove('is-correct', 'is-wrong', 'anim-flash-correct', 'anim-shake-wrong');

    if (isCorrect) {
      feedbackArea.classList.add('is-correct');
      if (feedbackMark)  feedbackMark.textContent  = '⭕';
      if (feedbackTitle) feedbackTitle.textContent = '正解！';
      if (feedbackText)  feedbackText.textContent  = question.feedback.correct;
    } else {
      feedbackArea.classList.add('is-wrong');
      if (feedbackMark)  feedbackMark.textContent  = '✖';
      if (feedbackTitle) feedbackTitle.textContent = '不正解';
      if (feedbackText)  feedbackText.textContent  = question.feedback.wrong;
    }

    /* 詳細解説・反則金 */
    if (feedbackDetail) {
      feedbackDetail.textContent = question.feedback.detail;
      feedbackDetail.hidden = false;
    }
    if (feedbackPenalty) {
      feedbackPenalty.textContent = question.feedback.penalty;
      feedbackPenalty.hidden = false;
    }

    /* 再挑戦メッセージ */
    if (retryMessage) {
      retryMessage.hidden = isCorrect;
    }

    /* アニメーション付きで表示 */
    feedbackArea.hidden = false;
    void feedbackArea.offsetWidth;
    feedbackArea.classList.add('anim-feedback-enter');

    if (isCorrect) {
      feedbackArea.classList.add('anim-flash-correct');
    } else {
      feedbackArea.classList.add('anim-shake-wrong');
    }

    /* 正解時のみ「次の問題へ」ボタンを表示。不正解時は選択肢を再表示 */
    var btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.hidden = !isCorrect;
    }

    if (!isCorrect) {
      /* 少し待ってから選択肢を再生成（再回答可能にする） */
      setTimeout(function () {
        renderChoices(question.choices);
      }, 800);
    }
  }

  /* ============================================================
     結果画面を描画
     @param {object} score      - { correctCount, missCount, total }
     @param {object} resultType - { emoji, name, message, cssClass }
     ============================================================ */
  function renderResult(score, resultType) {
    /* タイプCSSクラス */
    var resultContent = document.querySelector('.result-content');
    if (resultContent) {
      resultContent.className = 'result-content ' + resultType.cssClass;
    }

    var resultEmoji = document.getElementById('result-emoji');
    if (resultEmoji) resultEmoji.textContent = resultType.emoji;

    var resultTypeName = document.getElementById('result-type-name');
    if (resultTypeName) resultTypeName.textContent = resultType.name;

    var correctCountEl = document.getElementById('correct-count');
    if (correctCountEl) correctCountEl.textContent = score.correctCount;

    var totalQEl = document.getElementById('total-questions-result');
    if (totalQEl) totalQEl.textContent = score.total;

    var missCountEl = document.getElementById('miss-count');
    if (missCountEl) missCountEl.textContent = score.missCount;

    var typeMessage = document.getElementById('type-message');
    if (typeMessage) typeMessage.textContent = resultType.message;

    /* 満点時の紙吹雪 */
    if (score.correctCount === score.total) {
      launchConfetti();
    }
  }

  /* ============================================================
     紙吹雪演出
     ============================================================ */
  function launchConfetti() {
    /* prefers-reduced-motion 確認 */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var colors = ['#F9A825', '#1565C0', '#2E7D32', '#C62828', '#FFFFFF', '#FF8F00'];
    var container = document.createElement('div');
    container.className = 'confetti-container';

    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left     = Math.random() * 100 + 'vw';
      piece.style.top      = '-20px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--duration', (1.5 + Math.random() * 2) + 's');
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      piece.style.width    = (8 + Math.random() * 8) + 'px';
      piece.style.height   = (8 + Math.random() * 8) + 'px';
      container.appendChild(piece);
    }

    document.body.appendChild(container);

    /* 4秒後にコンテナを削除 */
    setTimeout(function () {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 4000);
  }

  /* ============================================================
     公開API
     ============================================================ */
  window.UI = {
    showScreen:    showScreen,
    renderQuestion: renderQuestion,
    showFeedback:   showFeedback,
    renderResult:   renderResult
  };

}());
