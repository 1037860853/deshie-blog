/* ============================================
   danmaku.js — 弹幕留言模块
   弹幕内容来源于 guestbook 留言数据
   ============================================ */

var Danmaku = (function() {
  'use strict';

  var U = AppUtils;
  var $stage;
  var $count;
  var timer = null;
  var messageSource = null; /* 留言数据源引用，由 Guestbook 模块注入 */

  function init() {
    $stage = U.el('danmakuStage');
    $count = U.el('danmakuCount');
    start();
  }

  /**
   * 设置留言数据源（由 Guestbook 调用）
   */
  function setMessageSource(sourceFn) {
    messageSource = sourceFn;
  }

  /**
   * 获取当前所有留言文本
   */
  function getMessages() {
    if (messageSource) {
      return messageSource();
    }
    /* fallback */
    return AppConfig.PRESET_MESSAGES || [];
  }

  /**
   * 发射一条弹幕
   */
  function launch(msg) {
    if (!$stage) { return; }

    var el = document.createElement('div');
    el.className = 'danmaku-msg';

    /* 格式：昵称：内容 */
    var author = msg.author || '匿名';
    var text = msg.text || '';
    el.innerHTML = '<span class="danmaku-msg__author">' + U.escapeHtml(author) + '</span>：'
      + U.escapeHtml(text);

    /* 随机纵向位置 */
    var stageHeight = $stage.clientHeight;
    var fontSize = 15;
    var lineHeight = 28;
    var maxLines = Math.max(1, Math.floor(stageHeight / lineHeight));
    var line = Math.floor(Math.random() * maxLines);
    var top = line * lineHeight + Math.random() * 10;
    el.style.top = Math.min(top, stageHeight - lineHeight) + 'px';

    /* 随机速度 */
    var dur = 8 + Math.random() * 10;
    el.style.animationDuration = dur + 's';

    $stage.appendChild(el);

    /* 动画结束后移除 */
    el.addEventListener('animationend', function() {
      if (el.parentNode) { el.parentNode.removeChild(el); }
    });
  }

  /**
   * 启动弹幕循环
   */
  function start() {
    if (timer) { clearTimeout(timer); }

    function scheduleNext() {
      var msgs = getMessages();
      if (msgs.length > 0) {
        var msg = msgs[Math.floor(Math.random() * msgs.length)];
        launch(msg);
      }
      /* 更新计数 */
      if ($count) {
        $count.textContent = msgs.length + ' 条留言';
      }
      var delay = 1500 + Math.random() * 3500;
      timer = setTimeout(scheduleNext, delay);
    }

    scheduleNext();
  }

  /**
   * 刷新弹幕（留言数据变化时调用）
   */
  function refresh() {
    if (timer) { clearTimeout(timer); }
    start();
  }

  return {
    init: init,
    setMessageSource: setMessageSource,
    refresh: refresh,
  };

})();
