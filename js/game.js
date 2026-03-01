/* ============================================================
   game.js - 自転車ルールチェッカー ゲームロジック
   ステートマシン・スコアリング・シャッフル
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     ステート定義
     ============================================================ */
  var STATE = {
    INIT:            'INIT',
    TITLE:           'TITLE',
    PLAYING:         'PLAYING',
    SCENE_DISPLAY:   'SCENE_DISPLAY',
    CHOICE_DISPLAY:  'CHOICE_DISPLAY',
    FEEDBACK_WRONG:  'FEEDBACK_WRONG',
    FEEDBACK_RIGHT:  'FEEDBACK_RIGHT',
    RESULT:          'RESULT'
  };

  /* ============================================================
     ゲームステート
     ============================================================ */
  var game = {
    state:        STATE.INIT,
    questions:    [],   // シャッフル済み問題（出題順）
    currentIndex: 0,    // 現在の問題インデックス
    correctCount: 0,    // 初回正解数（タイプ診断に使用）
    missCount:    0,    // 累積ミス数
    firstAttempt: true  // 現在問題の初回挑戦フラグ
  };

  /* ============================================================
     Fisher-Yates シャッフル
     ============================================================ */
  function shuffle(array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /* ============================================================
     ゲーム初期化
     ============================================================ */
  function initGame() {
    var config = window.CONFIG || {};
    var count  = config.questionCount || 25;
    var all    = window.QUESTIONS || [];

    var shuffled = shuffle(all);
    game.questions    = shuffled.slice(0, Math.min(count, shuffled.length));
    game.currentIndex = 0;
    game.correctCount = 0;
    game.missCount    = 0;
    game.firstAttempt = true;
    game.state        = STATE.PLAYING;
  }

  /* ============================================================
     現在の問題を取得
     ============================================================ */
  function getCurrentQuestion() {
    return game.questions[game.currentIndex] || null;
  }

  /* ============================================================
     回答処理
     @param {string} choiceId - 選択された選択肢ID ("A"/"B"/"C"/"D")
     @returns {{ correct: boolean, question: object }}
     ============================================================ */
  function answer(choiceId) {
    var q      = getCurrentQuestion();
    var choice = q.choices.find(function (c) { return c.id === choiceId; });
    var isCorrect = choice && choice.correct === true;

    if (isCorrect) {
      if (game.firstAttempt) {
        game.correctCount++;
      }
      game.state = STATE.FEEDBACK_RIGHT;
    } else {
      game.missCount++;
      game.firstAttempt = false;
      game.state = STATE.FEEDBACK_WRONG;
    }

    return { correct: isCorrect, question: q };
  }

  /* ============================================================
     次の問題へ進む
     @returns {boolean} - true: まだ問題がある / false: ゲーム終了
     ============================================================ */
  function nextQuestion() {
    game.currentIndex++;
    game.firstAttempt = true;

    if (game.currentIndex >= game.questions.length) {
      game.state = STATE.RESULT;
      return false;
    }

    game.state = STATE.SCENE_DISPLAY;
    return true;
  }

  /* ============================================================
     タイプ診断
     @returns {{ emoji: string, name: string, message: string, cssClass: string }}
     ============================================================ */
  function getResultType() {
    var total  = game.questions.length;
    var rate   = total > 0 ? game.correctCount / total : 0;

    if (rate >= 1.0) {
      return {
        emoji:    '🏆',
        name:     '完璧な自転車市民',
        message:  '完璧なルール知識で安全な自転車ライフを！',
        cssClass: 'result-type--perfect'
      };
    } else if (rate >= 0.9) {
      return {
        emoji:    '✅',
        name:     '安全運転ライダー',
        message:  'ほぼ完璧です！少しの見直しでさらに安全に。',
        cssClass: 'result-type--safe'
      };
    } else if (rate >= 0.7) {
      return {
        emoji:    '⚠️',
        name:     'もう少し注意が必要',
        message:  'いくつか見落としがありました。もう一度確認を！',
        cssClass: 'result-type--caution'
      };
    } else {
      return {
        emoji:    '🚨',
        name:     '危険走行予備軍',
        message:  '反則金リスクが高い状態です。ぜひ再チャレンジを！',
        cssClass: 'result-type--danger'
      };
    }
  }

  /* ============================================================
     ゲームスコアを返す
     ============================================================ */
  function getScore() {
    return {
      correctCount: game.correctCount,
      missCount:    game.missCount,
      total:        game.questions.length,
      currentIndex: game.currentIndex
    };
  }

  /* ============================================================
     タイトルへ戻る（リプレイ）
     ============================================================ */
  function resetToTitle() {
    game.state        = STATE.TITLE;
    game.questions    = [];
    game.currentIndex = 0;
    game.correctCount = 0;
    game.missCount    = 0;
    game.firstAttempt = true;
  }

  /* ============================================================
     公開API
     ============================================================ */
  window.Game = {
    STATE:              STATE,
    game:               game,
    initGame:           initGame,
    getCurrentQuestion: getCurrentQuestion,
    answer:             answer,
    nextQuestion:       nextQuestion,
    getResultType:      getResultType,
    getScore:           getScore,
    resetToTitle:       resetToTitle
  };

}());
